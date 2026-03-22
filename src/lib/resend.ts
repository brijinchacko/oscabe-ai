import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY not configured - emails will be logged but not sent");
}

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@oscabe.com";
export const FROM_NAME = "OSCABE";

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  if (!resend) {
    console.log(`[Email Mock] To: ${to}, Subject: ${subject}`);
    return { id: `mock-${Date.now()}`, success: true };
  }

  try {
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      replyTo: replyTo || "info@oscabe.com",
    });
    return { id: result.data?.id, success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { id: null, success: false, error };
  }
}
