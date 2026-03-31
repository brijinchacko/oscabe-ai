import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!currentUser)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { userId } = await params;

  // Only ADMIN/RECRUITER can view others; everyone can view themselves
  if (
    userId !== currentUser.id &&
    currentUser.role !== "ADMIN" &&
    currentUser.role !== "RECRUITER"
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const employee = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const daysParam = url.searchParams.get("days");
    const fromParam = url.searchParams.get("from");
    const toParam = url.searchParams.get("to");

    let fromDate: Date;
    let toDate: Date;

    if (fromParam && toParam) {
      fromDate = new Date(fromParam);
      toDate = new Date(toParam);
      // Clamp to max 90 days
      const maxRange = 90 * 24 * 60 * 60 * 1000;
      if (toDate.getTime() - fromDate.getTime() > maxRange) {
        fromDate = new Date(toDate.getTime() - maxRange);
      }
    } else {
      const days = Math.min(parseInt(daysParam || "7", 10) || 7, 90);
      toDate = new Date();
      fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);
    }

    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);

    const sessions = await prisma.employeeWorkSession.findMany({
      where: {
        userId,
        date: { gte: fromDate, lte: toDate },
      },
      include: {
        activities: { orderBy: { startedAt: "asc" } },
        breaks: { orderBy: { startedAt: "asc" } },
      },
      orderBy: { checkInAt: "desc" },
    });

    // Today's data
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const todaySessions = sessions.filter(
      (s) => s.date >= startOfToday
    );

    const todayTimeline = todaySessions.flatMap((s) =>
      s.activities.map((a) => ({
        id: a.id,
        type: a.type,
        startedAt: a.startedAt,
        endedAt: a.endedAt,
        durationMin: a.durationMin,
        description: a.description,
      }))
    );

    const todayBreaks = todaySessions.flatMap((s) =>
      s.breaks.map((b) => ({
        id: b.id,
        startedAt: b.startedAt,
        endedAt: b.endedAt,
        reason: b.reason,
      }))
    );

    // Work logs (activities with descriptions - TASK, CALL, MEETING, NOTE types)
    const workLogs = todaySessions.flatMap((s) =>
      s.activities
        .filter((a) => a.description)
        .map((a) => ({
          id: a.id,
          type: a.type,
          description: a.description,
          startedAt: a.startedAt,
        }))
    );

    // Day summary array
    const dayMap = new Map<
      string,
      {
        date: string;
        checkInAt: string | null;
        checkOutAt: string | null;
        activeMinutes: number;
        idleMinutes: number;
        breakMinutes: number;
        totalMinutes: number;
        status: string;
      }
    >();

    for (const s of sessions) {
      const dateKey = s.date.toISOString().split("T")[0];
      const existing = dayMap.get(dateKey);

      if (!existing) {
        dayMap.set(dateKey, {
          date: dateKey,
          checkInAt: s.checkInAt.toISOString(),
          checkOutAt: s.checkOutAt?.toISOString() || null,
          activeMinutes: s.activeMinutes || 0,
          idleMinutes: s.idleMinutes || 0,
          breakMinutes: s.breakMinutes || 0,
          totalMinutes: s.totalMinutes || 0,
          status: s.status,
        });
      } else {
        existing.activeMinutes += s.activeMinutes || 0;
        existing.idleMinutes += s.idleMinutes || 0;
        existing.breakMinutes += s.breakMinutes || 0;
        existing.totalMinutes += s.totalMinutes || 0;
        // Use earliest check-in
        if (s.checkInAt.toISOString() < (existing.checkInAt || "")) {
          existing.checkInAt = s.checkInAt.toISOString();
        }
        // Use latest check-out
        if (
          s.checkOutAt &&
          (!existing.checkOutAt ||
            s.checkOutAt.toISOString() > existing.checkOutAt)
        ) {
          existing.checkOutAt = s.checkOutAt.toISOString();
        }
      }
    }

    const daySummary = Array.from(dayMap.values()).sort(
      (a, b) => b.date.localeCompare(a.date)
    );

    // Stats
    const completedSessions = sessions.filter(
      (s) => s.status === "CHECKED_OUT"
    );
    const totalDaysWorked = dayMap.size;
    const totalActiveMin = completedSessions.reduce(
      (sum, s) => sum + (s.activeMinutes || 0),
      0
    );
    const totalIdleMin = completedSessions.reduce(
      (sum, s) => sum + (s.idleMinutes || 0),
      0
    );
    const totalBreakMin = completedSessions.reduce(
      (sum, s) => sum + (s.breakMinutes || 0),
      0
    );
    const totalMin = completedSessions.reduce(
      (sum, s) => sum + (s.totalMinutes || 0),
      0
    );

    const avgHoursPerDay =
      totalDaysWorked > 0
        ? Math.round((totalMin / totalDaysWorked / 60) * 100) / 100
        : 0;

    // On-time rate: checked in before 10:00 AM
    const onTimeDays = new Set<string>();
    const totalDaysSet = new Set<string>();
    for (const s of sessions) {
      const dateKey = s.date.toISOString().split("T")[0];
      totalDaysSet.add(dateKey);
      const checkInHour = s.checkInAt.getHours();
      if (checkInHour < 10) {
        onTimeDays.add(dateKey);
      }
    }
    const onTimeRate =
      totalDaysSet.size > 0
        ? Math.round((onTimeDays.size / totalDaysSet.size) * 100)
        : 0;

    return NextResponse.json({
      employee,
      todayTimeline,
      todayBreaks,
      workLogs,
      daySummary,
      stats: {
        totalActiveMinutes: totalActiveMin,
        totalIdleMinutes: totalIdleMin,
        totalBreakMinutes: totalBreakMin,
        totalMinutes: totalMin,
      },
      totalStats: {
        avgHoursPerDay,
        totalDaysWorked,
        onTimeRate,
      },
    });
  } catch (error) {
    console.error("Employee history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee history" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!currentUser)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { userId } = await params;

  // Only ADMIN can add work logs for others; self can add for self
  if (userId !== currentUser.id && currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { description, type } = await request.json();

    if (!description || !type) {
      return NextResponse.json(
        { error: "description and type are required" },
        { status: 400 }
      );
    }

    const validTypes = ["TASK", "CALL", "MEETING", "NOTE"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const activeSession = await prisma.employeeWorkSession.findFirst({
      where: {
        userId,
        status: { in: ["CHECKED_IN", "ON_BREAK", "IDLE"] },
      },
    });

    if (!activeSession) {
      return NextResponse.json(
        { error: "No active session found for this user" },
        { status: 400 }
      );
    }

    const now = new Date();

    const activity = await prisma.employeeActivity.create({
      data: {
        sessionId: activeSession.id,
        type,
        startedAt: now,
        endedAt: now,
        durationMin: 0,
        description: `${type}: ${description}`,
      },
    });

    return NextResponse.json(
      { message: "Work log added", activity },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add work log error:", error);
    return NextResponse.json(
      { error: "Failed to add work log" },
      { status: 500 }
    );
  }
}
