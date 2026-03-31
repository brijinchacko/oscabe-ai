import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod/v4";

const addProspectsSchema = z.object({
  prospectIds: z.array(z.string().min(1)).min(1, "At least one prospect ID is required"),
});

export async function GET(
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
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));

    // Get unique prospect IDs in this campaign
    const campaignEmails = await prisma.outreachEmail.findMany({
      where: { campaignId: id },
      select: { prospectId: true, status: true, sequenceStep: true },
    });

    const prospectStatusMap = new Map<string, { latestStatus: string; maxStep: number }>();
    for (const email of campaignEmails) {
      const existing = prospectStatusMap.get(email.prospectId);
      if (!existing || email.sequenceStep > existing.maxStep) {
        prospectStatusMap.set(email.prospectId, {
          latestStatus: email.status,
          maxStep: email.sequenceStep,
        });
      }
    }

    const prospectIds = Array.from(prospectStatusMap.keys());
    const total = prospectIds.length;
    const paginatedIds = prospectIds.slice((page - 1) * pageSize, page * pageSize);

    const prospects = await prisma.prospect.findMany({
      where: { id: { in: paginatedIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        company: true,
        jobTitle: true,
        status: true,
      },
    });

    const prospectsWithEmailStatus = prospects.map((p) => ({
      ...p,
      emailStatus: prospectStatusMap.get(p.id)?.latestStatus || "QUEUED",
      currentStep: prospectStatusMap.get(p.id)?.maxStep || 1,
    }));

    return NextResponse.json({
      prospects: prospectsWithEmailStatus,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("List campaign prospects error:", error);
    return NextResponse.json({ error: "Failed to fetch prospects" }, { status: 500 });
  }
}

export async function POST(
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
    const parsed = addProspectsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: z.prettifyError(parsed.error) },
        { status: 400 }
      );
    }

    // Verify campaign exists
    const campaign = await prisma.outreachCampaign.findUnique({
      where: { id },
      include: {
        templates: {
          where: { isActive: true, stepNumber: 1 },
          take: 1,
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Filter out prospects already in this campaign
    const existing = await prisma.outreachEmail.findMany({
      where: {
        campaignId: id,
        prospectId: { in: parsed.data.prospectIds },
      },
      select: { prospectId: true },
      distinct: ["prospectId"],
    });
    const existingIds = new Set(existing.map((e) => e.prospectId));
    const newIds = parsed.data.prospectIds.filter((pid) => !existingIds.has(pid));

    if (newIds.length === 0) {
      return NextResponse.json({ added: 0, message: "All prospects already in campaign" });
    }

    // Check suppression list
    const prospects = await prisma.prospect.findMany({
      where: { id: { in: newIds } },
      select: { id: true, email: true },
    });
    const emails = prospects.map((p) => p.email);
    const suppressed = await prisma.suppressionList.findMany({
      where: { email: { in: emails } },
      select: { email: true },
    });
    const suppressedEmails = new Set(suppressed.map((s) => s.email));
    const eligible = prospects.filter((p) => !suppressedEmails.has(p.email));

    // Create email records if we have a first template
    if (campaign.templates.length > 0 && eligible.length > 0) {
      const template = campaign.templates[0];
      await prisma.outreachEmail.createMany({
        data: eligible.map((p) => ({
          prospectId: p.id,
          campaignId: id,
          templateId: template.id,
          subject: template.subject,
          body: template.body,
          sequenceStep: 1,
          status: "QUEUED",
        })),
      });
    }

    return NextResponse.json({
      added: eligible.length,
      suppressed: suppressedEmails.size,
    });
  } catch (error) {
    console.error("Add prospects to campaign error:", error);
    return NextResponse.json({ error: "Failed to add prospects" }, { status: 500 });
  }
}
