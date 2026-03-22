import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const updateCandidateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  headline: z.string().optional(),
  summary: z.string().optional(),
  cvUrl: z.string().optional(),
  cvFileName: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  dayRateMin: z.number().optional(),
  dayRateMax: z.number().optional(),
  noticePeriod: z.string().optional(),
  availableFrom: z.string().optional(),
  rightToWork: z.boolean().optional(),
  status: z.string().optional(),
  source: z.string().optional(),
  linkedIn: z.string().optional(),
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

    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        applications: {
          include: {
            job: {
              include: {
                client: {
                  select: { id: true, companyName: true },
                },
              },
            },
          },
        },
        placements: true,
        activities: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    return NextResponse.json(candidate);
  } catch (error) {
    console.error("Get candidate error:", error);
    return NextResponse.json({ error: "Failed to fetch candidate" }, { status: 500 });
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
    const parsed = updateCandidateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.candidate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });

    const data: Record<string, unknown> = { ...parsed.data };
    if (data.availableFrom && typeof data.availableFrom === "string") {
      data.availableFrom = new Date(data.availableFrom as string);
    }

    const candidate = await prisma.candidate.update({
      where: { id },
      data: data as Parameters<typeof prisma.candidate.update>[0]["data"],
    });

    if (parsed.data.status && parsed.data.status !== existing.status) {
      await prisma.activity.create({
        data: {
          type: "STATUS_CHANGED",
          title: `Status changed from ${existing.status} to ${parsed.data.status}`,
          content: `Candidate status updated.`,
          candidateId: candidate.id,
          userId: user?.id,
        },
      });
    }

    return NextResponse.json(candidate);
  } catch (error) {
    console.error("Update candidate error:", error);
    return NextResponse.json({ error: "Failed to update candidate" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const existing = await prisma.candidate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });

    await prisma.candidate.update({
      where: { id },
      data: { status: "INACTIVE" },
    });

    await prisma.activity.create({
      data: {
        type: "CANDIDATE_DEACTIVATED",
        title: "Candidate deactivated",
        content: `Candidate "${existing.firstName} ${existing.lastName}" was set to INACTIVE.`,
        candidateId: id,
        userId: user?.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete candidate error:", error);
    return NextResponse.json({ error: "Failed to delete candidate" }, { status: 500 });
  }
}
