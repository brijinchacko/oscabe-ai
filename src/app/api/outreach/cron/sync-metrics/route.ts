import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Cron endpoint: Sync outreach metrics from individual emails to aggregated daily metrics.
 * Frequency: Every 1 hour
 * Trigger: GET /api/outreach/cron/sync-metrics?key=CRON_SECRET
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (key !== process.env.CRON_SECRET && process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all active campaigns
    const campaigns = await prisma.outreachCampaign.findMany({
      where: { status: "ACTIVE" },
    });

    for (const campaign of campaigns) {
      const emails = await prisma.outreachEmail.findMany({
        where: {
          campaignId: campaign.id,
          sentAt: { gte: today },
        },
      });

      const sent = emails.filter((e) => e.status !== "QUEUED").length;
      const opened = emails.filter((e) => e.openedAt).length;
      const replied = emails.filter((e) => e.repliedAt).length;
      const bounced = emails.filter((e) => e.bouncedAt).length;

      await prisma.outreachMetric.upsert({
        where: {
          date_campaignId: { date: today, campaignId: campaign.id },
        },
        update: {
          emailsSent: sent,
          emailsOpened: opened,
          emailsReplied: replied,
          emailsBounced: bounced,
          deliveryRate: sent > 0 ? ((sent - bounced) / sent) * 100 : null,
          openRate: sent > 0 ? (opened / sent) * 100 : null,
          replyRate: sent > 0 ? (replied / sent) * 100 : null,
        },
        create: {
          date: today,
          campaignId: campaign.id,
          emailsSent: sent,
          emailsOpened: opened,
          emailsReplied: replied,
          emailsBounced: bounced,
          deliveryRate: sent > 0 ? ((sent - bounced) / sent) * 100 : null,
          openRate: sent > 0 ? (opened / sent) * 100 : null,
          replyRate: sent > 0 ? (replied / sent) * 100 : null,
        },
      });

      // Update campaign totals
      const allEmails = await prisma.outreachEmail.findMany({
        where: { campaignId: campaign.id },
      });

      await prisma.outreachCampaign.update({
        where: { id: campaign.id },
        data: {
          totalSent: allEmails.filter((e) => e.status !== "QUEUED").length,
          totalOpened: allEmails.filter((e) => e.openedAt).length,
          totalReplied: allEmails.filter((e) => e.repliedAt).length,
          totalBounced: allEmails.filter((e) => e.bouncedAt).length,
        },
      });
    }

    return NextResponse.json({
      success: true,
      campaignsUpdated: campaigns.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON] sync-metrics error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
