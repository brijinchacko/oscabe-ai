import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Cron endpoint: Check sending domain health (SPF, DKIM, DMARC, reputation).
 * Frequency: Every 6 hours
 * Trigger: GET /api/outreach/cron/domain-health?key=CRON_SECRET
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (key !== process.env.CRON_SECRET && process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const domains = await prisma.sendingDomain.findMany({
      where: { isActive: true },
      include: { mailboxes: true },
    });

    const results = [];

    for (const domain of domains) {
      // Reset daily send counters if new day
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      // Count actual sends today for this domain's mailboxes
      const mailboxEmails = domain.mailboxes.map((m) => m.email);
      const todaySends = await prisma.outreachEmail.count({
        where: {
          sentFrom: { in: mailboxEmails },
          sentAt: { gte: todayStart },
        },
      });

      await prisma.sendingDomain.update({
        where: { id: domain.id },
        data: { totalSentToday: todaySends },
      });

      // Reset individual mailbox counters
      for (const mailbox of domain.mailboxes) {
        const mailboxSends = await prisma.outreachEmail.count({
          where: {
            sentFrom: mailbox.email,
            sentAt: { gte: todayStart },
          },
        });

        await prisma.sendingMailbox.update({
          where: { id: mailbox.id },
          data: { sentToday: mailboxSends },
        });
      }

      // Calculate reputation score based on bounce/complaint rates
      const last30Days = new Date(now);
      last30Days.setDate(last30Days.getDate() - 30);

      const recentEmails = await prisma.outreachEmail.findMany({
        where: {
          sentFrom: { in: mailboxEmails },
          sentAt: { gte: last30Days },
        },
      });

      const totalSent = recentEmails.length;
      const bounced = recentEmails.filter((e) => e.bouncedAt).length;
      const bounceRate = totalSent > 0 ? bounced / totalSent : 0;

      // Score: 100 = perfect, penalize for bounces
      const score = Math.max(0, Math.round((1 - bounceRate * 10) * 100));

      await prisma.sendingDomain.update({
        where: { id: domain.id },
        data: { reputationScore: score },
      });

      results.push({
        domain: domain.domain,
        totalSentToday: todaySends,
        reputationScore: score,
        mailboxCount: domain.mailboxes.length,
      });
    }

    return NextResponse.json({
      success: true,
      domains: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON] domain-health error:", error);
    return NextResponse.json({ error: "Health check failed" }, { status: 500 });
  }
}
