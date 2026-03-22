import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generatePersonalisedEmail } from "@/lib/ai/email-writer";
import { isAIConfigured } from "@/lib/openrouter";

export async function POST(request: Request) {
  try {
    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: "AI features require an OpenRouter API key. Configure it in Settings → Integrations." },
        { status: 503 }
      );
    }

    const { candidateId, candidateIds, jobId, senderName } =
      await request.json();

    if (!jobId) {
      return NextResponse.json(
        { error: "jobId is required" },
        { status: 400 }
      );
    }

    // Load job
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

    const jobData = {
      title: job.title,
      company: job.client?.companyName || job.companyName || undefined,
      location: job.location || undefined,
      salary: job.salaryMin
        ? `£${job.salaryMin.toLocaleString()}${job.salaryMax ? ` - £${job.salaryMax.toLocaleString()}` : "+"}`
        : job.dayRateMin
          ? `£${job.dayRateMin}${job.dayRateMax ? ` - £${job.dayRateMax}` : "+"}/day`
          : undefined,
      keySkills: job.skills.map((js) => js.skill.name),
    };

    const sender = senderName || "OSCABE Recruitment";

    // Single candidate
    const ids = candidateIds || (candidateId ? [candidateId] : []);
    if (ids.length === 0) {
      return NextResponse.json(
        { error: "candidateId or candidateIds is required" },
        { status: 400 }
      );
    }

    const results = [];
    for (const cId of ids) {
      const candidate = await prisma.candidate.findUnique({
        where: { id: cId },
        include: { skills: { include: { skill: true } } },
      });

      if (!candidate) continue;

      const emailHtml = await generatePersonalisedEmail(
        {
          firstName: candidate.firstName,
          skills: candidate.skills.map((cs) => cs.skill.name),
          location: candidate.location || undefined,
        },
        jobData,
        sender
      );

      results.push({
        candidateId: cId,
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        email: candidate.email,
        emailHtml,
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Email generation error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
