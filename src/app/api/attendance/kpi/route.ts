import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

function getWorkingDays(start: Date, end: Date): number {
  let count = 0;
  const d = new Date(start);
  while (d <= end) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const isAdmin = user!.role === "ADMIN";
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "week";
  const targetUserId = searchParams.get("userId");

  const now = new Date();
  let start: Date;

  if (period === "month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    // week
    start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
  }

  try {
    // Get team members (all recruiters/admins)
    const teamMembers = await prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "RECRUITER"] },
        isActive: true,
        ...(targetUserId && isAdmin ? { id: targetUserId } : {}),
        ...(!isAdmin ? { id: user!.id } : {}),
      },
      select: { id: true, firstName: true, lastName: true },
    });

    const workingDays = getWorkingDays(start, now);
    const expectedHoursPerDay = 7.5;

    // Get all sessions for the period
    const sessions = await prisma.employeeWorkSession.findMany({
      where: {
        userId: { in: teamMembers.map((m) => m.id) },
        date: { gte: start, lte: now },
      },
      include: {
        activities: true,
        breaks: true,
      },
      orderBy: { date: "asc" },
    });

    // Per-user metrics
    const teamComparison = teamMembers.map((member) => {
      const memberSessions = sessions.filter((s) => s.userId === member.id);
      const name = `${member.firstName || ""} ${member.lastName || ""}`.trim() || "Unknown";

      // Days worked
      const uniqueDays = new Set(
        memberSessions.map((s) => new Date(s.date).toISOString().slice(0, 10))
      );
      const daysWorked = uniqueDays.size;

      // Total hours
      let totalMinutes = 0;
      let totalIdleMinutes = 0;
      let totalBreakMinutes = 0;
      let totalActiveMinutes = 0;
      let lateCount = 0;
      let earlyCount = 0;
      let consecutiveLate = 0;
      let maxConsecutiveLate = 0;
      let ghostPresenceDays: string[] = [];
      let excessiveIdleDays: string[] = [];
      let missingDays: string[] = [];

      // Sort sessions by date
      const sortedSessions = [...memberSessions].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      for (const s of sortedSessions) {
        const mins = s.totalMinutes || 0;
        totalMinutes += mins;
        totalIdleMinutes += s.idleMinutes || 0;
        totalBreakMinutes += s.breakMinutes || 0;
        totalActiveMinutes += s.activeMinutes || 0;

        // Late check-in (after 10:00 AM)
        const checkInHour = new Date(s.checkInAt).getHours();
        const checkInMin = new Date(s.checkInAt).getMinutes();
        if (checkInHour > 10 || (checkInHour === 10 && checkInMin > 0)) {
          lateCount++;
          consecutiveLate++;
          maxConsecutiveLate = Math.max(maxConsecutiveLate, consecutiveLate);
        } else {
          consecutiveLate = 0;
        }

        // Early departure (before 5:00 PM / 17:00)
        if (s.checkOutAt) {
          const checkOutHour = new Date(s.checkOutAt).getHours();
          if (checkOutHour < 17) {
            earlyCount++;
          }
        }

        // Excessive idle time (>2 hours in a day)
        if ((s.idleMinutes || 0) > 120) {
          excessiveIdleDays.push(new Date(s.date).toISOString().slice(0, 10));
        }

        // Ghost presence: checked in but zero CRM activity
        if (s.activities.length === 0 && mins > 60) {
          ghostPresenceDays.push(new Date(s.date).toISOString().slice(0, 10));
        }
      }

      // Missing check-ins: working days with no session
      const d = new Date(start);
      while (d <= now) {
        const day = d.getDay();
        if (day !== 0 && day !== 6) {
          const dateStr = d.toISOString().slice(0, 10);
          if (!uniqueDays.has(dateStr)) {
            missingDays.push(dateStr);
          }
        }
        d.setDate(d.getDate() + 1);
      }

      const avgHoursPerDay = daysWorked > 0 ? Math.round((totalMinutes / daysWorked / 60) * 10) / 10 : 0;
      const avgBreakPerDay = daysWorked > 0 ? Math.round(totalBreakMinutes / daysWorked) : 0;
      const avgIdlePerDay = daysWorked > 0 ? Math.round(totalIdleMinutes / daysWorked) : 0;
      const onTimeRate = sortedSessions.length > 0
        ? Math.round(((sortedSessions.length - lateCount) / sortedSessions.length) * 100)
        : 100;
      const attendanceRate = workingDays > 0 ? Math.round((daysWorked / workingDays) * 100) : 0;
      const idleRate = totalMinutes > 0 ? Math.round((totalIdleMinutes / totalMinutes) * 100) : 0;

      // Productivity score: composite (lower idle = better, higher active = better, on-time = better)
      const activeRatio = totalMinutes > 0 ? totalActiveMinutes / totalMinutes : 0;
      const productivityScore = Math.min(100, Math.round(
        (activeRatio * 50) + ((onTimeRate / 100) * 25) + ((attendanceRate / 100) * 25)
      ));

      // Red flags
      const flags: { type: string; severity: "warning" | "critical"; message: string }[] = [];
      if (maxConsecutiveLate >= 3) {
        flags.push({
          type: "consecutive_late",
          severity: maxConsecutiveLate >= 5 ? "critical" : "warning",
          message: `${name}: ${maxConsecutiveLate} consecutive late check-ins - Schedule 1:1`,
        });
      }
      if (excessiveIdleDays.length > 0) {
        flags.push({
          type: "excessive_idle",
          severity: excessiveIdleDays.length >= 3 ? "critical" : "warning",
          message: `${name}: Excessive idle time on ${excessiveIdleDays.length} days - Review workload`,
        });
      }
      if (missingDays.length > 2) {
        flags.push({
          type: "missing_checkins",
          severity: missingDays.length >= 5 ? "critical" : "warning",
          message: `${name}: ${missingDays.length} missing check-ins - Verify attendance`,
        });
      }
      if (ghostPresenceDays.length > 0) {
        flags.push({
          type: "ghost_presence",
          severity: "critical",
          message: `${name}: Ghost presence detected on ${ghostPresenceDays[ghostPresenceDays.length - 1]} - Review activity`,
        });
      }

      // Status color
      const flagCount = flags.length;
      const status = flagCount === 0 ? "green" : flagCount === 1 ? "yellow" : "red";

      return {
        id: member.id,
        name,
        avgHours: avgHoursPerDay,
        onTimeRate,
        idleRate,
        productivityScore,
        lateCount,
        earlyCount,
        daysWorked,
        attendanceRate,
        avgBreakPerDay,
        avgIdlePerDay,
        totalHours: Math.round((totalMinutes / 60) * 10) / 10,
        expectedHours: workingDays * expectedHoursPerDay,
        status,
        flags,
      };
    });

    teamComparison.sort((a, b) => b.productivityScore - a.productivityScore);

    // Team-level summaries
    const teamSize = teamComparison.length || 1;
    const teamAvgHours = Math.round((teamComparison.reduce((s, m) => s + m.avgHours, 0) / teamSize) * 10) / 10;
    const teamOnTimeRate = Math.round(teamComparison.reduce((s, m) => s + m.onTimeRate, 0) / teamSize);
    const teamAvgIdle = Math.round(teamComparison.reduce((s, m) => s + m.avgIdlePerDay, 0) / teamSize);
    const teamProductivity = Math.round(teamComparison.reduce((s, m) => s + m.productivityScore, 0) / teamSize);

    // All red flags
    const allFlags = teamComparison.flatMap((m) => m.flags);

    // Daily trends for last 14 days
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const trendSessions = sessions.filter(
      (s) => new Date(s.date) >= fourteenDaysAgo
    );

    // Build daily hours per member
    const dailyHours: Record<string, Record<string, number>> = {};
    const dailyOnTime: Record<string, { onTime: number; late: number }> = {};

    for (let i = 0; i < 14; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - 13 + i);
      const dateStr = d.toISOString().slice(0, 10);
      dailyHours[dateStr] = {};
      dailyOnTime[dateStr] = { onTime: 0, late: 0 };
    }

    for (const s of trendSessions) {
      const dateStr = new Date(s.date).toISOString().slice(0, 10);
      if (!dailyHours[dateStr]) continue;
      const member = teamMembers.find((m) => m.id === s.userId);
      const name = member
        ? `${member.firstName || ""} ${member.lastName || ""}`.trim() || "Unknown"
        : "Unknown";
      dailyHours[dateStr][name] = Math.round(((s.totalMinutes || 0) / 60) * 10) / 10;

      const checkInHour = new Date(s.checkInAt).getHours();
      const checkInMin = new Date(s.checkInAt).getMinutes();
      if (checkInHour > 10 || (checkInHour === 10 && checkInMin > 0)) {
        dailyOnTime[dateStr].late++;
      } else {
        dailyOnTime[dateStr].onTime++;
      }
    }

    const dailyHoursTrend = Object.entries(dailyHours)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, members]) => ({
        date: new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        ...members,
      }));

    const dailyOnTimeTrend = Object.entries(dailyOnTime)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        ...data,
      }));

    const memberNames = [...new Set(teamMembers.map((m) =>
      `${m.firstName || ""} ${m.lastName || ""}`.trim() || "Unknown"
    ))];

    return NextResponse.json({
      summary: {
        teamAvgHours,
        teamOnTimeRate,
        teamAvgIdle,
        teamProductivity,
        targetHoursPerDay: expectedHoursPerDay,
      },
      teamComparison,
      redFlags: allFlags,
      trends: {
        dailyHours: dailyHoursTrend,
        dailyOnTime: dailyOnTimeTrend,
        memberNames,
      },
    });
  } catch (error) {
    console.error("Attendance KPI error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
