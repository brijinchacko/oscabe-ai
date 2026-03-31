import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";

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

    // Role-based visibility: ADMIN sees everyone, RECRUITER sees everyone except ADMIN
    let roleFilter: object;
    if (user.role === "ADMIN") {
      roleFilter = { role: { in: ["ADMIN", "RECRUITER"] } };
    } else if (user.role === "RECRUITER") {
      roleFilter = { role: { in: ["RECRUITER"] } };
    } else {
      roleFilter = { id: user.id };
    }

    // Query ALL users matching the role filter
    const allUsers = await prisma.user.findMany({
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
      },
    });

    // For each user, check for active session today
    const result = await Promise.all(
      allUsers.map(async (member) => {
        // Check for an active (non-checked-out) session
        const activeSession = await prisma.employeeWorkSession.findFirst({
          where: {
            userId: member.id,
            status: { in: ["CHECKED_IN", "ON_BREAK", "IDLE"] },
          },
          include: {
            activities: true,
            breaks: true,
          },
          orderBy: { checkInAt: "desc" },
        });

        let currentStatus = "OFFLINE";
        let checkInTime: string | null = null;
        let workLocation: string | null = null;
        let totalActiveMinutes = 0;
        let totalBreakMinutes = 0;
        let totalIdleMinutes = 0;
        let breakCount = 0;
        let lastCheckIn: string | null = null;

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
        } else {
          // No active session - find the most recent session for last check-in info
          const lastSession = await prisma.employeeWorkSession.findFirst({
            where: { userId: member.id },
            orderBy: { checkInAt: "desc" },
            select: { checkInAt: true },
          });
          if (lastSession) {
            lastCheckIn = lastSession.checkInAt.toISOString();
          }
        }

        return {
          id: member.id,
          name:
            [member.firstName, member.lastName].filter(Boolean).join(" ") ||
            "Unknown",
          role: member.role,
          avatar: member.avatarUrl,
          currentStatus,
          checkInTime,
          workLocation,
          totalActiveMinutes,
          totalBreakMinutes,
          totalIdleMinutes,
          breakCount,
          lastCheckIn,
        };
      })
    );

    return NextResponse.json({ team: result });
  } catch (err) {
    console.error("Team attendance error:", err);
    return NextResponse.json(
      { error: "Failed to fetch team attendance" },
      { status: 500 }
    );
  }
}
