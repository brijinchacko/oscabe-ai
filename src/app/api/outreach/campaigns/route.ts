import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod/v4";

const createCampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  segment: z.string().optional(),
  dailyLimit: z.number().min(1).max(500).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      const lowerSearch = `%${search.toLowerCase()}%`;
      const matchingIds = await prisma.$queryRawUnsafe<{ id: string }[]>(
        `SELECT id FROM "OutreachCampaign" WHERE LOWER("name") LIKE ? OR LOWER("description") LIKE ?`,
        lowerSearch,
        lowerSearch
      );
      const ids = matchingIds.map((r) => r.id);
      if (ids.length === 0) {
        return NextResponse.json({ campaigns: [], total: 0, page, pageSize });
      }
      where.id = { in: ids };
    }

    const [campaigns, total] = await Promise.all([
      prisma.outreachCampaign.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: {
            select: {
              templates: true,
              emails: true,
            },
          },
        },
      }),
      prisma.outreachCampaign.count({ where }),
    ]);

    // Compute metrics for each campaign
    const campaignsWithMetrics = campaigns.map((c) => {
      const openRate = c.totalSent > 0 ? ((c.totalOpened / c.totalSent) * 100) : 0;
      const replyRate = c.totalSent > 0 ? ((c.totalReplied / c.totalSent) * 100) : 0;
      return {
        ...c,
        openRate: Math.round(openRate * 10) / 10,
        replyRate: Math.round(replyRate * 10) / 10,
      };
    });

    // Aggregate stats
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [activeCampaigns, sentToday] = await Promise.all([
      prisma.outreachCampaign.count({ where: { status: "ACTIVE" } }),
      prisma.outreachEmail.count({
        where: {
          sentAt: { gte: todayStart },
          status: { not: "QUEUED" },
        },
      }),
    ]);

    const allCampaigns = await prisma.outreachCampaign.findMany({
      select: { totalSent: true, totalOpened: true, totalReplied: true },
    });
    const totalSent = allCampaigns.reduce((s, c) => s + c.totalSent, 0);
    const totalOpened = allCampaigns.reduce((s, c) => s + c.totalOpened, 0);
    const totalReplied = allCampaigns.reduce((s, c) => s + c.totalReplied, 0);
    const overallOpenRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 1000) / 10 : 0;
    const overallReplyRate = totalSent > 0 ? Math.round((totalReplied / totalSent) * 1000) / 10 : 0;

    return NextResponse.json({
      campaigns: campaignsWithMetrics,
      total,
      page,
      pageSize,
      stats: {
        activeCampaigns,
        sentToday,
        overallOpenRate,
        overallReplyRate,
      },
    });
  } catch (error) {
    console.error("List campaigns error:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: z.prettifyError(parsed.error) },
        { status: 400 }
      );
    }

    const campaign = await prisma.outreachCampaign.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        segment: parsed.data.segment || null,
        dailyLimit: parsed.data.dailyLimit || 50,
        createdById: userId,
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("Create campaign error:", error);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
