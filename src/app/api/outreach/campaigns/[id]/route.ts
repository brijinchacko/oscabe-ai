import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod/v4";

const updateCampaignSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  segment: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED"]).optional(),
  dailyLimit: z.number().min(1).max(500).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { id } = await params;

    const campaign = await prisma.outreachCampaign.findUnique({
      where: { id },
      include: {
        templates: {
          orderBy: [{ stepNumber: "asc" }, { variant: "asc" }],
        },
        _count: {
          select: {
            emails: true,
          },
        },
        metrics: {
          orderBy: { date: "desc" },
          take: 30,
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const openRate = campaign.totalSent > 0 ? Math.round((campaign.totalOpened / campaign.totalSent) * 1000) / 10 : 0;
    const replyRate = campaign.totalSent > 0 ? Math.round((campaign.totalReplied / campaign.totalSent) * 1000) / 10 : 0;

    // Get prospect count
    const prospectCount = await prisma.outreachEmail.findMany({
      where: { campaignId: id },
      select: { prospectId: true },
      distinct: ["prospectId"],
    });

    return NextResponse.json({
      ...campaign,
      openRate,
      replyRate,
      prospectCount: prospectCount.length,
    });
  } catch (error) {
    console.error("Get campaign error:", error);
    return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: z.prettifyError(parsed.error) },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) data.name = parsed.data.name;
    if (parsed.data.description !== undefined) data.description = parsed.data.description;
    if (parsed.data.segment !== undefined) data.segment = parsed.data.segment;
    if (parsed.data.status !== undefined) data.status = parsed.data.status;
    if (parsed.data.dailyLimit !== undefined) data.dailyLimit = parsed.data.dailyLimit;
    if (parsed.data.startDate !== undefined) data.startDate = new Date(parsed.data.startDate);
    if (parsed.data.endDate !== undefined) data.endDate = new Date(parsed.data.endDate);

    const campaign = await prisma.outreachCampaign.update({
      where: { id },
      data,
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Update campaign error:", error);
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { id } = await params;

    const campaign = await prisma.outreachCampaign.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only DRAFT campaigns can be deleted" },
        { status: 400 }
      );
    }

    await prisma.outreachCampaign.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete campaign error:", error);
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
}
