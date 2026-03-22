import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod/v4";

const createTemplateSchema = z.object({
  stepNumber: z.number().min(1).max(7),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  variant: z.enum(["A", "B", "C"]).optional(),
});

const updateTemplateSchema = z.object({
  id: z.string().min(1),
  stepNumber: z.number().min(1).max(7).optional(),
  subject: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  variant: z.enum(["A", "B", "C"]).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const templates = await prisma.outreachTemplate.findMany({
      where: { campaignId: id },
      orderBy: [{ stepNumber: "asc" }, { variant: "asc" }],
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("List templates error:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = createTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: z.prettifyError(parsed.error) },
        { status: 400 }
      );
    }

    // Verify campaign exists
    const campaign = await prisma.outreachCampaign.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const template = await prisma.outreachTemplate.create({
      data: {
        campaignId: id,
        stepNumber: parsed.data.stepNumber,
        subject: parsed.data.subject,
        body: parsed.data.body,
        variant: parsed.data.variant || "A",
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Create template error:", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await params; // consume params
    const body = await request.json();
    const parsed = updateTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: z.prettifyError(parsed.error) },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (parsed.data.stepNumber !== undefined) data.stepNumber = parsed.data.stepNumber;
    if (parsed.data.subject !== undefined) data.subject = parsed.data.subject;
    if (parsed.data.body !== undefined) data.body = parsed.data.body;
    if (parsed.data.variant !== undefined) data.variant = parsed.data.variant;
    if (parsed.data.isActive !== undefined) data.isActive = parsed.data.isActive;

    const template = await prisma.outreachTemplate.update({
      where: { id: parsed.data.id },
      data,
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Update template error:", error);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await params; // consume params
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get("templateId");

    if (!templateId) {
      return NextResponse.json({ error: "templateId is required" }, { status: 400 });
    }

    await prisma.outreachTemplate.delete({
      where: { id: templateId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete template error:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}
