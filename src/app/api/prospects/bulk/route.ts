import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod/v4";

const bulkSchema = z.object({
  action: z.enum(["add_to_campaign", "change_status", "delete", "export"]),
  prospectIds: z.array(z.string()).min(1, "At least one prospect is required"),
  campaignId: z.string().optional(),
  status: z.enum(["NEW", "CONTACTED", "REPLIED", "CONVERTED", "OPTED_OUT"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = bulkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: z.prettifyError(parsed.error) },
        { status: 400 }
      );
    }

    const { action, prospectIds, campaignId, status } = parsed.data;

    switch (action) {
      case "add_to_campaign": {
        if (!campaignId) {
          return NextResponse.json({ error: "campaignId is required for add_to_campaign" }, { status: 400 });
        }

        const campaign = await prisma.outreachCampaign.findUnique({ where: { id: campaignId } });
        if (!campaign) {
          return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }

        const prospects = await prisma.prospect.findMany({
          where: { id: { in: prospectIds } },
          select: { id: true, email: true },
        });

        // Check which prospects already have emails in this campaign
        const existingEmails = await prisma.outreachEmail.findMany({
          where: {
            campaignId,
            prospectId: { in: prospectIds },
          },
          select: { prospectId: true },
        });
        const existingSet = new Set(existingEmails.map((e) => e.prospectId));

        const toAdd = prospects.filter((p) => !existingSet.has(p.id));

        for (const prospect of toAdd) {
          await prisma.outreachEmail.create({
            data: {
              prospectId: prospect.id,
              campaignId,
              status: "QUEUED",
              sequenceStep: 1,
            },
          });
        }

        return NextResponse.json({
          success: true,
          added: toAdd.length,
          skipped: prospects.length - toAdd.length,
        });
      }

      case "change_status": {
        if (!status) {
          return NextResponse.json({ error: "status is required for change_status" }, { status: 400 });
        }

        const result = await prisma.prospect.updateMany({
          where: { id: { in: prospectIds } },
          data: { status },
        });

        return NextResponse.json({ success: true, updated: result.count });
      }

      case "delete": {
        // Add all to suppression list first
        const prospects = await prisma.prospect.findMany({
          where: { id: { in: prospectIds } },
          select: { email: true },
        });

        for (const prospect of prospects) {
          await prisma.suppressionList.upsert({
            where: { email: prospect.email },
            update: { reason: "BULK_DELETED", source: "manual" },
            create: { email: prospect.email, reason: "BULK_DELETED", source: "manual" },
          });
        }

        const result = await prisma.prospect.deleteMany({
          where: { id: { in: prospectIds } },
        });

        return NextResponse.json({ success: true, deleted: result.count });
      }

      case "export": {
        const prospects = await prisma.prospect.findMany({
          where: { id: { in: prospectIds } },
        });

        // Generate CSV
        const headers = [
          "First Name",
          "Last Name",
          "Email",
          "Company",
          "Job Title",
          "Industry",
          "Company Size",
          "Location",
          "Technologies",
          "LinkedIn",
          "Status",
          "Segment",
          "Source",
          "Last Contacted",
          "Created At",
        ];

        const rows = prospects.map((p) => [
          p.firstName,
          p.lastName,
          p.email,
          p.company || "",
          p.jobTitle || "",
          p.industry || "",
          p.companySize || "",
          p.location || "",
          p.technologies || "",
          p.linkedIn || "",
          p.status,
          p.segment || "",
          p.source,
          p.lastContactedAt ? new Date(p.lastContactedAt).toISOString() : "",
          new Date(p.createdAt).toISOString(),
        ]);

        const csv = [
          headers.join(","),
          ...rows.map((row) =>
            row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
          ),
        ].join("\n");

        return new NextResponse(csv, {
          status: 200,
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="prospects-export-${Date.now()}.csv"`,
          },
        });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Bulk prospects error:", error);
    return NextResponse.json({ error: "Failed to perform bulk action" }, { status: 500 });
  }
}
