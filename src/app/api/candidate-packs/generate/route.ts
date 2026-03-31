import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

const generateSchema = z.object({
  specialism: z.string().min(1, "Specialism is required"),
  title: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Verify user is employer or agency
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employer: true, agency: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.employer && !user.agency) {
      return NextResponse.json(
        { error: "Only employers and agencies can generate candidate packs" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Validation failed";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { specialism, title } = parsed.data;

    // Query matching candidates
    const candidates = await prisma.candidate.findMany({
      where: {
        status: "ACTIVE",
        skills: {
          some: {
            skill: {
              OR: [
                { name: { contains: specialism } },
                { category: { contains: specialism } },
                { platform: { contains: specialism } },
              ],
            },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        headline: true,
        location: true,
        availableFrom: true,
        salaryMin: true,
        salaryMax: true,
        dayRateMin: true,
        dayRateMax: true,
        noticePeriod: true,
        skills: {
          select: {
            yearsExp: true,
            proficiency: true,
            skill: {
              select: {
                name: true,
                category: true,
              },
            },
          },
        },
      },
      take: 10,
    });

    // Anonymise profiles
    const anonymisedCandidates = candidates.map((c) => {
      const initials =
        (c.firstName?.[0] || "") + (c.lastName?.[0] || "");

      const totalYears = c.skills.reduce((max, s) => {
        return Math.max(max, s.yearsExp || 0);
      }, 0);

      return {
        id: c.id,
        initials: initials.toUpperCase(),
        headline: c.headline || "Automation & Controls Engineer",
        location: c.location || "United Kingdom",
        yearsExperience: totalYears,
        noticePeriod: c.noticePeriod || "Not specified",
        skills: c.skills.map((s) => ({
          name: s.skill.name,
          category: s.skill.category,
          yearsExp: s.yearsExp,
          proficiency: s.proficiency,
        })),
        availability: c.availableFrom
          ? c.availableFrom <= new Date()
            ? "Immediately available"
            : `Available from ${c.availableFrom.toLocaleDateString("en-GB")}`
          : "Available on notice",
        salaryRange:
          c.salaryMin && c.salaryMax
            ? `\u00a3${c.salaryMin.toLocaleString()} - \u00a3${c.salaryMax.toLocaleString()}`
            : undefined,
        dayRate:
          c.dayRateMin && c.dayRateMax
            ? `\u00a3${c.dayRateMin} - \u00a3${c.dayRateMax}/day`
            : undefined,
      };
    });

    // Log the pack generation as an activity
    await prisma.activity.create({
      data: {
        type: "CANDIDATE_PACK_GENERATED",
        title: title || `Candidate Pack: ${specialism}`,
        content: JSON.stringify({
          specialism,
          candidateCount: anonymisedCandidates.length,
          candidateIds: anonymisedCandidates.map((c) => c.id),
        }),
        userId: user.id,
        metadata: JSON.stringify({
          specialism,
          employerId: user.employer?.id || null,
          agencyId: user.agency?.id || null,
        }),
      },
    });

    const pack = {
      title: title || `${specialism} Candidate Pack`,
      specialism,
      generatedAt: new Date().toISOString(),
      candidates: anonymisedCandidates,
    };

    return NextResponse.json({ pack });
  } catch (error) {
    console.error("Generate candidate pack error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
