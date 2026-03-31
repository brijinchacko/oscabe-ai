import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const createCampaignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  templateId: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  recipientType: z.enum(["CANDIDATES", "CLIENTS"]),
  recipientQuery: z.string().optional(),
  status: z.string().default("DRAFT"),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const campaigns = await prisma.emailCampaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        template: {
          select: { id: true, name: true },
        },
        _count: {
          select: { logs: true },
        },
      },
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("List campaigns error:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const parsed = createCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    // Validate templateId if provided
    if (parsed.data.templateId) {
      const template = await prisma.emailTemplate.findUnique({
        where: { id: parsed.data.templateId },
      });
      if (!template) {
        return NextResponse.json({ error: "Template not found" }, { status: 404 });
      }
    }

    const campaign = await prisma.emailCampaign.create({
      data: parsed.data,
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("Create campaign error:", error);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
