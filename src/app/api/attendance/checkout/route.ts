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

      // Build the daily report
      const report = {
        date: now.toISOString().split("T")[0],
        userName: `${user.firstName} ${user.lastName}`,
        checkIn: activeSession.checkInAt.toISOString(),
        checkOut: now.toISOString(),
        location: activeSession.workLocation,
        totalHours: (totalMinutes / 60).toFixed(1),
        activeHours: (activeMinutes / 60).toFixed(1),
        breakHours: (breakMinutes / 60).toFixed(1),
        idleHours: (idleMinutes / 60).toFixed(1),
        breakCount: activeSession.breaks.length,
        summary: summary || "No summary provided",
        activities: allActivities.map((a) => ({
          type: a.type,
          startedAt: a.startedAt.toISOString(),
          endedAt: a.endedAt?.toISOString(),
          duration: a.durationMin,
          description: a.description,
        })),
      };

      // Update session - store report JSON in checkOutSummary
      const updated = await tx.employeeWorkSession.update({
        where: { id: activeSession.id },
        data: {
          checkOutAt: now,
          checkOutSummary: JSON.stringify(report),
          status: "CHECKED_OUT",
          totalMinutes,
          activeMinutes,
          idleMinutes,
          breakMinutes,
        },
      });

      // Log check-out as a CRM Activity
      await tx.activity.create({
        data: {
          type: "CHECK_OUT",
          title: `${user.firstName} checked out after ${totalMinutes} minutes`,
          content: summary || null,
          userId: user.id,
          metadata: JSON.stringify({
            sessionId: activeSession.id,
            totalMinutes,
            activeMinutes,
            breakMinutes,
            idleMinutes,
          }),
        },
      });

      return { session: updated, report };
    });

    return NextResponse.json({
      message: "Checked out successfully",
      session: result.session,
      report: result.report,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Failed to check out" },
      { status: 500 }
    );
  }
}
