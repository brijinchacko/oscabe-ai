import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedIn: z.string().optional(),
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
      const { userId: clerkId } = await auth();
      if (clerkId) {
        const user = await prisma.user.findUnique({
          where: { clerkId },
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
        type: "REGISTRATION",
        title: "New candidate registered",
        content: `${data.firstName} ${data.lastName} (${data.email}) registered via the website.`,
        candidateId: candidate.id,
        userId: linkedUserId || null,
      },
    });

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
