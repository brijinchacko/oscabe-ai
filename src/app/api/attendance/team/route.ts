import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    // Role-based visibility
    let roleFilter: object;
    if (user.role === "ADMIN") {
      // ADMIN sees everyone except other ADMINs
      roleFilter = { role: { not: "ADMIN" } };
    } else if (user.role === "RECRUITER") {
      // RECRUITER sees everyone except ADMINs
      roleFilter = { role: { not: "ADMIN" } };
    } else {
      // Others see only themselves
      roleFilter = { id: user.id };
    }

    const teamMembers = await prisma.user.findMany({
      where: {
        isActive: true,
        ...roleFilter,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        workSessions: {
          where: {
            status: { in: ["CHECKED_IN", "ON_BREAK", "IDLE"] },
          },
          include: {
            activities: true,
            breaks: true,
          },
          take: 1,
          orderBy: { checkInAt: "desc" },
        },
      },
    });

    const now = new Date();

    const result = teamMembers.map((member) => {
      const activeSession = member.workSessions[0] || null;

      let currentStatus = "OFFLINE";
      let checkInTime: string | null = null;
      let workLocation: string | null = null;
      let totalActiveMinutes = 0;
      let totalBreakMinutes = 0;
      let totalIdleMinutes = 0;
      let breakCount = 0;

      if (activeSession) {
        currentStatus = activeSession.status;
        checkInTime = activeSession.checkInAt.toISOString();
        workLocation = activeSession.workLocation;
        breakCount = activeSession.breaks.length;

        for (const act of activeSession.activities) {
          const end = act.endedAt || now;
          const dur = Math.round(
            (end.getTime() - act.startedAt.getTime()) / (1000 * 60)
          );
          if (act.type === "ACTIVE") totalActiveMinutes += dur;
          else if (act.type === "BREAK") totalBreakMinutes += dur;
          else if (act.type === "IDLE") totalIdleMinutes += dur;
        }
      }

      return {
        id: member.id,
        name: [member.firstName, member.lastName]
          .filter(Boolean)
          .join(" ") || "Unknown",
        role: member.role,
        avatar: member.avatarUrl,
        currentStatus,
        checkInTime,
        workLocation,
        totalActiveMinutes,
        totalBreakMinutes,
        totalIdleMinutes,
        breakCount,
      };
    });

    return NextResponse.json({ team: result });
  } catch (error) {
    console.error("Team attendance error:", error);
    return NextResponse.json(
      { error: "Failed to fetch team attendance" },
      { status: 500 }
    );
  }
}
