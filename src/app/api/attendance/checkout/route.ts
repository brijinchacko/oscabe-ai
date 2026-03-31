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

      // Query CRM Activity records created by this user today
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const crmActivities = await tx.activity.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: startOfDay, lt: endOfDay },
          type: { notIn: ["CHECK_IN", "CHECK_OUT", "SYSTEM_CONFIG"] },
        },
      });

      // Group CRM activities by type and count
      const crmCounts: Record<string, number> = {};
      for (const act of crmActivities) {
        crmCounts[act.type] = (crmCounts[act.type] || 0) + 1;
      }

      // Calculate productivity score
      const pointsMap: Record<string, number> = {
        CANDIDATE_ADDED: 5, CANDIDATE_SOURCED: 5, CANDIDATE_CREATE: 5,
        EMAIL: 3, EMAIL_SENT: 3, EMAIL_SEND: 3,
        CALL: 5, PHONE_CALL: 5, CALL_LOGGED: 5,
        NOTE: 2, NOTE_ADDED: 2, NOTE_CREATE: 2,
        APPLICATION: 10, APPLICATION_SUBMITTED: 10, APPLICATION_CREATE: 10,
        INTERVIEW: 15, INTERVIEW_SCHEDULED: 15, INTERVIEW_CREATE: 15,
        CLIENT_CONTACT: 5, CLIENT_MEETING: 5, CLIENT_CALL: 5,
      };
      let productivityScore = 0;
      for (const [type, count] of Object.entries(crmCounts)) {
        productivityScore += (pointsMap[type.toUpperCase()] || 1) * count;
      }

      // Format activity summary string
      const typeLabels: Record<string, string> = {
        EMAIL: "emails sent", EMAIL_SENT: "emails sent", EMAIL_SEND: "emails sent",
        CALL: "calls made", PHONE_CALL: "calls made", CALL_LOGGED: "calls made",
        CANDIDATE_ADDED: "candidates sourced", CANDIDATE_SOURCED: "candidates sourced", CANDIDATE_CREATE: "candidates sourced",
        NOTE: "notes written", NOTE_ADDED: "notes written", NOTE_CREATE: "notes written",
        APPLICATION: "applications submitted", APPLICATION_SUBMITTED: "applications submitted",
        INTERVIEW: "interviews scheduled", INTERVIEW_SCHEDULED: "interviews scheduled",
        CLIENT_CONTACT: "clients contacted", CLIENT_MEETING: "client meetings",
      };
      const activitySummaryParts: string[] = [];
      for (const [type, count] of Object.entries(crmCounts)) {
        const label = typeLabels[type.toUpperCase()] || type.toLowerCase().replace(/_/g, " ");
        activitySummaryParts.push(`${count} ${label}`);
      }
      const activitySummaryStr = activitySummaryParts.length > 0
        ? `Today's Activity: ${activitySummaryParts.join(", ")}`
        : "No CRM activity recorded today";

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
        crmActivitySummary: activitySummaryStr,
        crmActivityBreakdown: crmCounts,
        productivityScore,
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
