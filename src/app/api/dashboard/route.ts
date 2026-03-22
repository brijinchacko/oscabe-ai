import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  try {
    // Stats
    const [
      placementsThisMonth,
      activeJobs,
      candidatesInPipeline,
      interviewsThisWeek,
    ] = await Promise.all([
      prisma.placement.findMany({
        where: { startDate: { gte: startOfMonth } },
      }),
      prisma.job.count({ where: { status: "ACTIVE" } }),
      prisma.application.count({
        where: { stage: { notIn: ["PLACED", "REJECTED", "WITHDRAWN"] } },
      }),
      prisma.application.count({
        where: {
          interviewAt: { gte: startOfWeek, lt: endOfWeek },
        },
      }),
    ]);

    const revenueThisMonth = placementsThisMonth.reduce(
      (sum, p) => sum + p.feeAmount,
      0
    );

    // Avg time to fill (last 30 days)
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const recentPlacements = await prisma.placement.findMany({
      where: { startDate: { gte: thirtyDaysAgo }, jobId: { not: null } },
      include: { job: { select: { createdAt: true } } },
    });
    let avgTimeToFill = 0;
    if (recentPlacements.length > 0) {
      const totalDays = recentPlacements.reduce((sum, p) => {
        if (!p.job) return sum;
        const diff = p.startDate.getTime() - p.job.createdAt.getTime();
        return sum + diff / 86400000;
      }, 0);
      avgTimeToFill = Math.round(totalDays / recentPlacements.length);
    }

    // Pipeline funnel
    const stageColors: Record<string, string> = {
      SOURCED: "bg-gray-400",
      SCREENING: "bg-blue-400",
      SUBMITTED: "bg-indigo-400",
      INTERVIEW: "bg-purple-400",
      OFFER: "bg-yellow-400",
      PLACED: "bg-green-400",
    };
    const stageCounts = await prisma.application.groupBy({
      by: ["stage"],
      _count: { id: true },
    });
    const pipeline = Object.entries(stageColors).map(([stage, color]) => ({
      stage: stage.charAt(0) + stage.slice(1).toLowerCase(),
      count:
        stageCounts.find((s) => s.stage === stage)?._count.id ?? 0,
      color,
    }));

    // Revenue chart (last 6 months by source)
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    const allPlacements = await prisma.placement.findMany({
      where: { startDate: { gte: sixMonthsAgo } },
      select: { startDate: true, feeAmount: true, source: true },
    });

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const revenueChart: Record<string, Record<string, number>> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(now.getMonth() - i);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      revenueChart[key] = {};
    }
    for (const p of allPlacements) {
      const key = `${monthNames[p.startDate.getMonth()]} ${p.startDate.getFullYear()}`;
      if (revenueChart[key]) {
        revenueChart[key][p.source] =
          (revenueChart[key][p.source] ?? 0) + p.feeAmount;
      }
    }
    const revenueChartArray = Object.entries(revenueChart).map(
      ([month, sources]) => ({ month, ...sources })
    );

    // Stale jobs (active > 14 days with 0 applications)
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 14);
    const staleJobs = await prisma.job.findMany({
      where: {
        status: "ACTIVE",
        createdAt: { lt: fourteenDaysAgo },
      },
      include: {
        client: { select: { companyName: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 10,
    });
    const filteredStaleJobs = staleJobs.filter(
      (j) => j._count.applications === 0
    );

    return NextResponse.json({
      stats: {
        revenueThisMonth,
        placementsThisMonth: placementsThisMonth.length,
        activeJobs,
        candidatesInPipeline,
        interviewsThisWeek,
        avgTimeToFill,
      },
      revenueChart: revenueChartArray,
      pipeline,
      staleJobs: filteredStaleJobs,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
