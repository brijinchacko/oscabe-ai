import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  try {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

    const activeSession = await prisma.employeeWorkSession.findFirst({
      where: {
        userId: user.id,
        status: { in: ["CHECKED_IN", "ON_BREAK", "IDLE"] },
      },
      include: {
        activities: { orderBy: { startedAt: "desc" } },
        breaks: { orderBy: { startedAt: "desc" } },
      },
    });

    const todaySessions = await prisma.employeeWorkSession.findMany({
      where: {
        userId: user.id,
        date: { gte: startOfDay, lt: endOfDay },
      },
      include: {
        activities: { orderBy: { startedAt: "asc" } },
        breaks: { orderBy: { startedAt: "asc" } },
      },
      orderBy: { checkInAt: "desc" },
    });

    return NextResponse.json({ activeSession, todaySessions });
  } catch (error) {
    console.error("Attendance GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  try {
    const { workLocation, note } = await request.json();

    // Validate no active session exists
    const existingSession = await prisma.employeeWorkSession.findFirst({
      where: {
        userId: user.id,
        status: { in: ["CHECKED_IN", "ON_BREAK", "IDLE"] },
      },
    });

    if (existingSession) {
      return NextResponse.json(
        { error: "You already have an active session. Please check out first." },
        { status: 400 }
      );
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const workSession = await tx.employeeWorkSession.create({
        data: {
          userId: user.id,
          date: now,
          checkInAt: now,
          workLocation: workLocation || "HOME",
          checkInNote: note || null,
          status: "CHECKED_IN",
        },
      });

      await tx.employeeActivity.create({
        data: {
          sessionId: workSession.id,
          type: "ACTIVE",
          startedAt: now,
        },
      });

      return workSession;
    });

    return NextResponse.json(
      { message: "Checked in successfully", session: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Attendance POST error:", error);
    return NextResponse.json(
      { error: "Failed to check in" },
      { status: 500 }
    );
  }
}
