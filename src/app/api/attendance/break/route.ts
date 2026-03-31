import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

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

        // Log break start as a CRM Activity
        await tx.activity.create({
          data: {
            type: "BREAK_START",
            title: `${user.firstName} started a break`,
            content: reason || null,
            userId: user.id,
            metadata: JSON.stringify({
              sessionId: activeSession.id,
              reason: reason || null,
              time: now.toISOString(),
            }),
          },
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

      let breakDurationMin = 0;
      if (openBreak) {
        breakDurationMin = Math.round(
          (now.getTime() - openBreak.startedAt.getTime()) / (1000 * 60)
        );
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

      // Log break end as a CRM Activity
      await tx.activity.create({
        data: {
          type: "BREAK_END",
          title: `${user.firstName} ended break after ${breakDurationMin} minutes`,
          content: null,
          userId: user.id,
          metadata: JSON.stringify({
            sessionId: activeSession.id,
            breakDurationMin,
            time: now.toISOString(),
          }),
        },
      });
    });

    return NextResponse.json({ message: "Break ended" });
  } catch (err) {
    console.error("Break error:", err);
    return NextResponse.json(
      { error: "Failed to process break" },
      { status: 500 }
    );
  }
}
