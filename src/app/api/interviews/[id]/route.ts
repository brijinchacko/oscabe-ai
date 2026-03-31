import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod/v4";

const updateInterviewSchema = z.object({
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  feedback: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  scheduledAt: z.string().optional(),
  duration: z.number().min(15).max(480).optional(),
  type: z.enum(["PHONE", "VIDEO", "IN_PERSON", "TECHNICAL"]).optional(),
  location: z.string().optional(),
  meetingLink: z.string().optional(),
  interviewerId: z.string().nullable().optional(),
  notes: z.string().optional(),
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

    const interview = await prisma.interview.findUnique({
      where: { id },
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
            skills: {
              include: {
                skill: { select: { id: true, name: true } },
              },
              take: 10,
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            companyName: true,
            location: true,
            contractType: true,
            salaryMin: true,
            salaryMax: true,
            client: {
              select: { id: true, companyName: true },
            },
          },
        },
        interviewer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        application: {
          select: { id: true, stage: true, matchScore: true },
        },
      },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // Fetch related activities
    const activities = await prisma.activity.findMany({
      where: {
        OR: [
          { applicationId: interview.applicationId },
          {
            candidateId: interview.candidateId,
            jobId: interview.jobId,
            type: { in: ["INTERVIEW_SCHEDULED", "INTERVIEW_COMPLETED", "INTERVIEW_CANCELLED", "INTERVIEW_NO_SHOW", "INTERVIEW_RESCHEDULED"] },
          },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json({ ...interview, activities });
  } catch (error) {
    console.error("Get interview error:", error);
    return NextResponse.json({ error: "Failed to fetch interview" }, { status: 500 });
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
    const parsed = updateInterviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.interview.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const data: Record<string, unknown> = {};

    if (parsed.data.status !== undefined) {
      data.status = parsed.data.status;
      if (parsed.data.status === "COMPLETED") {
        data.completedAt = new Date();
      }
    }
    if (parsed.data.feedback !== undefined) data.feedback = parsed.data.feedback;
    if (parsed.data.rating !== undefined) data.rating = parsed.data.rating;
    if (parsed.data.scheduledAt !== undefined) data.scheduledAt = new Date(parsed.data.scheduledAt);
    if (parsed.data.duration !== undefined) data.duration = parsed.data.duration;
    if (parsed.data.type !== undefined) data.type = parsed.data.type;
    if (parsed.data.location !== undefined) data.location = parsed.data.location;
    if (parsed.data.meetingLink !== undefined) data.meetingLink = parsed.data.meetingLink;
    if (parsed.data.interviewerId !== undefined) data.interviewerId = parsed.data.interviewerId;
    if (parsed.data.notes !== undefined) data.notes = parsed.data.notes;

    const interview = await prisma.interview.update({
      where: { id },
      data,
      include: {
        candidate: {
          select: { id: true, firstName: true, lastName: true },
        },
        job: {
          select: { id: true, title: true },
        },
      },
    });

    // Create activity for status changes
    if (parsed.data.status && parsed.data.status !== existing.status) {
      const activityTypeMap: Record<string, string> = {
        COMPLETED: "INTERVIEW_COMPLETED",
        CANCELLED: "INTERVIEW_CANCELLED",
        NO_SHOW: "INTERVIEW_NO_SHOW",
        SCHEDULED: "INTERVIEW_RESCHEDULED",
      };

      await prisma.activity.create({
        data: {
          type: activityTypeMap[parsed.data.status] || "INTERVIEW_UPDATED",
          title: `Interview ${parsed.data.status.toLowerCase().replace("_", " ")}`,
          content: `Interview for ${interview.candidate.firstName} ${interview.candidate.lastName} - ${interview.job.title} marked as ${parsed.data.status}`,
          candidateId: interview.candidateId,
          jobId: interview.jobId,
          applicationId: interview.applicationId,
          userId: user?.id,
        },
      });
    }

    // If rescheduled, update Application.interviewAt
    if (parsed.data.scheduledAt) {
      await prisma.application.update({
        where: { id: existing.applicationId },
        data: { interviewAt: new Date(parsed.data.scheduledAt) },
      });

      if (!parsed.data.status) {
        await prisma.activity.create({
          data: {
            type: "INTERVIEW_RESCHEDULED",
            title: "Interview rescheduled",
            content: `Interview for ${interview.candidate.firstName} ${interview.candidate.lastName} rescheduled to ${new Date(parsed.data.scheduledAt).toLocaleDateString("en-GB")}`,
            candidateId: interview.candidateId,
            jobId: interview.jobId,
            applicationId: interview.applicationId,
            userId: user?.id,
          },
        });
      }
    }

    return NextResponse.json(interview);
  } catch (error) {
    console.error("Update interview error:", error);
    return NextResponse.json({ error: "Failed to update interview" }, { status: 500 });
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

    const existing = await prisma.interview.findUnique({
      where: { id },
      include: {
        candidate: { select: { firstName: true, lastName: true } },
        job: { select: { title: true } },
      },
    });
    if (!existing) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    await prisma.interview.delete({ where: { id } });

    await prisma.activity.create({
      data: {
        type: "INTERVIEW_CANCELLED",
        title: "Interview cancelled and removed",
        content: `Interview for ${existing.candidate.firstName} ${existing.candidate.lastName} - ${existing.job.title} was cancelled and removed.`,
        candidateId: existing.candidateId,
        jobId: existing.jobId,
        applicationId: existing.applicationId,
        userId: user?.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete interview error:", error);
    return NextResponse.json({ error: "Failed to delete interview" }, { status: 500 });
  }
}
