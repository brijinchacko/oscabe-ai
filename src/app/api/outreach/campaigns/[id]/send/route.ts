import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(
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

    // Fetch the campaign
    const campaign = await prisma.outreachCampaign.findUnique({
      where: { id },
      include: {
        templates: {
          where: { isActive: true },
          orderBy: { stepNumber: "asc" },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.templates.length === 0) {
      return NextResponse.json(
        { error: "Campaign has no active templates. Add at least one email step." },
        { status: 400 }
      );
    }

    // Find prospects matching segment that are not already in this campaign
    const existingProspectIds = await prisma.outreachEmail.findMany({
      where: { campaignId: id },
      select: { prospectId: true },
      distinct: ["prospectId"],
    });
    const excludeIds = existingProspectIds.map((e) => e.prospectId);

    const prospectWhere: Record<string, unknown> = {
      status: { not: "CONVERTED" },
    };
    if (campaign.segment) {
      prospectWhere.segment = campaign.segment;
    }
    if (excludeIds.length > 0) {
      prospectWhere.id = { notIn: excludeIds };
    }

    const prospects = await prisma.prospect.findMany({
      where: prospectWhere,
      take: campaign.dailyLimit,
      select: { id: true, email: true },
    });

    if (prospects.length === 0) {
      return NextResponse.json(
        { error: "No eligible prospects found for this campaign segment." },
        { status: 400 }
      );
    }

    // Check suppression list
    const prospectEmails = prospects.map((p) => p.email);
    const suppressed = await prisma.suppressionList.findMany({
      where: { email: { in: prospectEmails } },
      select: { email: true },
    });
    const suppressedEmails = new Set(suppressed.map((s) => s.email));
    const eligibleProspects = prospects.filter((p) => !suppressedEmails.has(p.email));

    if (eligibleProspects.length === 0) {
      return NextResponse.json(
        { error: "All matching prospects are on the suppression list." },
        { status: 400 }
      );
    }

    // Create OutreachEmail records with QUEUED status for step 1
    const firstTemplate = campaign.templates[0];
    const emailsToCreate = eligibleProspects.map((prospect) => ({
      prospectId: prospect.id,
      campaignId: id,
      templateId: firstTemplate.id,
      subject: firstTemplate.subject,
      body: firstTemplate.body,
      sequenceStep: 1,
      status: "QUEUED",
    }));

    await prisma.outreachEmail.createMany({
      data: emailsToCreate,
    });

    // Update campaign status to ACTIVE
    await prisma.outreachCampaign.update({
      where: { id },
      data: {
        status: "ACTIVE",
        startDate: campaign.startDate || new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      queued: eligibleProspects.length,
      suppressed: suppressedEmails.size,
      total: prospects.length,
    });
  } catch (error) {
    console.error("Send campaign error:", error);
    return NextResponse.json({ error: "Failed to start campaign" }, { status: 500 });
  }
}
