import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod/v4";

const createInterviewSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  candidateId: z.string().min(1, "Candidate ID is required"),
  jobId: z.string().min(1, "Job ID is required"),
  interviewerId: z.string().optional(),
  scheduledAt: z.string().min(1, "Scheduled date/time is required"),
  duration: z.number().min(15).max(480).optional(),
  type: z.enum(["PHONE", "VIDEO", "IN_PERSON", "TECHNICAL"]).optional(),
  location: z.string().optional(),
  meetingLink: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "50", 10)));
    const candidateId = searchParams.get("candidateId") || "";
    const jobId = searchParams.get("jobId") || "";
    const status = searchParams.get("status") || "";
    const type = searchParams.get("type") || "";
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";

    const where: Record<string, unknown> = {};

    if (candidateId) {
      where.candidateId = candidateId;
    }

    if (jobId) {
      where.jobId = jobId;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (from || to) {
      const scheduledAtFilter: Record<string, Date> = {};
      if (from) {
        scheduledAtFilter.gte = new Date(from);
      }
      if (to) {
        scheduledAtFilter.lte = new Date(to);
      }
      where.scheduledAt = scheduledAtFilter;
    }

    const [interviews, total] = await Promise.all([
      prisma.interview.findMany({
        where,
        orderBy: { scheduledAt: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          candidate: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          },
          job: {
            select: { id: true, title: true, companyName: true, location: true },
          },
          interviewer: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          application: {
            select: { id: true, stage: true },
          },
        },
      }),
      prisma.interview.count({ where }),
    ]);

    return NextResponse.json({ interviews, total, page, pageSize });
  } catch (error) {
    console.error("List interviews error:", error);
    return NextResponse.json({ error: "Failed to fetch interviews" }, { status: 500 });
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
    const parsed = createInterviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const scheduledAt = new Date(parsed.data.scheduledAt);

    const interview = await prisma.interview.create({
      data: {
        applicationId: parsed.data.applicationId,
        candidateId: parsed.data.candidateId,
        jobId: parsed.data.jobId,
        interviewerId: parsed.data.interviewerId || null,
        scheduledAt,
        duration: parsed.data.duration ?? 60,
        type: parsed.data.type ?? "PHONE",
        location: parsed.data.location || null,
        meetingLink: parsed.data.meetingLink || null,
        notes: parsed.data.notes || null,
      },
      include: {
        candidate: {
          select: { id: true, firstName: true, lastName: true },
        },
        job: {
          select: { id: true, title: true },
        },
      },
    });

    // Update Application.interviewAt
    await prisma.application.update({
      where: { id: parsed.data.applicationId },
      data: { interviewAt: scheduledAt },
    });

    // Create Activity record
    await prisma.activity.create({
      data: {
        type: "INTERVIEW_SCHEDULED",
        title: "Interview scheduled",
        content: `Interview scheduled for ${interview.candidate.firstName} ${interview.candidate.lastName} - ${interview.job.title} on ${scheduledAt.toLocaleDateString("en-GB")}`,
        candidateId: parsed.data.candidateId,
        jobId: parsed.data.jobId,
        applicationId: parsed.data.applicationId,
        userId: user?.id,
      },
    });

    return NextResponse.json(interview, { status: 201 });
  } catch (error) {
    console.error("Create interview error:", error);
    return NextResponse.json({ error: "Failed to create interview" }, { status: 500 });
  }
}
