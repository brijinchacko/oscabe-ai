import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findFirst({
      where: { clerkId: userId },
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // System info
    const memUsage = process.memoryUsage();
    const uptimeSeconds = process.uptime();

    // Database record counts
    const [
      userCount,
      candidateCount,
      clientCount,
      jobCount,
      placementCount,
      applicationCount,
      activityCount,
      referralCount,
      emailLogCount,
      interviewCount,
      prospectCount,
      skillCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.candidate.count(),
      prisma.client.count(),
      prisma.job.count(),
      prisma.placement.count(),
      prisma.application.count(),
      prisma.activity.count(),
      prisma.referral.count(),
      prisma.emailLog.count(),
      prisma.interview.count(),
      prisma.prospect.count(),
      prisma.skill.count(),
    ]);

    // Check integration status by env vars
    const integrations = {
      clerk: {
        configured: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        label: "Clerk Authentication",
      },
      stripe: {
        configured: !!process.env.STRIPE_SECRET_KEY,
        label: "Stripe Payments",
      },
      resend: {
        configured: !!process.env.RESEND_API_KEY,
        label: "Resend Email",
      },
      openrouter: {
        configured: !!process.env.OPENROUTER_API_KEY,
        label: "OpenRouter AI",
      },
      googleAnalytics: {
        configured: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
        label: "Google Analytics",
      },
    };

    return NextResponse.json({
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: uptimeSeconds,
        uptimeFormatted: formatUptime(uptimeSeconds),
        memory: {
          rss: memUsage.rss,
          heapUsed: memUsage.heapUsed,
          heapTotal: memUsage.heapTotal,
          external: memUsage.external,
          rssFormatted: formatBytes(memUsage.rss),
          heapUsedFormatted: formatBytes(memUsage.heapUsed),
          heapTotalFormatted: formatBytes(memUsage.heapTotal),
        },
      },
      database: {
        type: "SQLite",
        records: {
          users: userCount,
          candidates: candidateCount,
          clients: clientCount,
          jobs: jobCount,
          placements: placementCount,
          applications: applicationCount,
          activities: activityCount,
          referrals: referralCount,
          emailLogs: emailLogCount,
          interviews: interviewCount,
          prospects: prospectCount,
          skills: skillCount,
        },
      },
      integrations,
    });
  } catch (error) {
    console.error("[GET /api/admin/system]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(" ");
}
