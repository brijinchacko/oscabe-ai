import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const updateClientSchema = z.object({
  companyName: z.string().min(1).optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  website: z.string().optional(),
  logoUrl: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  feeAgreement: z.string().optional(),
  paymentTerms: z.string().optional(),
  defaultFeePercent: z.number().optional(),
  source: z.string().optional(),
  pipelineStage: z.string().optional(),
  notes: z.string().optional(),
  assignedToId: z.string().nullable().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        contacts: true,
        jobs: {
          include: {
            _count: {
              select: { applications: true },
            },
          },
        },
        placements: {
          include: {
            candidate: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Get client error:", error);
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateClientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });

    const client = await prisma.client.update({
      where: { id },
      data: parsed.data,
    });

    if (parsed.data.pipelineStage && parsed.data.pipelineStage !== existing.pipelineStage) {
      await prisma.activity.create({
        data: {
          type: "STAGE_CHANGED",
          title: `Stage changed from ${existing.pipelineStage} to ${parsed.data.pipelineStage}`,
          content: `Client pipeline stage updated.`,
          clientId: client.id,
          userId: user?.id,
        },
      });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Update client error:", error);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });

    await prisma.client.update({
      where: { id },
      data: {
        pipelineStage: "LOST",
        notes: existing.notes
          ? `${existing.notes}\n[Soft deleted by user]`
          : "[Soft deleted by user]",
      },
    });

    await prisma.activity.create({
      data: {
        type: "CLIENT_DELETED",
        title: "Client soft deleted",
        content: `Client "${existing.companyName}" was marked as LOST.`,
        clientId: id,
        userId: user?.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete client error:", error);
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
  }
}
