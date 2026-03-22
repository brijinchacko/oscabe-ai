import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyName,
      contactName,
      email,
      phone,
      roleTitle,
      description,
      location,
      remote,
      contractType,
      salaryMin,
      salaryMax,
      dayRateMin,
      dayRateMax,
      industry,
      gdprConsent,
    } = body;

    // Validate required fields
    if (!companyName || !contactName || !email || !roleTitle || !description) {
      return NextResponse.json(
        { error: "Company name, contact name, email, role title, and description are required" },
        { status: 400 }
      );
    }

    if (!gdprConsent) {
      return NextResponse.json({ error: "GDPR consent is required" }, { status: 400 });
    }

    // Create Job record
    const job = await prisma.job.create({
      data: {
        title: roleTitle,
        description,
        companyName,
        location: location || null,
        remote: remote || false,
        contractType: contractType || "PERMANENT",
        salaryMin: salaryMin ? parseInt(salaryMin, 10) : null,
        salaryMax: salaryMax ? parseInt(salaryMax, 10) : null,
        dayRateMin: dayRateMin ? parseInt(dayRateMin, 10) : null,
        dayRateMax: dayRateMax ? parseInt(dayRateMax, 10) : null,
        industry: industry || null,
        status: "ACTIVE",
        source: "DIRECT",
        notes: `Posted by: ${contactName} (${email}${phone ? `, ${phone}` : ""})`,
      },
    });

    // Store GDPR consent
    await prisma.gdprConsent.create({
      data: {
        email,
        consentType: "post_role",
        consented: true,
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      },
    });

    // Send notification email via Resend (or log if not configured)
    try {
      if (process.env.RESEND_API_KEY) {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "noreply@oscabe.com",
          to: "info@oscabe.com",
          subject: `New Role Posted: ${roleTitle} at ${companyName}`,
          html: `
            <h2>New Role Submission</h2>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Contact:</strong> ${contactName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
            <p><strong>Role:</strong> ${roleTitle}</p>
            <p><strong>Location:</strong> ${location || "Not specified"}${remote ? " (Remote)" : ""}</p>
            <p><strong>Contract Type:</strong> ${contractType || "Permanent"}</p>
            <p><strong>Description:</strong></p>
            <p>${description}</p>
          `,
        });
      } else {
        console.log("Resend not configured. New role posted:", {
          companyName,
          contactName,
          email,
          roleTitle,
          jobId: job.id,
        });
      }
    } catch (emailError) {
      console.error("Failed to send notification email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Your role has been submitted successfully. Our team will review it shortly.",
      jobId: job.id,
    });
  } catch (error) {
    console.error("Post role error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
