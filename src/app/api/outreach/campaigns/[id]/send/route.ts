import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { sendEmail as sendViaResend } from "@/lib/resend";
import { sendEmailViaGraph } from "@/lib/microsoft";
import { wrapEmailHtml } from "@/lib/email-html";

// Rate limit delay for Outlook: 30 emails/min = 1 email per 2 seconds
const OUTLOOK_SEND_DELAY_MS = 2000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { id } = await params;

    // Parse optional sendVia from request body
    let sendVia: "resend" | "outlook" = "resend";
    try {
      const body = await request.json();
      if (body.sendVia === "outlook") {
        sendVia = "outlook";
      }
    } catch {
      // No body or invalid JSON — use default (resend)
    }

    // If sending via Outlook, verify the user has Microsoft connected
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (sendVia === "outlook" && !user?.microsoftConnected) {
      return NextResponse.json(
        { error: "Microsoft account not connected. Please connect your Outlook account in Settings." },
        { status: 400 }
      );
    }

    // Fetch the campaign
    const campaign = await prisma.outreachCampaign.findUnique({
      where: { id },
      include: {
        templates: {
          where: { isActive: true },
          orderBy: { stepNumber: "asc" },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.templates.length === 0) {
      return NextResponse.json(
        { error: "Campaign has no active templates. Add at least one email step." },
        { status: 400 }
      );
    }

    // Find prospects matching segment that are not already in this campaign
    const existingProspectIds = await prisma.outreachEmail.findMany({
      where: { campaignId: id },
      select: { prospectId: true },
      distinct: ["prospectId"],
    });
    const excludeIds = existingProspectIds.map((e) => e.prospectId);

    const prospectWhere: Record<string, unknown> = {
      status: { not: "CONVERTED" },
    };
    if (campaign.segment) {
      prospectWhere.segment = campaign.segment;
    }
    if (excludeIds.length > 0) {
      prospectWhere.id = { notIn: excludeIds };
    }

    const prospects = await prisma.prospect.findMany({
      where: prospectWhere,
      take: campaign.dailyLimit,
      select: { id: true, email: true },
    });

    // Also process already-queued emails from manual prospect additions
    const queuedEmails = await prisma.outreachEmail.findMany({
      where: { campaignId: id, status: "QUEUED" },
      include: { prospect: true },
      take: campaign.dailyLimit,
    });

    if (prospects.length === 0 && queuedEmails.length === 0) {
      return NextResponse.json(
        { error: "No eligible prospects found for this campaign segment." },
        { status: 400 }
      );
    }

    // Check suppression list
    const prospectEmails = prospects.map((p) => p.email);
    const suppressed = await prisma.suppressionList.findMany({
      where: { email: { in: prospectEmails } },
      select: { email: true },
    });
    const suppressedEmails = new Set(suppressed.map((s) => s.email));
    const eligibleProspects = prospects.filter((p) => !suppressedEmails.has(p.email));

    if (eligibleProspects.length === 0 && queuedEmails.length === 0) {
      return NextResponse.json(
        { error: "All matching prospects are on the suppression list." },
        { status: 400 }
      );
    }

    // Determine from address for logging
    const fromAddress = sendVia === "outlook"
      ? (user?.microsoftEmail || user?.email || "outlook")
      : "noreply@oscabe.com";

    // Create OutreachEmail records with QUEUED status for step 1
    const firstTemplate = campaign.templates[0];
    const emailsToCreate = eligibleProspects.map((prospect) => ({
      prospectId: prospect.id,
      campaignId: id,
      templateId: firstTemplate.id,
      subject: firstTemplate.subject,
      body: firstTemplate.body,
      sequenceStep: 1,
      status: "QUEUED",
      sentVia: sendVia,
      sentFrom: fromAddress,
    }));

    await prisma.outreachEmail.createMany({
      data: emailsToCreate,
    });

    // Update campaign status to ACTIVE and store sendVia preference
    await prisma.outreachCampaign.update({
      where: { id },
      data: {
        status: "ACTIVE",
        sendVia,
        startDate: campaign.startDate || new Date(),
      },
    });

    // Fire-and-forget: process the queued emails
    // In production this would be a background job; here we process inline
    processQueuedEmails(id, userId, sendVia).catch((err) =>
      console.error("Background email processing error:", err)
    );

    return NextResponse.json({
      success: true,
      newlyQueued: eligibleProspects.length,
      alreadyQueued: queuedEmails.length,
      suppressed: suppressedEmails.size,
      total: eligibleProspects.length + queuedEmails.length,
      sendVia,
    });
  } catch (error) {
    console.error("Send campaign error:", error);
    return NextResponse.json({ error: "Failed to start campaign" }, { status: 500 });
  }
}

/**
 * Process queued outreach emails for a campaign.
 * When sending via Outlook, rate-limits to ~30 emails/minute.
 */
async function processQueuedEmails(
  campaignId: string,
  userId: string,
  sendVia: "resend" | "outlook"
) {
  const queuedEmails = await prisma.outreachEmail.findMany({
    where: { campaignId, status: "QUEUED" },
    include: { prospect: { select: { email: true } } },
    orderBy: { createdAt: "asc" },
  });

  let sentCount = 0;
  let failedCount = 0;

  for (const email of queuedEmails) {
    try {
      const html = wrapEmailHtml(email.body || "", email.subject || "");
      let success = false;
      let messageId: string | null = null;

      if (sendVia === "outlook") {
        const result = await sendEmailViaGraph(
          userId,
          email.prospect.email,
          email.subject || "",
          html
        );
        success = result.success;
        messageId = result.messageId || null;

        // Rate limit for Outlook: wait between sends
        if (sentCount < queuedEmails.length - 1) {
          await sleep(OUTLOOK_SEND_DELAY_MS);
        }
      } else {
        const result = await sendViaResend({
          to: email.prospect.email,
          subject: email.subject || "",
          html,
        });
        success = result.success;
        messageId = result.id || null;
      }

      await prisma.outreachEmail.update({
        where: { id: email.id },
        data: {
          status: success ? "SENT" : "FAILED",
          sentAt: success ? new Date() : undefined,
          sentVia: sendVia,
        },
      });

      if (success) sentCount++;
      else failedCount++;
    } catch (err) {
      console.error(`Failed to send outreach email ${email.id}:`, err);
      await prisma.outreachEmail.update({
        where: { id: email.id },
        data: { status: "FAILED" },
      });
      failedCount++;
    }
  }

  // Update campaign totals
  await prisma.outreachCampaign.update({
    where: { id: campaignId },
    data: {
      totalSent: { increment: sentCount },
    },
  });

  console.log(
    `Campaign ${campaignId}: ${sentCount} sent, ${failedCount} failed via ${sendVia}`
  );
}
