import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Webhook receiver for Instantly.ai events:
 * - email.opened
 * - email.replied
 * - email.bounced
 * - email.unsubscribed
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event, data } = body;

    if (!event || !data) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const prospectEmail = data.to_email || data.email;
    if (!prospectEmail) {
      return NextResponse.json({ error: "No email in payload" }, { status: 400 });
    }

    // Find prospect
    const prospect = await prisma.prospect.findFirst({
      where: { email: prospectEmail },
    });

    if (!prospect) {
      console.warn(`[WEBHOOK] Prospect not found for email: ${prospectEmail}`);
      return NextResponse.json({ status: "ignored", reason: "prospect_not_found" });
    }

    // Find the most recent email to this prospect
    const outreachEmail = await prisma.outreachEmail.findFirst({
      where: { prospectId: prospect.id },
      orderBy: { sentAt: "desc" },
    });

    switch (event) {
      case "email.opened": {
        if (outreachEmail && !outreachEmail.openedAt) {
          await prisma.outreachEmail.update({
            where: { id: outreachEmail.id },
            data: { status: "OPENED", openedAt: new Date() },
          });
        }
        break;
      }

      case "email.replied": {
        // Create reply record
        await prisma.outreachReply.create({
          data: {
            prospectId: prospect.id,
            emailId: outreachEmail?.id || null,
            subject: data.subject || null,
            body: data.body || data.text || "Reply received",
            receivedAt: new Date(),
            isRead: false,
          },
        });

        // Update email status
        if (outreachEmail) {
          await prisma.outreachEmail.update({
            where: { id: outreachEmail.id },
            data: { status: "REPLIED", repliedAt: new Date() },
          });
        }

        // Update prospect status
        await prisma.prospect.update({
          where: { id: prospect.id },
          data: { status: "REPLIED" },
        });

        // Try AI classification
        try {
          const { classifyReply } = await import("@/lib/outreach-ai");
          const replyBody = data.body || data.text || "";
          if (replyBody) {
            const classification = await classifyReply(replyBody);
            const reply = await prisma.outreachReply.findFirst({
              where: { prospectId: prospect.id },
              orderBy: { receivedAt: "desc" },
            });
            if (reply) {
              await prisma.outreachReply.update({
                where: { id: reply.id },
                data: {
                  sentiment: classification.sentiment,
                  aiClassification: classification.summary,
                },
              });
            }
          }
        } catch {
          // AI classification optional
        }

        break;
      }

      case "email.bounced": {
        if (outreachEmail) {
          await prisma.outreachEmail.update({
            where: { id: outreachEmail.id },
            data: { status: "BOUNCED", bouncedAt: new Date() },
          });
        }

        // Add to suppression list
        const existing = await prisma.suppressionList.findFirst({
          where: { email: prospectEmail },
        });
        if (!existing) {
          await prisma.suppressionList.create({
            data: {
              email: prospectEmail,
              reason: "BOUNCED",
              source: "INSTANTLY_WEBHOOK",
            },
          });
        }

        break;
      }

      case "email.unsubscribed": {
        // Add to suppression list
        const existingSup = await prisma.suppressionList.findFirst({
          where: { email: prospectEmail },
        });
        if (!existingSup) {
          await prisma.suppressionList.create({
            data: {
              email: prospectEmail,
              reason: "OPTED_OUT",
              source: "INSTANTLY_WEBHOOK",
            },
          });
        }

        // Update prospect status
        await prisma.prospect.update({
          where: { id: prospect.id },
          data: { status: "OPTED_OUT" },
        });

        break;
      }

      default:
        console.warn(`[WEBHOOK] Unknown event type: ${event}`);
    }

    return NextResponse.json({ status: "ok", event });
  } catch (error) {
    console.error("[WEBHOOK] Instantly error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
