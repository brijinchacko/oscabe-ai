import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const createApplicationSchema = z.object({
  candidateId: z.string().min(1, "Candidate ID is required"),
  jobId: z.string().min(1, "Job ID is required"),
  stage: z.string().optional(),
  matchScore: z.number().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId") || "";
    const candidateId = searchParams.get("candidateId") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "50", 10)));

    const where: Record<string, unknown> = {};

    if (jobId) {
      where.jobId = jobId;
    }

    if (candidateId) {
      where.candidateId = candidateId;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              location: true,
              headline: true,
            },
          },
          job: {
            select: {
              id: true,
              title: true,
              companyName: true,
              status: true,
              client: {
                select: { id: true, companyName: true },
              },
            },
          },
        },
      }),
      prisma.application.count({ where }),
    ]);

    return NextResponse.json({ applications, total, page, pageSize });
  } catch (error) {
    console.error("List applications error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });

    // Check candidate and job exist
    const [candidate, job] = await Promise.all([
      prisma.candidate.findUnique({ where: { id: parsed.data.candidateId } }),
      prisma.job.findUnique({ where: { id: parsed.data.jobId } }),
    ]);

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check for existing application
    const existing = await prisma.application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: parsed.data.candidateId,
          jobId: parsed.data.jobId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Application already exists for this candidate and job" }, { status: 409 });
    }

    const application = await prisma.application.create({
      data: {
        candidateId: parsed.data.candidateId,
        jobId: parsed.data.jobId,
        stage: parsed.data.stage || "SOURCED",
        matchScore: parsed.data.matchScore,
        notes: parsed.data.notes,
      },
    });

    // Create activities on both candidate and job
    const activityBase = {
      type: "APPLICATION_CREATED",
      title: "Application created",
      content: `${candidate.firstName} ${candidate.lastName} applied to "${job.title}".`,
      userId: user?.id,
      applicationId: application.id,
    };

    await Promise.all([
      prisma.activity.create({
        data: { ...activityBase, candidateId: candidate.id },
      }),
      prisma.activity.create({
        data: { ...activityBase, jobId: job.id },
      }),
    ]);

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Create application error:", error);
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
  }
}
