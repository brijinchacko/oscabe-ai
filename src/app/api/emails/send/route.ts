import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import { sendEmail } from "@/lib/resend";
import { wrapEmailHtml } from "@/lib/email-html";

const sendEmailSchema = z.object({
  to: z.string().email("Valid email is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  candidateId: z.string().optional(),
  clientId: z.string().optional(),
  jobId: z.string().optional(),
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

    const { to, subject, body, candidateId, clientId, jobId } = parsed.data;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Wrap body in HTML email template
    const html = wrapEmailHtml(body, subject);

    // Send the email
    const result = await sendEmail({ to, subject, html });

    // Create EmailLog record
    const emailLog = await prisma.emailLog.create({
      data: {
        sentById: user?.id,
        toEmail: to,
        subject,
        status: result.success ? "sent" : "failed",
        resendId: result.id || null,
      },
    });

    // Create Activity records for linked entities
    const senderName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "System";

    if (candidateId) {
      await prisma.activity.create({
        data: {
          type: "EMAIL",
          title: `Email sent: ${subject}`,
          content: `Email sent to ${to} by ${senderName}`,
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
          content: `Email sent to ${to} by ${senderName}`,
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
          content: `Email sent to ${to} by ${senderName}`,
          jobId,
          userId: user?.id,
        },
      });
    }

    return NextResponse.json({ success: result.success, emailLogId: emailLog.id });
  } catch (error) {
    console.error("Send email error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
