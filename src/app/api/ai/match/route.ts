import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { matchCandidateToJob } from "@/lib/ai/matcher";
import { isAIConfigured } from "@/lib/openrouter";

export async function POST(request: Request) {
  try {
    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: "AI features require an OpenRouter API key. Configure it in Settings → Integrations." },
        { status: 503 }
      );
    }

    const { jobId, candidateId } = await request.json();

    if (!jobId) {
      return NextResponse.json(
        { error: "jobId is required" },
        { status: 400 }
      );
    }

    // Load job with skills
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        skills: { include: { skill: true } },
        client: { select: { companyName: true } },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const jobSkills = job.skills.map((js) => ({
      name: js.skill.name,
      required: js.required,
      minScore: js.minScore ?? undefined,
    }));

    // If candidateId provided, match single candidate
    if (candidateId) {
      const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
        include: { skills: { include: { skill: true } } },
      });

      if (!candidate) {
        return NextResponse.json(
          { error: "Candidate not found" },
          { status: 404 }
        );
      }

      const result = await matchCandidateToJob({
        jobTitle: job.title,
        jobSkills,
        jobIndustry: job.industry ?? undefined,
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        candidateSkills: candidate.skills.map((cs) => ({
          name: cs.skill.name,
          proficiency: cs.proficiency ?? 50,
          yearsExp: cs.yearsExp ?? undefined,
        })),
      });

      // Update application if exists
      const application = await prisma.application.findUnique({
        where: {
          candidateId_jobId: { candidateId, jobId },
        },
      });

      if (application) {
        await prisma.application.update({
          where: { id: application.id },
          data: {
            matchScore: result.matchScore,
            gapAnalysis: JSON.stringify(result),
          },
        });
      }

      return NextResponse.json({
        results: [
          {
            candidateId: candidate.id,
            candidateName: `${candidate.firstName} ${candidate.lastName}`,
            email: candidate.email,
            location: candidate.location,
            ...result,
          },
        ],
      });
    }

    // Match all candidates with skills
    const candidates = await prisma.candidate.findMany({
      where: { status: "ACTIVE" },
      include: { skills: { include: { skill: true } } },
      take: 50, // Limit to avoid excessive API calls
    });

    // Filter candidates that have at least one overlapping skill
    const jobSkillNames = new Set(jobSkills.map((s) => s.name.toLowerCase()));
    const relevantCandidates = candidates.filter((c) =>
      c.skills.some((cs) => jobSkillNames.has(cs.skill.name.toLowerCase()))
    );

    // Take top 20 most relevant
    const toMatch = relevantCandidates.slice(0, 20);

    const results = [];
    for (const candidate of toMatch) {
      try {
        const result = await matchCandidateToJob({
          jobTitle: job.title,
          jobSkills,
          jobIndustry: job.industry ?? undefined,
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          candidateSkills: candidate.skills.map((cs) => ({
            name: cs.skill.name,
            proficiency: cs.proficiency ?? 50,
            yearsExp: cs.yearsExp ?? undefined,
          })),
        });

        results.push({
          candidateId: candidate.id,
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          email: candidate.email,
          location: candidate.location,
          ...result,
        });
      } catch {
        // Skip failed matches
      }
    }

    // Sort by match score descending
    results.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Match error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to match candidates";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
