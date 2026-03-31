import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employer: true },
    });

    if (!user?.employer) {
      return NextResponse.json(
        { error: "Employer profile not found" },
        { status: 404 }
      );
    }

    const employerId = user.employer.id;

    // Get stats
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const [
      activeJobsCount,
      totalApplications,
      totalPlacements,
      interviewsThisWeek,
      recentJobs,
      recentSubmissions,
    ] = await Promise.all([
      prisma.job.count({
        where: { employerId, status: "ACTIVE" },
      }),
      prisma.application.count({
        where: { job: { employerId } },
      }),
      prisma.placement.count({
        where: { job: { employerId } },
      }),
      prisma.application.count({
        where: {
          job: { employerId },
          stage: "INTERVIEW",
          interviewAt: { gte: weekStart },
        },
      }),
      prisma.job.findMany({
        where: { employerId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          _count: { select: { applications: true } },
        },
      }),
      prisma.application.findMany({
        where: { job: { employerId } },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              headline: true,
            },
          },
          job: {
            select: { id: true, title: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        activeJobs: activeJobsCount,
        totalApplications,
        totalPlacements,
        interviewsThisWeek,
      },
      recentJobs,
      recentSubmissions,
      employer: user.employer,
    });
  } catch (error) {
    console.error("Employer dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
