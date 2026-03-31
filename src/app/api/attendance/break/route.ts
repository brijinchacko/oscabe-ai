import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

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
    const { action, reason } = await request.json();

    if (action !== "start" && action !== "end") {
      return NextResponse.json(
        { error: "Invalid action. Must be 'start' or 'end'." },
        { status: 400 }
      );
    }

    const activeSession = await prisma.employeeWorkSession.findFirst({
      where: {
        userId: user.id,
        status: { in: ["CHECKED_IN", "ON_BREAK", "IDLE"] },
      },
    });

    if (!activeSession) {
      return NextResponse.json(
        { error: "No active session found" },
        { status: 400 }
      );
    }

    const now = new Date();

    if (action === "start") {
      if (activeSession.status === "ON_BREAK") {
        return NextResponse.json(
          { error: "Already on break" },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx) => {
        // End any open activity
        const openActivity = await tx.employeeActivity.findFirst({
          where: { sessionId: activeSession.id, endedAt: null },
          orderBy: { startedAt: "desc" },
        });

        if (openActivity) {
          const durationMs =
            now.getTime() - openActivity.startedAt.getTime();
          await tx.employeeActivity.update({
            where: { id: openActivity.id },
            data: {
              endedAt: now,
              durationMin: Math.round(durationMs / (1000 * 60)),
            },
          });
        }

        // Create BREAK activity
        await tx.employeeActivity.create({
          data: {
            sessionId: activeSession.id,
            type: "BREAK",
            startedAt: now,
            description: reason || null,
          },
        });

        // Create EmployeeBreak
        await tx.employeeBreak.create({
          data: {
            sessionId: activeSession.id,
            startedAt: now,
            reason: reason || null,
          },
        });

        // Set status ON_BREAK
        await tx.employeeWorkSession.update({
          where: { id: activeSession.id },
          data: { status: "ON_BREAK" },
        });
      });

      return NextResponse.json({ message: "Break started" });
    }

    // action === "end"
    if (activeSession.status !== "ON_BREAK") {
      return NextResponse.json(
        { error: "Not currently on break" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // End open EmployeeBreak
      const openBreak = await tx.employeeBreak.findFirst({
        where: { sessionId: activeSession.id, endedAt: null },
        orderBy: { startedAt: "desc" },
      });

      if (openBreak) {
        await tx.employeeBreak.update({
          where: { id: openBreak.id },
          data: { endedAt: now },
        });
      }

      // End BREAK activity
      const breakActivity = await tx.employeeActivity.findFirst({
        where: {
          sessionId: activeSession.id,
          type: "BREAK",
          endedAt: null,
        },
        orderBy: { startedAt: "desc" },
      });

      if (breakActivity) {
        const durationMs =
          now.getTime() - breakActivity.startedAt.getTime();
        await tx.employeeActivity.update({
          where: { id: breakActivity.id },
          data: {
            endedAt: now,
            durationMin: Math.round(durationMs / (1000 * 60)),
          },
        });
      }

      // Create new ACTIVE activity
      await tx.employeeActivity.create({
        data: {
          sessionId: activeSession.id,
          type: "ACTIVE",
          startedAt: now,
        },
      });

      // Set status CHECKED_IN
      await tx.employeeWorkSession.update({
        where: { id: activeSession.id },
        data: { status: "CHECKED_IN" },
      });
    });

    return NextResponse.json({ message: "Break ended" });
  } catch (error) {
    console.error("Break error:", error);
    return NextResponse.json(
      { error: "Failed to process break" },
      { status: 500 }
    );
  }
}
