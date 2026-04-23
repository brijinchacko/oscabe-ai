import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/resend";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedIn: z.string().optional(),
  specialism: z.string().optional(),
  industry: z.string().optional(),
  headline: z.string().optional(),
  summary: z.string().optional(),
  cvText: z.string().optional(),
  skillIds: z.array(z.string()).optional(),
  skillNames: z.array(z.string()).optional(),
  contractType: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  dayRateMin: z.number().optional(),
  dayRateMax: z.number().optional(),
  noticePeriod: z.string().optional(),
  availableFrom: z.string().optional(),
  rightToWork: z.boolean().optional(),
  gdprConsent: z.literal(true, { message: "GDPR consent is required" }),
  jobId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Validation failed";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const data = parsed.data;

    // Check if email already exists
    const existing = await prisma.candidate.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A candidate with this email is already registered. Please sign in or use a different email." },
        { status: 409 }
      );
    }

    // Optionally check auth — if user is signed in, link the candidate
    let linkedUserId: string | undefined;
    try {
      const session = await auth();
      if (session?.user?.id) {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
        });
        if (user) {
          linkedUserId = user.id;
        }
      }
    } catch {
      // Auth not available — that's fine for public registration
    }

    // Create candidate record
    const candidate = await prisma.candidate.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
        location: data.location || null,
        headline: data.headline || null,
        summary: data.summary || null,
        cvParsedData: data.cvText || null,
        linkedIn: data.linkedIn || null,
        specialism: data.specialism || null,
        industry: data.industry || null,
        salaryMin: data.salaryMin || null,
        salaryMax: data.salaryMax || null,
        dayRateMin: data.dayRateMin || null,
        dayRateMax: data.dayRateMax || null,
        noticePeriod: data.noticePeriod || null,
        availableFrom: data.availableFrom ? new Date(data.availableFrom) : null,
        rightToWork: data.rightToWork || false,
        status: "ACTIVE",
        source: "WEBSITE",
        userId: linkedUserId || null,
      },
    });

    // Create CandidateSkill records for selected skills (by ID)
    if (data.skillIds && data.skillIds.length > 0) {
      for (const skillId of data.skillIds) {
        await prisma.candidateSkill.create({
          data: {
            candidateId: candidate.id,
            skillId,
          },
        }).catch(() => {
          // Skip duplicate
        });
      }
    }

    // For "common skill" names that aren't in the DB, try to find or skip them
    if (data.skillNames && data.skillNames.length > 0) {
      for (const skillName of data.skillNames) {
        const skill = await prisma.skill.findFirst({
          where: {
            OR: [
              { name: skillName },
              { shortName: skillName },
            ],
          },
        });
        if (skill) {
          await prisma.candidateSkill.create({
            data: {
              candidateId: candidate.id,
              skillId: skill.id,
            },
          }).catch(() => {
            // Skip duplicate
          });
        }
      }
    }

    // Store GDPR consent
    await prisma.gdprConsent.create({
      data: {
        email: data.email,
        consentType: "candidate_registration",
        consented: true,
        ipAddress:
          req.headers.get("x-forwarded-for") ||
          req.headers.get("x-real-ip") ||
          undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      },
    });

    // Activity log
    await prisma.activity.create({
      data: {
        type: "CANDIDATE_REGISTERED",
        title: `New candidate: ${data.firstName} ${data.lastName}`,
        content: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || null,
          location: data.location || null,
          specialism: data.specialism || null,
          industry: data.industry || null,
          headline: data.headline || null,
          contractType: data.contractType || null,
          status: "NEW",
        }),
        candidateId: candidate.id,
        userId: linkedUserId || null,
        metadata: JSON.stringify({
          email: data.email,
          candidateId: candidate.id,
        }),
      },
    });

    // If candidate applied for a specific job, create an Application
    if (data.jobId) {
      try {
        const job = await prisma.job.findUnique({ where: { id: data.jobId } });
        if (job) {
          await prisma.application.create({
            data: {
              candidateId: candidate.id,
              jobId: job.id,
              stage: "SOURCED",
              notes: `Applied via website registration`,
            },
          });
          await prisma.activity.create({
            data: {
              type: "APPLICATION",
              title: `Applied for: ${job.title}`,
              content: `${data.firstName} ${data.lastName} applied for ${job.title} via the website.`,
              candidateId: candidate.id,
              jobId: job.id,
            },
          });
        }
      } catch {}
    }

    // Notify all ADMIN users
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    await Promise.all(
      admins.map((admin) =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            title: "New Candidate Registered",
            message: `${data.firstName} ${data.lastName} (${data.email}) registered via the website.`,
            type: "LEAD",
            link: `/crm/candidates/${candidate.id}`,
          },
        })
      )
    ).catch(() => {});

    // Send email notification to OSCABE team
    await sendEmail({
      to: ["info@oscabe.com", "info@wartens.com"],
      subject: `New Candidate Registration - ${data.firstName} ${data.lastName}`,
      html: `
        <h2>New Candidate Registration</h2>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${data.firstName} ${data.lastName}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${data.email}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${data.phone || "Not provided"}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Location</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${data.location || "Not specified"}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Specialism</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${data.specialism || "Not specified"}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Industry</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${data.industry || "Not specified"}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Headline</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${data.headline || "Not provided"}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Contract Type</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${data.contractType || "Not specified"}</td></tr>
        </table>
        <p><strong>Candidate ID:</strong> ${candidate.id}</p>
      `,
    }).catch(() => {});

    // Push to Zoho (fire-and-forget)
    try {
      const { createRecord, isZohoConfigured } = await import("@/lib/zoho");
      if (isZohoConfigured()) {
        createRecord("Candidates", {
          First_Name: data.firstName,
          Last_Name: data.lastName,
          Email: data.email,
          Phone: data.phone,
          City: data.location,
          Skill_Set: data.skillNames?.join(", ") || "",
          Current_Job_Title: data.headline,
        }).catch(() => {});
      }
    } catch {}

    // If user is signed in, update their role to CANDIDATE
    if (linkedUserId) {
      await prisma.user.update({
        where: { id: linkedUserId },
        data: { role: "CANDIDATE" },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful! We'll be in touch soon.",
      candidateId: candidate.id,
    });
  } catch (error) {
    console.error("Register candidate error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
