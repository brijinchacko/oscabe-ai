import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// ── Helpers ─────────────────────────────────────────────────────────────

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function monthLabel(d: Date) {
  return d.toLocaleString("en-GB", { month: "short", year: "2-digit" });
}

function weekLabel(d: Date) {
  const day = d.getDate();
  const mon = d.toLocaleString("en-GB", { month: "short" });
  return `${day} ${mon}`;
}

function startOfWeek(d: Date) {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

// ── Revenue Tab ─────────────────────────────────────────────────────────

async function getRevenueData() {
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
  const thisMonthStart = startOfMonth(now);
  const thisQuarterMonth = Math.floor(now.getMonth() / 3) * 3;
  const thisQuarterStart = new Date(now.getFullYear(), thisQuarterMonth, 1);
  const ytdStart = new Date(now.getFullYear(), 0, 1);

  const placements = await prisma.placement.findMany({
    where: { startDate: { gte: twelveMonthsAgo } },
    select: { feeAmount: true, startDate: true, source: true, status: true },
  });

  // Monthly revenue by source
  const monthlyMap: Record<string, Record<string, number>> = {};
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const key = monthLabel(d);
    monthlyMap[key] = {};
  }

  const sourceColors: Record<string, string> = {
    DIRECT: "#4540DB",
    HIRING_HUB: "#00D4FF",
    TEAM_NETWORK: "#10B981",
    SPLITFEE: "#F59E0B",
    GIIG: "#8B5CF6",
    OTHER: "#6B7280",
  };

  const sourceTotals: Record<string, number> = {};
  let revenueThisMonth = 0;
  let revenueThisQuarter = 0;
  let revenueYTD = 0;
  let totalFees = 0;
  let placementCount = 0;
  let pendingRevenue = 0;
  let activeRevenue = 0;

  for (const p of placements) {
    const mKey = monthLabel(p.startDate);
    const src = p.source || "OTHER";

    if (monthlyMap[mKey]) {
      monthlyMap[mKey][src] = (monthlyMap[mKey][src] || 0) + p.feeAmount;
    }

    sourceTotals[src] = (sourceTotals[src] || 0) + p.feeAmount;
    totalFees += p.feeAmount;
    placementCount++;

    if (p.startDate >= thisMonthStart) revenueThisMonth += p.feeAmount;
    if (p.startDate >= thisQuarterStart) revenueThisQuarter += p.feeAmount;
    if (p.startDate >= ytdStart) revenueYTD += p.feeAmount;

    if (p.status === "PENDING") pendingRevenue += p.feeAmount;
    if (p.status === "ACTIVE") activeRevenue += p.feeAmount;
  }

  const monthlyRevenue = Object.entries(monthlyMap).map(([month, sources]) => ({
    month,
    ...sources,
  }));

  const revenueBySource = Object.entries(sourceTotals).map(([name, value]) => ({
    name,
    value,
    color: sourceColors[name] || "#6B7280",
  }));

  return {
    monthlyRevenue,
    revenueBySource,
    pipeline: { pending: pendingRevenue, active: activeRevenue },
    stats: {
      revenueThisMonth,
      revenueThisQuarter,
      revenueYTD,
      avgFeePerPlacement: placementCount > 0 ? Math.round(totalFees / placementCount) : 0,
    },
    sources: Object.keys(sourceColors),
  };
}

// ── Activity Tab ────────────────────────────────────────────────────────

async function getActivityData() {
  const now = new Date();
  const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

  const [jobs, candidates, applications, placements] = await Promise.all([
    prisma.job.findMany({
      where: { createdAt: { gte: twelveWeeksAgo } },
      select: { createdAt: true },
    }),
    prisma.candidate.findMany({
      where: { createdAt: { gte: twelveWeeksAgo } },
      select: { createdAt: true },
    }),
    prisma.application.findMany({
      where: { createdAt: { gte: twelveWeeksAgo } },
      select: { createdAt: true, stage: true, submittedAt: true, interviewAt: true },
    }),
    prisma.placement.findMany({
      where: { createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true },
    }),
  ]);

  // Build weekly buckets
  const weeks: { label: string; start: Date; end: Date }[] = [];
  for (let i = 11; i >= 0; i--) {
    const ws = startOfWeek(new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000));
    const we = new Date(ws.getTime() + 7 * 24 * 60 * 60 * 1000);
    weeks.push({ label: weekLabel(ws), start: ws, end: we });
  }

  const weeklyData = weeks.map((w) => {
    const inWeek = (d: Date) => d >= w.start && d < w.end;
    return {
      week: w.label,
      jobs: jobs.filter((j) => inWeek(j.createdAt)).length,
      candidates: candidates.filter((c) => inWeek(c.createdAt)).length,
      submissions: applications.filter(
        (a) => a.submittedAt && inWeek(a.submittedAt)
      ).length,
      interviews: applications.filter(
        (a) => a.interviewAt && inWeek(a.interviewAt)
      ).length,
      offers: applications.filter(
        (a) => a.stage === "OFFER" && inWeek(a.createdAt)
      ).length,
    };
  });

  // Monthly placements
  const monthlyPlacements: Record<string, number> = {};
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    monthlyPlacements[monthLabel(d)] = 0;
  }
  for (const p of placements) {
    const key = monthLabel(p.createdAt);
    if (key in monthlyPlacements) monthlyPlacements[key]++;
  }

  return { weeklyData, monthlyPlacements };
}

