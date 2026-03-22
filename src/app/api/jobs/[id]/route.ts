import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const updateJobSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  clientId: z.string().nullable().optional(),
  location: z.string().optional(),
  remote: z.boolean().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  dayRateMin: z.number().optional(),
  dayRateMax: z.number().optional(),
  contractType: z.string().optional(),
  industry: z.string().optional(),
  feePercent: z.number().optional(),
  feeAmount: z.number().optional(),
  source: z.string().optional(),
  sourceRef: z.string().optional(),
  status: z.string().optional(),
  companyName: z.string().optional(),
  assignedToId: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  closedAt: z.string().nullable().optional(),
  notes: z.string().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        applications: {
          include: {
            candidate: {
              include: {
                skills: {
                  include: { skill: true },
                },
              },
            },
          },
        },
        client: true,
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

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Get job error:", error);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
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
    const parsed = updateJobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.job.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });

    const data: Record<string, unknown> = { ...parsed.data };
    if (data.publishedAt !== undefined) {
      data.publishedAt = data.publishedAt ? new Date(data.publishedAt as string) : null;
    }
    if (data.expiresAt !== undefined) {
      data.expiresAt = data.expiresAt ? new Date(data.expiresAt as string) : null;
    }
    if (data.closedAt !== undefined) {
      data.closedAt = data.closedAt ? new Date(data.closedAt as string) : null;
    }

    const job = await prisma.job.update({
      where: { id },
      data: data as Parameters<typeof prisma.job.update>[0]["data"],
    });

    if (parsed.data.status && parsed.data.status !== existing.status) {
      await prisma.activity.create({
        data: {
          type: "STATUS_CHANGED",
          title: `Job status changed from ${existing.status} to ${parsed.data.status}`,
          content: `Job status updated.`,
          jobId: job.id,
          clientId: job.clientId || undefined,
          userId: user?.id,
        },
      });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Update job error:", error);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const existing = await prisma.job.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });

    await prisma.job.update({
      where: { id },
      data: {
        status: "CANCELLED",
        closedAt: new Date(),
      },
    });

    await prisma.activity.create({
      data: {
        type: "JOB_CANCELLED",
        title: "Job cancelled",
        content: `Job "${existing.title}" was cancelled.`,
        jobId: id,
        clientId: existing.clientId || undefined,
        userId: user?.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete job error:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
