import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { sendEmail } from "@/lib/microsoft";

export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const { to, subject, body: emailBody, candidateId, clientId } = body;

  if (!to || !subject || !emailBody) {
    return NextResponse.json(
      { error: "to, subject, and body are required" },
      { status: 400 }
    );
  }

  try {
    const result = await sendEmail(user!.id, to, subject, emailBody);

    // Log as Activity in CRM
    await prisma.activity.create({
      data: {
        type: "EMAIL_SENT",
        title: `Email: ${subject}`,
        content: `Sent to ${to} via Outlook`,
        userId: user!.id,
        candidateId: candidateId || undefined,
        clientId: clientId || undefined,
      },
    });

    // Also create an EmailLog
    await prisma.emailLog.create({
      data: {
        sentById: user!.id,
        toEmail: to,
        subject,
        status: "sent",
      },
    });

    return NextResponse.json({ success: true, messageId: result?.id });
  } catch (err) {
    console.error("Failed to send email:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
