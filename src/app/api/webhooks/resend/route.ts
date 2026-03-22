import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface ResendWebhookEvent {
  type: string;
  data: {
    email_id: string;
    created_at: string;
    to: string[];
    from: string;
    subject: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ResendWebhookEvent = await request.json();

    const { type, data } = body;
    const resendId = data.email_id;

    if (!resendId) {
      return NextResponse.json({ error: "Missing email_id" }, { status: 400 });
    }

    // Find the matching EmailLog by resendId
    const emailLog = await prisma.emailLog.findFirst({
      where: { resendId },
    });

    if (!emailLog) {
      // Not an email we track - acknowledge anyway
      return NextResponse.json({ received: true });
    }

    const now = new Date();

    switch (type) {
      case "email.delivered": {
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: { status: "delivered" },
        });
        break;
      }

      case "email.opened": {
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: "opened",
            openedAt: emailLog.openedAt || now,
          },
        });

        // Increment campaign openCount if this is the first open
        if (emailLog.campaignId && !emailLog.openedAt) {
          await prisma.emailCampaign.update({
            where: { id: emailLog.campaignId },
            data: { openCount: { increment: 1 } },
          });
        }
        break;
      }

      case "email.clicked": {
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: "clicked",
            clickedAt: emailLog.clickedAt || now,
          },
        });

        // Increment campaign clickCount if this is the first click
        if (emailLog.campaignId && !emailLog.clickedAt) {
          await prisma.emailCampaign.update({
            where: { id: emailLog.campaignId },
            data: { clickCount: { increment: 1 } },
          });
        }
        break;
      }

      case "email.bounced": {
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: { status: "bounced" },
        });

        // Increment campaign bounceCount
        if (emailLog.campaignId) {
          await prisma.emailCampaign.update({
            where: { id: emailLog.campaignId },
            data: { bounceCount: { increment: 1 } },
          });
        }
        break;
      }

      default:
        // Unknown event type - acknowledge without action
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Resend webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
