import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

function getPeriodDates(period: string) {
  const now = new Date();
  let start: Date;
  let prevStart: Date;
  let prevEnd: Date;

  switch (period) {
    case "week": {
      start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - 7);
      prevEnd = new Date(start);
      break;
    }
    case "quarter": {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      start = new Date(now.getFullYear(), qMonth, 1);
      prevStart = new Date(now.getFullYear(), qMonth - 3, 1);
      prevEnd = new Date(start);
      break;
    }
    case "year": {
      start = new Date(now.getFullYear(), 0, 1);
      prevStart = new Date(now.getFullYear() - 1, 0, 1);
      prevEnd = new Date(start);
      break;
    }
    default: {
      // month
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevEnd = new Date(start);
      break;
    }
  }

  return { start, end: now, prevStart, prevEnd };
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "month";
  const recruiterId = searchParams.get("recruiterId") || undefined;
  const { start, end, prevStart, prevEnd } = getPeriodDates(period);

  try {
    // ---------- Revenue KPIs ----------
    const currentPlacements = await prisma.placement.findMany({
      where: {
        startDate: { gte: start, lte: end },
        ...(recruiterId ? { job: { assignedToId: recruiterId } } : {}),
      },
      include: { job: { select: { assignedToId: true, assignedTo: { select: { firstName: true, lastName: true } } } } },
    });

    const prevPlacements = await prisma.placement.findMany({
      where: {
        startDate: { gte: prevStart, lt: prevEnd },
        ...(recruiterId ? { job: { assignedToId: recruiterId } } : {}),
      },
    });

    const totalRevenue = currentPlacements.reduce((s, p) => s + p.feeAmount, 0);
    const prevRevenue = prevPlacements.reduce((s, p) => s + p.feeAmount, 0);
    const revenueTrend = prevRevenue > 0 ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100) : 0;
    const avgPlacementFee = currentPlacements.length > 0 ? Math.round(totalRevenue / currentPlacements.length) : 0;

    // Revenue per recruiter
    const recruiterRevenueMap: Record<string, { name: string; revenue: number }> = {};
    for (const p of currentPlacements) {
      const rid = p.job?.assignedToId || "unassigned";
      const rname = p.job?.assignedTo ? `${p.job.assignedTo.firstName || ""} ${p.job.assignedTo.lastName || ""}`.trim() : "Unassigned";
      if (!recruiterRevenueMap[rid]) recruiterRevenueMap[rid] = { name: rname, revenue: 0 };
      recruiterRevenueMap[rid].revenue += p.feeAmount;
    }
    const revenuePerRecruiter = Object.entries(recruiterRevenueMap)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.revenue - a.revenue);

    // Pipeline value
    const activeJobsWithFee = await prisma.job.findMany({
      where: {
        status: "ACTIVE",
        ...(recruiterId ? { assignedToId: recruiterId } : {}),
      },
      select: { feeAmount: true, feePercent: true, salaryMax: true },
    });
    const pipelineValue = activeJobsWithFee.reduce((s, j) => {
      if (j.feeAmount) return s + j.feeAmount;
      if (j.feePercent && j.salaryMax) return s + Math.round(j.salaryMax * (j.feePercent / 100));
      return s;
    }, 0);

    // ---------- Pipeline KPIs ----------
    const activeJobsCount = await prisma.job.count({
      where: {
        status: "ACTIVE",
        ...(recruiterId ? { assignedToId: recruiterId } : {}),
      },
    });

    const candidatesInPipeline = await prisma.application.count({
      where: {
        stage: { notIn: ["PLACED", "REJECTED", "WITHDRAWN"] },
        ...(recruiterId ? { job: { assignedToId: recruiterId } } : {}),
      },
    });

    const applicationsThisPeriod = await prisma.application.count({
      where: {
        createdAt: { gte: start, lte: end },
        ...(recruiterId ? { job: { assignedToId: recruiterId } } : {}),
      },
    });

    const interviewsThisPeriod = await prisma.interview.count({
      where: {
        scheduledAt: { gte: start, lte: end },
        ...(recruiterId ? { job: { assignedToId: recruiterId } } : {}),
      },
    });

    const offersThisPeriod = await prisma.application.count({
      where: {
        stage: "OFFER",
        updatedAt: { gte: start, lte: end },
        ...(recruiterId ? { job: { assignedToId: recruiterId } } : {}),
      },
    });

    const placementsCount = currentPlacements.length;
    const prevPlacementsCount = prevPlacements.length;
    const placementsTrend = prevPlacementsCount > 0 ? Math.round(((placementsCount - prevPlacementsCount) / prevPlacementsCount) * 100) : 0;

    // Fill rate
    const closedJobs = await prisma.job.count({
      where: {
        closedAt: { gte: start, lte: end },
        ...(recruiterId ? { assignedToId: recruiterId } : {}),
      },
    });
    const fillRate = closedJobs > 0 ? Math.round((placementsCount / closedJobs) * 100) : 0;

    // Avg time-to-fill
    const placementsWithJobs = currentPlacements.filter((p) => p.job);
    let avgTimeToFill = 0;
    if (placementsWithJobs.length > 0) {
      const jobIds = placementsWithJobs.map((p) => p.jobId).filter(Boolean) as string[];
      const jobs = await prisma.job.findMany({
        where: { id: { in: jobIds } },
        select: { id: true, createdAt: true },
      });
      const jobMap = new Map(jobs.map((j) => [j.id, j.createdAt]));
      let totalDays = 0;
      let count = 0;
      for (const p of placementsWithJobs) {
        const jobCreated = jobMap.get(p.jobId!);
        if (jobCreated) {
          totalDays += (p.startDate.getTime() - jobCreated.getTime()) / 86400000;
          count++;
        }
      }
      avgTimeToFill = count > 0 ? Math.round(totalDays / count) : 0;
    }

    // ---------- Conversion Funnel ----------
    const allApps = await prisma.application.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        ...(recruiterId ? { job: { assignedToId: recruiterId } } : {}),
      },
      select: { stage: true },
    });

    const stageOrder = ["SOURCED", "SCREENING", "SUBMITTED", "INTERVIEW", "OFFER", "PLACED"];
    const stageCounts: Record<string, number> = {};
    for (const s of stageOrder) stageCounts[s] = 0;

    for (const app of allApps) {
      const idx = stageOrder.indexOf(app.stage);
      if (idx >= 0) {
        for (let i = 0; i <= idx; i++) {
          stageCounts[stageOrder[i]]++;
        }
      }
    }

    const funnel = stageOrder.map((stage, i) => ({
      stage,
      count: stageCounts[stage],
      conversionFromPrev: i > 0 && stageCounts[stageOrder[i - 1]] > 0
        ? Math.round((stageCounts[stage] / stageCounts[stageOrder[i - 1]]) * 100)
        : 100,
    }));

    // ---------- Recruiter Performance ----------
    const recruiters = await prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "RECRUITER"] },
        ...(recruiterId ? { id: recruiterId } : {}),
      },
      select: { id: true, firstName: true, lastName: true },
    });

    const recruiterPerformance = await Promise.all(
      recruiters.map(async (r) => {
        const rPlacements = await prisma.placement.findMany({
          where: { startDate: { gte: start, lte: end }, job: { assignedToId: r.id } },
          include: { job: { select: { createdAt: true } } },
        });
        const rRevenue = rPlacements.reduce((s, p) => s + p.feeAmount, 0);
        const rApps = await prisma.application.count({
          where: { createdAt: { gte: start, lte: end }, job: { assignedToId: r.id } },
        });
        const rInterviews = await prisma.interview.count({
          where: { scheduledAt: { gte: start, lte: end }, job: { assignedToId: r.id } },
        });
        let rAvgTTF = 0;
        if (rPlacements.length > 0) {
          const days = rPlacements.reduce((s, p) => {
            if (!p.job) return s;
            return s + (p.startDate.getTime() - p.job.createdAt.getTime()) / 86400000;
          }, 0);
          rAvgTTF = Math.round(days / rPlacements.length);
        }
        const rClosedJobs = await prisma.job.count({
          where: { closedAt: { gte: start, lte: end }, assignedToId: r.id },
        });
        const rFillRate = rClosedJobs > 0 ? Math.round((rPlacements.length / rClosedJobs) * 100) : 0;

        return {
          id: r.id,
          name: `${r.firstName || ""} ${r.lastName || ""}`.trim() || "Unknown",
          placements: rPlacements.length,
          revenue: rRevenue,
          applications: rApps,
          interviews: rInterviews,
          avgTimeToFill: rAvgTTF,
          fillRate: rFillRate,
        };
      })
    );

    recruiterPerformance.sort((a, b) => b.revenue - a.revenue);

    // ---------- Client KPIs ----------
    const activeClients = await prisma.client.count({
      where: { pipelineStage: { not: "LOST" } },
    });

    const newClients = await prisma.client.count({
      where: { createdAt: { gte: start, lte: end } },
    });

    const clientsWithJobCount = await prisma.client.findMany({
      select: { id: true, companyName: true, _count: { select: { jobs: true } } },
    });
    const repeatClients = clientsWithJobCount.filter((c) => c._count.jobs > 1).length;

    // Top clients by revenue
    const clientPlacements = await prisma.placement.findMany({
      where: { startDate: { gte: start, lte: end }, clientId: { not: null } },
      select: { clientId: true, feeAmount: true, client: { select: { companyName: true } } },
    });
    const clientRevMap: Record<string, { name: string; revenue: number }> = {};
    for (const cp of clientPlacements) {
      const cid = cp.clientId!;
      if (!clientRevMap[cid]) clientRevMap[cid] = { name: cp.client?.companyName || "Unknown", revenue: 0 };
      clientRevMap[cid].revenue += cp.feeAmount;
    }
    const topClients = Object.entries(clientRevMap)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // ---------- Candidate KPIs ----------
    const newCandidates = await prisma.candidate.count({
      where: { createdAt: { gte: start, lte: end } },
    });

    const candidatesPlaced = await prisma.placement.count({
      where: { startDate: { gte: start, lte: end } },
    });

    const activeCandidatesInPipeline = candidatesInPipeline;

    // Candidate sources
    const candidateSources = await prisma.candidate.groupBy({
      by: ["source"],
      where: { createdAt: { gte: start, lte: end } },
      _count: { id: true },
    });
    const sourceBreakdown = candidateSources.map((s) => ({
      source: s.source || "Unknown",
      count: s._count.id,
    }));

    // ---------- Monthly revenue chart (last 12 months) ----------
    const twelveMonthsAgo = new Date(end.getFullYear(), end.getMonth() - 11, 1);
    const allPlacementsForChart = await prisma.placement.findMany({
      where: {
        startDate: { gte: twelveMonthsAgo },
        ...(recruiterId ? { job: { assignedToId: recruiterId } } : {}),
      },
      select: { startDate: true, feeAmount: true },
    });

    const monthlyRevenue: { month: string; revenue: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(end.getFullYear(), end.getMonth() - 11 + i, 1);
      const label = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const rev = allPlacementsForChart
        .filter((p) => p.startDate >= monthStart && p.startDate <= monthEnd)
        .reduce((s, p) => s + p.feeAmount, 0);
      monthlyRevenue.push({ month: label, revenue: rev });
    }

    return NextResponse.json({
      revenue: {
        total: totalRevenue,
        trend: revenueTrend,
        avgPlacementFee,
        perRecruiter: revenuePerRecruiter,
        pipelineValue,
      },
      pipeline: {
        activeJobs: activeJobsCount,
        candidatesInPipeline,
        applications: applicationsThisPeriod,
        interviews: interviewsThisPeriod,
        offers: offersThisPeriod,
        placements: placementsCount,
        placementsTrend,
        fillRate,
        avgTimeToFill,
      },
      funnel,
      recruiterPerformance,
      clients: {
        active: activeClients,
        new: newClients,
        repeat: repeatClients,
        top: topClients,
      },
      candidates: {
        new: newCandidates,
        placed: candidatesPlaced,
        active: activeCandidatesInPipeline,
        sources: sourceBreakdown,
      },
      monthlyRevenue,
    });
  } catch (error) {
    console.error("KPI API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
