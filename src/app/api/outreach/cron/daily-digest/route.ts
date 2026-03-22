import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendDailyDigest } from "@/lib/notifications";

/**
 * Cron endpoint: Send daily digest email at 8am.
 * Frequency: Daily at 8:00 AM
 * Trigger: GET /api/outreach/cron/daily-digest?key=CRON_SECRET
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (key !== process.env.CRON_SECRET && process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count yesterday's metrics
    const emailsSent = await prisma.outreachEmail.count({
      where: { sentAt: { gte: yesterday, lt: today } },
    });

    const emailsOpened = await prisma.outreachEmail.count({
      where: { openedAt: { gte: yesterday, lt: today } },
    });

    const replies = await prisma.outreachReply.findMany({
      where: { receivedAt: { gte: yesterday, lt: today } },
    });

    const positiveReplies = replies.filter(
      (r) => r.sentiment === "INTERESTED" || r.sentiment === "MEETING_REQUEST"
    ).length;

    const meetingsBooked = replies.filter(
      (r) => r.sentiment === "MEETING_REQUEST"
    ).length;

    const newProspects = await prisma.prospect.count({
      where: { createdAt: { gte: yesterday, lt: today } },
    });

    const success = await sendDailyDigest({
      emailsSent,
      emailsOpened,
      emailsReplied: replies.length,
      positiveReplies,
      meetingsBooked,
      newProspects,
    });

    return NextResponse.json({
      success,
      metrics: {
        emailsSent,
        emailsOpened,
        emailsReplied: replies.length,
        positiveReplies,
        meetingsBooked,
        newProspects,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON] daily-digest error:", error);
    return NextResponse.json({ error: "Digest failed" }, { status: 500 });
  }
}
