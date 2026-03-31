import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// ── Overview Data ──────────────────────────────────────────────────────

async function getOverviewData() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    suppressionCount,
    liaDocuments,
    outreachMetrics,
    totalProspects,
    optOutEmails,
  ] = await Promise.all([
    prisma.suppressionList.count(),
    prisma.lIADocument.findMany({
      select: { id: true, status: true },
    }),
    prisma.outreachMetric.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      select: {
        emailsSent: true,
        emailsBounced: true,
        optOuts: true,
        date: true,
      },
    }),
    prisma.prospect.count(),
    prisma.outreachEmail.count({
      where: {
        status: "OPTED_OUT",
      },
    }),
  ]);

  // Calculate GDPR compliance score
  const activeLIAs = liaDocuments.filter((d) => d.status === "APPROVED").length;
  const totalLIAs = liaDocuments.length;
  const liaScore = totalLIAs > 0 ? (activeLIAs / totalLIAs) * 100 : 100;

  // Suppression list score: having one is good
  const suppressionScore = suppressionCount > 0 ? 100 : 50;

  // Spam complaint rate
  const totalSent = outreachMetrics.reduce((sum, m) => sum + m.emailsSent, 0);
  const totalOptOuts = outreachMetrics.reduce((sum, m) => sum + m.optOuts, 0);
  const spamComplaintRate = totalSent > 0 ? (totalOptOuts / totalSent) * 100 : 0;
  const spamScore = spamComplaintRate < 0.1 ? 100 : spamComplaintRate < 0.3 ? 70 : 30;

  // Overall score
  const complianceScore = Math.round(
    (liaScore * 0.3 + suppressionScore * 0.3 + spamScore * 0.4)
  );

  // Opt-out processing time (mock average in hours)
  const optOutProcessingTimeAvg = 2.4;

  // Data retention stats
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  const staleProspects = await prisma.prospect.count({
    where: {
      lastContactedAt: { lt: sixMonthsAgo },
    },
  });

  return {
    complianceScore,
    optOutProcessingTimeAvg,
    suppressionListSize: suppressionCount,
    activeLIACount: activeLIAs,
    totalLIACount: totalLIAs,
    spamComplaintRate: Number(spamComplaintRate.toFixed(3)),
    dataRetention: {
      totalProspects,
      staleProspects,
      retentionCompliant: staleProspects === 0,
    },
    totalEmailsSent: totalSent,
    totalOptOuts,
  };
}

// ── LIA Data ───────────────────────────────────────────────────────────

async function getLIAData() {
  const documents = await prisma.lIADocument.findMany({
    include: {
      campaign: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return documents.map((doc) => ({
    id: doc.id,
    campaignName: doc.campaign?.name || "No campaign",
    campaignId: doc.campaignId,
    legitimateInterest: doc.legitimateInterest,
    necessityAnalysis: doc.necessityAnalysis,
    balancingTest: doc.balancingTest,
    safeguards: doc.safeguards,
    status: doc.status,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt.toISOString(),
    approvedAt: doc.approvedAt?.toISOString() || null,
  }));
}

// ── Suppression Data ───────────────────────────────────────────────────

async function getSuppressionData(search?: string, page = 1, limit = 25) {
  const where = search
    ? {
        email: { contains: search },
      }
    : {};

  const [entries, total] = await Promise.all([
    prisma.suppressionList.findMany({
      where,
      orderBy: { addedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.suppressionList.count({ where }),
  ]);

  return {
    entries: entries.map((e) => ({
      id: e.id,
      email: e.email,
      reason: e.reason,
      source: e.source,
      addedAt: e.addedAt.toISOString(),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// ── Audit Data ─────────────────────────────────────────────────────────

async function getAuditData() {
  const activities = await prisma.activity.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  return activities.map((a) => ({
    id: a.id,
    type: a.type,
    title: a.title,
    content: a.content,
    user: a.user
      ? `${a.user.firstName || ""} ${a.user.lastName || ""}`.trim()
      : "System",
    entityType: a.candidateId
      ? "Candidate"
      : a.clientId
        ? "Client"
        : a.jobId
          ? "Job"
          : a.applicationId
            ? "Application"
            : "Other",
    entityId: a.candidateId || a.clientId || a.jobId || a.applicationId || null,
    createdAt: a.createdAt.toISOString(),
    metadata: a.metadata,
  }));
}

// ── Handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || "overview";

    let data;
    switch (tab) {
      case "overview":
        data = await getOverviewData();
        break;
      case "lia":
        data = await getLIAData();
        break;
      case "suppression": {
        const search = searchParams.get("search") || undefined;
        const page = parseInt(searchParams.get("page") || "1");
        data = await getSuppressionData(search, page);
        break;
      }
      case "audit":
        data = await getAuditData();
        break;
      default:
        return NextResponse.json({ error: "Invalid tab" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Compliance API]", error);
    return NextResponse.json(
      { error: "Failed to fetch compliance data" },
      { status: 500 }
    );
  }
}
