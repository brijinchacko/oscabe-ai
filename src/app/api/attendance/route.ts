import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

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

    // Map to frontend-expected format
    const session = activeSession ? {
      id: activeSession.id,
      status: activeSession.status,
      location: activeSession.workLocation,
      checkInAt: activeSession.checkInAt.toISOString(),
      note: activeSession.checkInNote,
      breakStartedAt: activeSession.breaks?.find((b: { endedAt: Date | null }) => !b.endedAt)?.startedAt?.toISOString(),
    } : null;

    return NextResponse.json({ session, activeSession, todaySessions });
  } catch (error) {
    console.error("Attendance GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const workLocation = body.workLocation || body.location || "HOME";
    const note = body.note || body.checkInNote || null;

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

    const mappedSession = {
      id: result.id,
      status: result.status,
      location: result.workLocation,
      checkInAt: result.checkInAt.toISOString(),
      note: result.checkInNote,
    };
    return NextResponse.json(
      { message: "Checked in successfully", session: mappedSession },
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
