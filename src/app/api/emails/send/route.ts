import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import { sendEmail } from "@/lib/resend";
import { sendEmailViaGraph } from "@/lib/microsoft";
import { wrapEmailHtml } from "@/lib/email-html";

const sendEmailSchema = z.object({
  to: z.string().email("Valid email is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  candidateId: z.string().optional(),
  clientId: z.string().optional(),
  jobId: z.string().optional(),
  sendVia: z.enum(["resend", "outlook"]).optional().default("resend"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const reqBody = await request.json();
    const parsed = sendEmailSchema.safeParse(reqBody);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const { to, subject, body, candidateId, clientId, jobId, sendVia } = parsed.data;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Wrap body in HTML email template
    const html = wrapEmailHtml(body, subject);

    let result: { success: boolean; id?: string | null; error?: unknown };
    let fromAddress: string | null = null;

    if (sendVia === "outlook") {
      // Verify user has Microsoft connected
      if (!user?.microsoftConnected) {
        return NextResponse.json(
          { error: "Microsoft account not connected. Please connect your Outlook account in Settings." },
          { status: 400 }
        );
      }

      const outlookResult = await sendEmailViaGraph(userId, to, subject, html);
      result = {
        success: outlookResult.success,
        id: outlookResult.messageId || null,
        error: outlookResult.error,
      };
      fromAddress = user.microsoftEmail || user.email || null;
    } else {
      // Default: send via Resend
      result = await sendEmail({ to, subject, html });
      fromAddress = "noreply@oscabe.com";
    }

    // Create EmailLog record
    const emailLog = await prisma.emailLog.create({
      data: {
        sentById: user?.id,
        toEmail: to,
        fromEmail: fromAddress,
        subject,
        direction: "sent",
        status: result.success ? "sent" : "failed",
        resendId: sendVia === "resend" ? (result.id || null) : null,
        microsoftMessageId: sendVia === "outlook" ? (result.id || null) : null,
      },
    });

    // Create Activity records for linked entities
    const senderName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "System";
    const viaLabel = sendVia === "outlook" ? " (via Outlook)" : "";

    if (candidateId) {
      await prisma.activity.create({
        data: {
          type: "EMAIL",
          title: `Email sent: ${subject}`,
          content: `Email sent to ${to} by ${senderName}${viaLabel}`,
          candidateId,
          userId: user?.id,
        },
      });
    }

    if (clientId) {
      await prisma.activity.create({
        data: {
          type: "EMAIL",
          title: `Email sent: ${subject}`,
          content: `Email sent to ${to} by ${senderName}${viaLabel}`,
          clientId,
          userId: user?.id,
        },
      });
    }

    if (jobId) {
      await prisma.activity.create({
        data: {
          type: "EMAIL",
          title: `Email sent: ${subject}`,
          content: `Email sent to ${to} by ${senderName}${viaLabel}`,
          jobId,
          userId: user?.id,
        },
      });
    }

    return NextResponse.json({
      success: result.success,
      emailLogId: emailLog.id,
      sentVia: sendVia,
      ...(result.error ? { error: result.error } : {}),
    });
  } catch (error) {
    console.error("Send email error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
