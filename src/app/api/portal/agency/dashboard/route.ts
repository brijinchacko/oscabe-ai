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
      include: { agency: true },
    });

    if (!user?.agency) {
      return NextResponse.json(
        { error: "Agency profile not found" },
        { status: 404 }
      );
    }

    const [sharedRoles, talentPool, placementsCount, recentJobs] =
      await Promise.all([
        prisma.job.count({ where: { status: "ACTIVE" } }),
        prisma.candidate.count({ where: { status: "ACTIVE" } }),
        prisma.placement.count(),
        prisma.job.findMany({
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            _count: { select: { applications: true } },
            client: { select: { companyName: true } },
          },
        }),
      ]);

    return NextResponse.json({
      stats: {
        sharedRoles,
        talentPool,
        placements: placementsCount,
      },
      recentJobs,
      agency: user.agency,
    });
  } catch (error) {
    console.error("Agency dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
