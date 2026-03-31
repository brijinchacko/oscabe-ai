import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseCV } from "@/lib/ai/cv-parser";
import { isAIConfigured } from "@/lib/openrouter";

export async function POST(request: Request) {
  try {
    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: "AI features require an OpenRouter API key. Configure it in Settings → Integrations." },
        { status: 503 }
      );
    }

    const { cvText, candidateId } = await request.json();

    if (!cvText || typeof cvText !== "string") {
      return NextResponse.json(
        { error: "cvText is required" },
        { status: 400 }
      );
    }

    const parsed = await parseCV(cvText);

    // If candidateId provided, update the candidate record
    if (candidateId) {
      const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
      });

      if (!candidate) {
        return NextResponse.json(
          { error: "Candidate not found" },
          { status: 404 }
        );
      }

      // Update candidate profile
      await prisma.candidate.update({
        where: { id: candidateId },
        data: {
          firstName: parsed.firstName || candidate.firstName,
          lastName: parsed.lastName || candidate.lastName,
          email: candidate.email, // Keep existing email
          phone: parsed.phone || candidate.phone,
          location: parsed.location || candidate.location,
          headline: parsed.headline || candidate.headline,
          summary: parsed.summary || candidate.summary,
          noticePeriod: parsed.noticePeriod || candidate.noticePeriod,
          rightToWork: parsed.rightToWork ?? candidate.rightToWork,
          industry: parsed.industry || candidate.industry,
          specialism: parsed.specialism || candidate.specialism,
          cvParsedData: JSON.stringify(parsed),
        },
      });

      // Create/link skills
      let skillsLinked = 0;
      for (const skill of parsed.skills) {
        // Find or create skill
        let dbSkill = await prisma.skill.findFirst({
          where: { name: skill.name },
        });

        if (!dbSkill) {
          dbSkill = await prisma.skill.create({
            data: {
              name: skill.name,
              shortName: skill.name.length > 20 ? skill.name.substring(0, 20) : skill.name,
              category: skill.category || "GENERAL",
              platform: skill.platform,
            },
          });
        }

        // Link to candidate (upsert to avoid duplicates)
        const existing = await prisma.candidateSkill.findUnique({
          where: {
            candidateId_skillId: {
              candidateId,
              skillId: dbSkill.id,
            },
          },
        });

        if (existing) {
          await prisma.candidateSkill.update({
            where: { id: existing.id },
            data: {
              proficiency: skill.proficiency,
              yearsExp: skill.yearsExp,
            },
          });
        } else {
          await prisma.candidateSkill.create({
            data: {
              candidateId,
              skillId: dbSkill.id,
              proficiency: skill.proficiency,
              yearsExp: skill.yearsExp,
            },
          });
        }
        skillsLinked++;
      }

      // Create activity
      await prisma.activity.create({
        data: {
          type: "AI_CV_PARSED",
          title: `CV parsed by AI - ${skillsLinked} skills extracted`,
          content: `Extracted: ${parsed.skills.map((s) => s.name).join(", ")}`,
          candidateId,
        },
      });
    }

    return NextResponse.json({ parsed });
  } catch (error) {
    console.error("CV parse error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to parse CV";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
