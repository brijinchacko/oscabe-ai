import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const currentUser = await prisma.user.findUnique({ where: { id: userId },
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // User counts by role
    const allUsers = await prisma.user.findMany({
      select: { role: true, createdAt: true, isActive: true },
    });

    const usersByRole: Record<string, number> = {};
    let activeUsers = 0;
    let newThisWeek = 0;
    let newThisMonth = 0;

    for (const u of allUsers) {
      usersByRole[u.role] = (usersByRole[u.role] || 0) + 1;
      if (u.isActive) activeUsers++;
      if (u.createdAt >= startOfWeek) newThisWeek++;
      if (u.createdAt >= startOfMonth) newThisMonth++;
    }

    // Platform stats
    const [
      totalCandidates,
      totalClients,
      totalJobs,
      totalPlacements,
      totalReferrals,
      totalApplications,
    ] = await Promise.all([
      prisma.candidate.count(),
      prisma.client.count(),
      prisma.job.count(),
      prisma.placement.count(),
      prisma.referral.count(),
      prisma.application.count(),
    ]);

    // Revenue from placements
    const placements = await prisma.placement.findMany({
      select: { feeAmount: true, status: true },
    });

    let totalRevenue = 0;
    let paidRevenue = 0;
    for (const p of placements) {
      totalRevenue += p.feeAmount || 0;
      if (p.status === "COMPLETED" || p.status === "PAID") {
        paidRevenue += p.feeAmount || 0;
      }
    }

    // Activity counts by type
    const activities = await prisma.activity.findMany({
      select: { type: true },
    });
    const activityByType: Record<string, number> = {};
    for (const a of activities) {
      activityByType[a.type] = (activityByType[a.type] || 0) + 1;
    }

    return NextResponse.json({
      users: {
        total: allUsers.length,
        active: activeUsers,
        byRole: usersByRole,
        newThisWeek,
        newThisMonth,
      },
      platform: {
        totalCandidates,
        totalClients,
        totalJobs,
        totalPlacements,
        totalReferrals,
        totalApplications,
      },
      revenue: {
        total: totalRevenue,
        paid: paidRevenue,
        pending: totalRevenue - paidRevenue,
      },
      activityByType,
    });
  } catch (error) {
    console.error("[GET /api/admin/stats]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
