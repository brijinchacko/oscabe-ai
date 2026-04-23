import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { sendEmail } from "@/lib/resend";

const enquirySchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  roleType: z.string().min(1, "Role type is required"),
  engineersNeeded: z.string().min(1),
  timeline: z.string().min(1, "Timeline is required"),
  notes: z.string().optional(),
  gdprConsent: z.literal(true, { error: "GDPR consent is required" }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = enquirySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Record GDPR consent
    await prisma.gdprConsent.create({
      data: {
        email: data.email,
        consentType: "remote_engineer_enquiry",
        consented: true,
        ipAddress:
          req.headers.get("x-forwarded-for") ||
          req.headers.get("x-real-ip") ||
          undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      },
    });

    // Create activity record
    await prisma.activity.create({
      data: {
        type: "REMOTE_ENGINEER_ENQUIRY",
        title: `Remote Engineer Enquiry: ${data.roleType} - ${data.companyName}`,
        content: JSON.stringify({
          companyName: data.companyName,
          contactName: data.contactName,
          email: data.email,
          phone: data.phone || "",
          roleType: data.roleType,
          engineersNeeded: data.engineersNeeded,
          timeline: data.timeline,
          notes: data.notes || "",
        }),
      },
    });

    // Notify all ADMIN users via Notification
    const adminUsers = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    if (adminUsers.length > 0) {
      await prisma.notification.createMany({
        data: adminUsers.map((admin) => ({
          userId: admin.id,
          title: "New Remote Engineer Enquiry",
          message: `${data.contactName} from ${data.companyName} enquired about ${data.engineersNeeded} ${data.roleType}(s). Timeline: ${data.timeline}.`,
          type: "LEAD",
          link: "/dashboard",
        })),
      });
    }

    // Send notification email to info@oscabe.com
    await sendEmail({
      to: ["info@oscabe.com", "info@wartens.com"],
      subject: `Remote Engineer Enquiry: ${data.roleType} - ${data.companyName}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #02012B; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">New Remote Engineer Enquiry</h1>
          </div>
          <div style="padding: 24px; background: #f9fafb;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Company</td><td style="padding: 8px 0;">${data.companyName}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Contact</td><td style="padding: 8px 0;">${data.contactName}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Email</td><td style="padding: 8px 0;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Phone</td><td style="padding: 8px 0;">${data.phone || "Not provided"}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Role Type</td><td style="padding: 8px 0;">${data.roleType}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Engineers Needed</td><td style="padding: 8px 0;">${data.engineersNeeded}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Timeline</td><td style="padding: 8px 0;">${data.timeline}</td></tr>
              ${data.notes ? `<tr><td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Notes</td><td style="padding: 8px 0;">${data.notes}</td></tr>` : ""}
            </table>
          </div>
          <div style="padding: 16px; text-align: center; color: #9ca3af; font-size: 12px;">
            OSCABE Remote Engineers Service
          </div>
        </div>
      `,
    });

    // Send confirmation email to enquirer
    await sendEmail({
      to: data.email,
      subject: "Your Remote Engineer Enquiry - OSCABE",
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #02012B; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">OSCABE</h1>
          </div>
          <div style="padding: 24px; background: #f9fafb;">
            <p style="color: #1f2937; font-size: 16px;">Hi ${data.contactName},</p>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
              Thank you for your interest in OSCABE Remote Engineers. We have received your enquiry for
              <strong>${data.engineersNeeded} ${data.roleType}(s)</strong> and will be in touch within 24 hours
              with a tailored proposal.
            </p>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
              In the meantime, if you have any questions, please reply to this email or call us at
              <strong>+44 7442 87 57 87</strong>.
            </p>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
              Best regards,<br />
              The OSCABE Team
            </p>
          </div>
          <div style="padding: 16px; text-align: center; color: #9ca3af; font-size: 12px;">
            OSCABE &mdash; Remote Automation & AI Engineers<br />
            <a href="https://oscabe.com/remote-engineers" style="color: #4540DB;">oscabe.com/remote-engineers</a>
          </div>
        </div>
      `,
      replyTo: "info@oscabe.com",
    });

    return NextResponse.json(
      { success: true, message: "Enquiry submitted successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Remote engineer enquiry error:", error);
    return NextResponse.json(
      { error: "Failed to submit enquiry" },
      { status: 500 },
    );
  }
}
