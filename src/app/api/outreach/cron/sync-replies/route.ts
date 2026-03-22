import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Cron endpoint: Sync replies from Instantly Unibox into CRM.
 * Frequency: Every 5 minutes
 * Trigger: GET /api/outreach/cron/sync-replies?key=CRON_SECRET
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (key !== process.env.CRON_SECRET && process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Import Instantly client dynamically
    const { getUniboxReplies } = await import("@/lib/instantly");
    const replies = await getUniboxReplies();

    let newReplies = 0;

    for (const reply of replies) {
      // Find the prospect by email
      const prospect = await prisma.prospect.findFirst({
        where: { email: reply.lead_email },
      });

      if (!prospect) continue;

      // Find the most recent email sent to this prospect
      const lastEmail = await prisma.outreachEmail.findFirst({
        where: { prospectId: prospect.id },
        orderBy: { sentAt: "desc" },
      });

      // Check if we already have this reply (by body + timestamp proximity)
      const existing = await prisma.outreachReply.findFirst({
        where: {
          prospectId: prospect.id,
          body: reply.body,
        },
      });

      if (existing) continue;

      // Create the reply record
      await prisma.outreachReply.create({
        data: {
          prospectId: prospect.id,
          emailId: lastEmail?.id || null,
          subject: reply.subject || null,
          body: reply.body,
          receivedAt: new Date(reply.received_at),
          isRead: false,
        },
      });

      // Update prospect status
      await prisma.prospect.update({
        where: { id: prospect.id },
        data: { status: "REPLIED" },
      });

      // Update the email record
      if (lastEmail) {
        await prisma.outreachEmail.update({
          where: { id: lastEmail.id },
          data: { status: "REPLIED", repliedAt: new Date(reply.received_at) },
        });
      }

      newReplies++;
    }

    // Auto-classify new unclassified replies using AI
    if (newReplies > 0) {
      try {
        const { classifyReply } = await import("@/lib/outreach-ai");
        const unclassified = await prisma.outreachReply.findMany({
          where: { sentiment: null },
          take: 20,
        });

        for (const r of unclassified) {
          const classification = await classifyReply(r.body);
          await prisma.outreachReply.update({
            where: { id: r.id },
            data: {
              sentiment: classification.sentiment,
              aiClassification: classification.summary,
            },
          });
        }
      } catch {
        console.warn("[CRON] AI classification unavailable, skipping");
      }
    }

    return NextResponse.json({
      success: true,
      newReplies,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON] sync-replies error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
