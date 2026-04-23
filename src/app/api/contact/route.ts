import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, company, enquiryType, message, gdprConsent } = body;

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    if (!gdprConsent) {
      return NextResponse.json({ error: "GDPR consent is required" }, { status: 400 });
    }

    // Store GDPR consent
    await prisma.gdprConsent.create({
      data: {
        email,
        consentType: "contact_form",
        consented: true,
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      },
    });

    // Create Activity record
    await prisma.activity.create({
      data: {
        type: "CONTACT_FORM",
        title: `New contact form: ${name}`,
        content: JSON.stringify({
          name,
          email,
          phone: phone || null,
          company: company || null,
          enquiryType: enquiryType || "General",
          message,
          status: "NEW",
        }),
        metadata: JSON.stringify({
          email,
          company: company || null,
          enquiryType: enquiryType || "General",
        }),
      },
    });

    // Notify all ADMIN users
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    await Promise.all(
      admins.map((admin) =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            title: "New Contact Form Submission",
            message: `${name} (${email}) submitted a contact form - ${enquiryType || "General"}.`,
            type: "LEAD",
            link: "/crm/leads",
          },
        })
      )
    ).catch(() => {});

    // Send email notification to OSCABE team
    await sendEmail({
      to: ["info@oscabe.com", "info@wartens.com"],
      subject: `New Contact Form Submission - ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${name}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${email}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${phone || "Not provided"}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Company</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${company || "Not provided"}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Enquiry Type</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${enquiryType || "General"}</td></tr>
        </table>
        <h3>Message</h3>
        <p>${message}</p>
      `,
    }).catch(() => {});

    return NextResponse.json({ success: true, message: "Thank you for your message. We'll be in touch shortly." });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