// ── Performance Tab ─────────────────────────────────────────────────────

async function getPerformanceData() {
  const [placements, applications, clients] = await Promise.all([
    prisma.placement.findMany({
      select: { createdAt: true, jobId: true, clientId: true },
    }),
    prisma.application.findMany({
      select: {
        createdAt: true,
        stage: true,
        jobId: true,
      },
    }),
    prisma.client.findMany({
      select: { id: true, companyName: true },
      orderBy: { companyName: "asc" },
    }),
  ]);

  // Time to fill: days from earliest application to placement for same job
  const appByJob: Record<string, Date> = {};
  for (const a of applications) {
    if (!appByJob[a.jobId] || a.createdAt < appByJob[a.jobId]) {
      appByJob[a.jobId] = a.createdAt;
    }
  }

  let totalDays = 0;
  let filledCount = 0;
  for (const p of placements) {
    if (p.jobId && appByJob[p.jobId]) {
      const days = Math.round(
        (p.createdAt.getTime() - appByJob[p.jobId].getTime()) / (1000 * 60 * 60 * 24)
      );
      if (days >= 0) {
        totalDays += days;
        filledCount++;
      }
    }
  }

  const avgTimeToFill = filledCount > 0 ? Math.round(totalDays / filledCount) : 0;

  // Ratios
  const totalSubmitted = applications.filter(
    (a) => a.stage === "SUBMITTED" || a.stage === "INTERVIEW" || a.stage === "OFFER" || a.stage === "PLACED"
  ).length;
  const totalInterview = applications.filter(
    (a) => a.stage === "INTERVIEW" || a.stage === "OFFER" || a.stage === "PLACED"
  ).length;
  const totalOffer = applications.filter(
    (a) => a.stage === "OFFER" || a.stage === "PLACED"
  ).length;
  const totalPlaced = applications.filter((a) => a.stage === "PLACED").length;

  const submitToInterview = totalSubmitted > 0 ? Math.round((totalInterview / totalSubmitted) * 100) : 0;
  const interviewToOffer = totalInterview > 0 ? Math.round((totalOffer / totalInterview) * 100) : 0;
  const offerAcceptance = totalOffer > 0 ? Math.round((totalPlaced / totalOffer) * 100) : 0;

  // Fill rate by client
  const jobsByClient: Record<string, { total: number; filled: Set<string> }> = {};

  const filledJobIds = new Set(placements.filter((p) => p.jobId).map((p) => p.jobId!));

  const allJobs = await prisma.job.findMany({
    select: { id: true, clientId: true },
    where: { clientId: { not: null } },
  });

  for (const j of allJobs) {
    if (!j.clientId) continue;
    if (!jobsByClient[j.clientId]) {
      jobsByClient[j.clientId] = { total: 0, filled: new Set() };
    }
    jobsByClient[j.clientId].total++;
    if (filledJobIds.has(j.id)) {
      jobsByClient[j.clientId].filled.add(j.id);
    }
  }

  const fillRateByClient = clients
    .filter((c) => jobsByClient[c.id])
    .map((c) => {
      const data = jobsByClient[c.id];
      return {
        client: c.companyName,
        jobs: data.total,
        filled: data.filled.size,
        fillRate: data.total > 0 ? Math.round((data.filled.size / data.total) * 100) : 0,
      };
    })
    .sort((a, b) => b.jobs - a.jobs);

  return {
    stats: {
      avgTimeToFill,
      submitToInterview,
      interviewToOffer,
      offerAcceptance,
    },
    fillRateByClient,
  };
}

// ── Handler ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || "revenue";

    let data;
    switch (tab) {
      case "revenue":
        data = await getRevenueData();
        break;
      case "activity":
        data = await getActivityData();
        break;
      case "performance":
        data = await getPerformanceData();
        break;
      default:
        return NextResponse.json({ error: "Invalid tab" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Analytics API]", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
