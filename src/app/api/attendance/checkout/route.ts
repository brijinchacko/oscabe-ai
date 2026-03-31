import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const { summary } = await request.json();

    const activeSession = await prisma.employeeWorkSession.findFirst({
      where: {
        userId: user.id,
        status: { in: ["CHECKED_IN", "ON_BREAK", "IDLE"] },
      },
      include: {
        activities: true,
        breaks: true,
      },
    });

    if (!activeSession) {
      return NextResponse.json(
        { error: "No active session found" },
        { status: 400 }
      );
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      // End all open activities
      const openActivities = await tx.employeeActivity.findMany({
        where: { sessionId: activeSession.id, endedAt: null },
      });

      for (const activity of openActivities) {
        const durationMs = now.getTime() - activity.startedAt.getTime();
        await tx.employeeActivity.update({
          where: { id: activity.id },
          data: {
            endedAt: now,
            durationMin: Math.round(durationMs / (1000 * 60)),
          },
        });
      }

      // End all open breaks
      const openBreaks = await tx.employeeBreak.findMany({
        where: { sessionId: activeSession.id, endedAt: null },
      });

      for (const brk of openBreaks) {
        await tx.employeeBreak.update({
          where: { id: brk.id },
          data: { endedAt: now },
        });
      }

      // Fetch all activities for this session to calculate totals
      const allActivities = await tx.employeeActivity.findMany({
        where: { sessionId: activeSession.id },
      });

      let activeMinutes = 0;
      let idleMinutes = 0;
      let breakMinutes = 0;

      for (const act of allActivities) {
        const end = act.endedAt || now;
        const dur = Math.round(
          (end.getTime() - act.startedAt.getTime()) / (1000 * 60)
        );
        if (act.type === "ACTIVE") activeMinutes += dur;
        else if (act.type === "IDLE") idleMinutes += dur;
        else if (act.type === "BREAK") breakMinutes += dur;
      }

      const totalMinutes = Math.round(
        (now.getTime() - activeSession.checkInAt.getTime()) / (1000 * 60)
      );

      // Update session
      const updated = await tx.employeeWorkSession.update({
        where: { id: activeSession.id },
        data: {
          checkOutAt: now,
          checkOutSummary: summary || null,
          status: "CHECKED_OUT",
          totalMinutes,
          activeMinutes,
          idleMinutes,
          breakMinutes,
        },
      });

      return updated;
    });

    return NextResponse.json({
      message: "Checked out successfully",
      session: result,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to check out" },
      { status: 500 }
    );
  }
}
