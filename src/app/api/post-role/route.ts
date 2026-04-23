import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/resend";

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

    // Link job to employer if user is authenticated
    try {
      const session = await auth();
      if (session?.user?.id) {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          include: { employer: true },
        });
        if (user?.employer) {
          // Find or create a Client record for this employer's company
          let client = await prisma.client.findFirst({
            where: { companyName: user.employer.companyName },
          });
          if (!client) {
            client = await prisma.client.create({
              data: {
                companyName: user.employer.companyName,
                industry: user.employer.industry || null,
                website: user.employer.website || null,
                source: "EMPLOYER_PORTAL",
                pipelineStage: "CLIENT",
              },
            });
          }
          // Update job with employer and client links
          await prisma.job.update({
            where: { id: job.id },
            data: {
              employerId: user.employer.id,
              clientId: client.id,
            },
          });
        }
      }
    } catch {
      // Auth not available or linking failed — non-critical, continue
    }

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

    // Create Activity record
    await prisma.activity.create({
      data: {
        type: "JOB_POSTED",
        title: `New role posted: ${roleTitle} at ${companyName}`,
        content: JSON.stringify({
          companyName,
          contactName,
          email,
          phone: phone || null,
          roleTitle,
          location: location || null,
          remote: remote || false,
          contractType: contractType || "PERMANENT",
          salaryMin: salaryMin || null,
          salaryMax: salaryMax || null,
          dayRateMin: dayRateMin || null,
          dayRateMax: dayRateMax || null,
          industry: industry || null,
          description,
          status: "NEW",
        }),
        jobId: job.id,
        metadata: JSON.stringify({
          email,
          companyName,
          jobId: job.id,
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
            title: "New Role Posted",
            message: `New role posted: ${roleTitle} at ${companyName} by ${contactName}.`,
            type: "LEAD",
            link: `/crm/jobs/${job.id}`,
          },
        })
      )
    ).catch(() => {});

    // Send email notification to OSCABE team
    await sendEmail({
      to: ["info@oscabe.com", "info@wartens.com"],
      subject: `New Role Posted: ${roleTitle} at ${companyName}`,
      html: `
        <h2>New Role Submission</h2>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Company</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${companyName}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Contact</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${contactName}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${email}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${phone || "Not provided"}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Role</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${roleTitle}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Location</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${location || "Not specified"}${remote ? " (Remote)" : ""}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Contract Type</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${contractType || "Permanent"}</td></tr>
        </table>
        <h3>Description</h3>
        <p>${description}</p>
      `,
    }).catch(() => {});

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
