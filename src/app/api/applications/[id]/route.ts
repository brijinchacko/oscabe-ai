import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const updateApplicationSchema = z.object({
  stage: z.string().optional(),
  matchScore: z.number().optional(),
  gapAnalysis: z.string().optional(),
  interviewAt: z.string().optional(),
  offerAmount: z.number().optional(),
  notes: z.string().optional(),
  rejectionReason: z.string().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.application.findUnique({
      where: { id },
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true } },
        job: { select: { id: true, title: true, clientId: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const data: Record<string, unknown> = { ...parsed.data };
    if (data.interviewAt && typeof data.interviewAt === "string") {
      data.interviewAt = new Date(data.interviewAt as string);
    }

    // Set submittedAt when stage changes to SUBMITTED
    if (parsed.data.stage === "SUBMITTED" && existing.stage !== "SUBMITTED") {
      data.submittedAt = new Date();
    }

    const application = await prisma.application.update({
      where: { id },
      data: data as Parameters<typeof prisma.application.update>[0]["data"],
      include: {
        candidate: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        job: {
          select: { id: true, title: true, companyName: true },
        },
      },
    });

    // Create activities on stage change
    if (parsed.data.stage && parsed.data.stage !== existing.stage) {
      const activityBase = {
        type: "STAGE_CHANGED",
        title: `Application stage changed from ${existing.stage} to ${parsed.data.stage}`,
        content: `${existing.candidate.firstName} ${existing.candidate.lastName} - "${existing.job.title}"`,
        userId: user?.id,
        applicationId: id,
      };

      const activityPromises = [
        prisma.activity.create({
          data: { ...activityBase, candidateId: existing.candidateId },
        }),
        prisma.activity.create({
          data: { ...activityBase, jobId: existing.jobId },
        }),
      ];

      await Promise.all(activityPromises);
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}
