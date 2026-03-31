import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod/v4";

const updateProspectSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.email().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  location: z.string().optional(),
  technologies: z.string().optional(),
  linkedIn: z.string().optional(),
  source: z.string().optional(),
  status: z.enum(["NEW", "CONTACTED", "REPLIED", "CONVERTED", "OPTED_OUT"]).optional(),
  segment: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  emailVerified: z.boolean().optional(),
  lastContactedAt: z.string().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { id } = await context.params;

    const prospect = await prisma.prospect.findUnique({
      where: { id },
      include: {
        convertedClient: {
          select: { id: true, companyName: true },
        },
        outreachEmails: {
          orderBy: { createdAt: "desc" },
          include: {
            campaign: {
              select: { id: true, name: true },
            },
            replies: true,
          },
        },
        outreachReplies: {
          orderBy: { receivedAt: "desc" },
        },
      },
    });

    if (!prospect) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    }

    return NextResponse.json(prospect);
  } catch (error) {
    console.error("Get prospect error:", error);
    return NextResponse.json({ error: "Failed to fetch prospect" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateProspectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: z.prettifyError(parsed.error) },
        { status: 400 }
      );
    }

    const existing = await prisma.prospect.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    }

    // If changing email, check suppression + uniqueness
    if (parsed.data.email && parsed.data.email !== existing.email) {
      const suppressed = await prisma.suppressionList.findUnique({
        where: { email: parsed.data.email },
      });
      if (suppressed) {
        return NextResponse.json(
          { error: `Email ${parsed.data.email} is on the suppression list` },
          { status: 409 }
        );
      }
      const duplicate = await prisma.prospect.findUnique({
        where: { email: parsed.data.email },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "A prospect with this email already exists" },
          { status: 409 }
        );
      }
    }

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.lastContactedAt) {
      data.lastContactedAt = new Date(parsed.data.lastContactedAt);
    }
    if (parsed.data.emailVerified !== undefined && parsed.data.emailVerified) {
      data.verifiedAt = new Date();
    }

    const prospect = await prisma.prospect.update({
      where: { id },
      data,
    });

    return NextResponse.json(prospect);
  } catch (error) {
    console.error("Update prospect error:", error);
    return NextResponse.json({ error: "Failed to update prospect" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { id } = await context.params;

    const existing = await prisma.prospect.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    }

    // Add to suppression list before deleting
    await prisma.suppressionList.upsert({
      where: { email: existing.email },
      update: { reason: "PROSPECT_DELETED", source: "manual" },
      create: {
        email: existing.email,
        reason: "PROSPECT_DELETED",
        source: "manual",
      },
    });

    await prisma.prospect.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete prospect error:", error);
    return NextResponse.json({ error: "Failed to delete prospect" }, { status: 500 });
  }
}
