import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const specialism = req.nextUrl.searchParams.get("specialism");
    if (!specialism) {
      return NextResponse.json(
        { error: "specialism query parameter is required" },
        { status: 400 }
      );
    }

    // Search for candidates whose skills match the specialism
    // We search by skill name or category containing the specialism term
    const searchTerm = `%${specialism}%`;

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
        skills: {
          select: {
            yearsExp: true,
            skill: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      take: 10,
    });

    // Anonymise the profiles - show initials only, strip PII
    const anonymised = candidates.map((c) => {
      const initials =
        (c.firstName?.[0] || "") + (c.lastName?.[0] || "");

      // Calculate total years experience from skills
      const totalYears = c.skills.reduce((max, s) => {
        return Math.max(max, s.yearsExp || 0);
      }, 0);

      return {
        id: c.id,
        initials: initials.toUpperCase(),
        headline: c.headline || "Automation & Controls Engineer",
        location: c.location || "United Kingdom",
        yearsExperience: totalYears,
        skills: c.skills.map((s) => s.skill.name),
        availability: c.availableFrom
          ? c.availableFrom <= new Date()
            ? "Immediately available"
            : `Available from ${c.availableFrom.toLocaleDateString("en-GB")}`
          : "Available on notice",
      };
    });

    return NextResponse.json({ candidates: anonymised, total: anonymised.length });
  } catch (error) {
    console.error("Candidate packs error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
