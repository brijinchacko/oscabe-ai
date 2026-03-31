import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const format = searchParams.get("format") || "json";

    // Permission check: ADMIN can see all, others see only self
    let targetUserId = user.id;
    if (userId && user.role === "ADMIN") {
      targetUserId = userId;
    } else if (userId && userId !== user.id) {
      return NextResponse.json(
        { error: "You can only view your own reports" },
        { status: 403 }
      );
    }

    // Build date filter
    const dateFilter: Record<string, Date> = {};
    if (from) {
      dateFilter.gte = new Date(from);
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setDate(toDate.getDate() + 1);
      dateFilter.lt = toDate;
    }

    const sessions = await prisma.employeeWorkSession.findMany({
      where: {
        userId: targetUserId,
        status: "CHECKED_OUT",
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { checkInAt: "desc" },
      take: 100,
    });

    const reports = sessions.map((s) => {
      let checkoutReport = null;
      if (s.checkOutSummary) {
        try {
          checkoutReport = JSON.parse(s.checkOutSummary);
        } catch {
          checkoutReport = { summary: s.checkOutSummary };
        }
      }

      return {
        id: s.id,
        date: s.date.toISOString().split("T")[0],
        userName: `${s.user.firstName || ""} ${s.user.lastName || ""}`.trim(),
        email: s.user.email,
        checkIn: s.checkInAt.toISOString(),
        checkOut: s.checkOutAt?.toISOString() || null,
        location: s.workLocation,
        totalMinutes: s.totalMinutes || 0,
        activeMinutes: s.activeMinutes || 0,
        breakMinutes: s.breakMinutes || 0,
        idleMinutes: s.idleMinutes || 0,
        totalHours: ((s.totalMinutes || 0) / 60).toFixed(1),
        activeHours: ((s.activeMinutes || 0) / 60).toFixed(1),
        breakHours: ((s.breakMinutes || 0) / 60).toFixed(1),
        idleHours: ((s.idleMinutes || 0) / 60).toFixed(1),
        checkoutReport,
      };
    });

    if (format === "csv") {
      const header =
        "Date,Name,Email,Check In,Check Out,Location,Total (hrs),Active (hrs),Break (hrs),Idle (hrs)";
      const rows = reports.map(
        (r) =>
          `${r.date},"${r.userName}",${r.email},${r.checkIn},${r.checkOut || ""},${r.location},${r.totalHours},${r.activeHours},${r.breakHours},${r.idleHours}`
      );
      const csv = [header, ...rows].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="attendance-report.csv"`,
        },
      });
    }

    return NextResponse.json({ reports });
  } catch (err) {
    console.error("Reports error:", err);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
