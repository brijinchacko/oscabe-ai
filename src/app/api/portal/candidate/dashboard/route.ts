import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { candidate: true },
    });

    if (!user?.candidate) {
      return NextResponse.json(
        { error: "Candidate profile not found" },
        { status: 404 }
      );
    }

    const candidate = user.candidate;
    const candidateId = candidate.id;

    // Calculate profile completion
    const fields = [
      candidate.firstName,
      candidate.lastName,
      candidate.email,
      candidate.phone,
      candidate.location,
      candidate.headline,
      candidate.summary,
      candidate.linkedIn,
      candidate.cvUrl,
    ];
    const filledFields = fields.filter(Boolean).length;
    const profileCompletion = Math.round((filledFields / fields.length) * 100);

    const [
      activeApplications,
      verifiedSkillsCount,
      interviewsScheduled,
      recentApplications,
      candidateSkills,
    ] = await Promise.all([
      prisma.application.count({
        where: {
          candidateId,
          stage: { not: "PLACED" },
        },
      }),
      prisma.candidateSkill.count({
        where: { candidateId, isVerified: true },
      }),
      prisma.application.count({
        where: {
          candidateId,
          stage: "INTERVIEW",
          interviewAt: { gte: new Date() },
        },
      }),
      prisma.application.findMany({
        where: { candidateId },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              companyName: true,
              location: true,
            },
          },
        },
      }),
      prisma.candidateSkill.findMany({
        where: { candidateId },
        select: { skillId: true },
      }),
    ]);

    // Find recommended jobs based on candidate skills
    const skillIds = candidateSkills.map((cs) => cs.skillId);
    let recommendedJobs: unknown[] = [];
    if (skillIds.length > 0) {
      recommendedJobs = await prisma.job.findMany({
        where: {
          status: "ACTIVE",
          skills: {
            some: { skillId: { in: skillIds } },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          _count: { select: { applications: true } },
        },
      });
    } else {
      recommendedJobs = await prisma.job.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          _count: { select: { applications: true } },
        },
      });
    }

    return NextResponse.json({
      stats: {
        activeApplications,
        profileCompletion,
        interviewsScheduled,
        verifiedSkills: verifiedSkillsCount,
      },
      recentApplications,
      recommendedJobs,
      candidate,
    });
  } catch (error) {
    console.error("Candidate dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
