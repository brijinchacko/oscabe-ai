import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

    // Try to send email via Resend (gracefully fail if not configured)
    try {
      if (process.env.RESEND_API_KEY) {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "noreply@oscabe.com",
          to: "info@oscabe.com",
          subject: `New Contact Form: ${enquiryType || "General"} from ${name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
            <p><strong>Company:</strong> ${company || "Not provided"}</p>
            <p><strong>Type:</strong> ${enquiryType || "General"}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          `,
        });
      } else {
        console.log("Resend not configured. Contact form submission:", { name, email, phone, company, enquiryType, message });
      }
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }

    return NextResponse.json({ success: true, message: "Thank you for your message. We'll be in touch shortly." });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
