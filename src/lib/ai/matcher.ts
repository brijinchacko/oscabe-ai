import { callOpenRouter } from "@/lib/openrouter";

const MATCHER_SYSTEM_PROMPT = `You are an expert automation recruitment matcher for OSCABE. Given a job's required skills and a candidate's skills, calculate a match score and gap analysis.

Return ONLY a JSON object:
{
  "matchScore": number 0-100,
  "matchedSkills": [
    { "skill": "name", "candidateScore": number, "required": true/false, "gap": "none|minor|major" }
  ],
  "missingSkills": [
    { "skill": "name", "importance": "critical|preferred|nice-to-have", "timeToLearn": "e.g. 2-4 weeks", "trainingRecommendation": "e.g. edWartens Rockwell Bootcamp" }
  ],
  "summary": "2-3 sentence assessment of the match",
  "timeToReady": "e.g. Ready now | 2 weeks with training | 3-6 months",
  "recommendation": "STRONG_MATCH|GOOD_WITH_TRAINING|PARTIAL_MATCH|WEAK_MATCH"
}

RULES:
- A Siemens expert is NOT automatically a Rockwell expert - cross-platform transfer takes 3-6 months
- Safety PLC experience (SIL, IEC 61508) is highly valued and hard to substitute
- Industry-specific knowledge (pharma GMP, water treatment, ATEX) is important for sector roles
- Score 90+ only if candidate meets ALL required skills at required proficiency
- Score 70-89 if candidate meets most required skills with minor gaps fillable by training
- Score 50-69 if significant gaps exist but foundation is strong
- Below 50 if fundamental skills are missing
- Always recommend specific training for gaps where applicable`;

export interface MatchInput {
  jobTitle: string;
  jobSkills: Array<{ name: string; required: boolean; minScore?: number }>;
  jobIndustry?: string;
  candidateName: string;
  candidateSkills: Array<{
    name: string;
    proficiency: number;
    yearsExp?: number;
  }>;
  candidateIndustry?: string[];
}

export interface MatchResult {
  matchScore: number;
  matchedSkills: Array<{
    skill: string;
    candidateScore: number;
    required: boolean;
    gap: "none" | "minor" | "major";
  }>;
  missingSkills: Array<{
    skill: string;
    importance: "critical" | "preferred" | "nice-to-have";
    timeToLearn: string;
    trainingRecommendation: string;
  }>;
  summary: string;
  timeToReady: string;
  recommendation:
    | "STRONG_MATCH"
    | "GOOD_WITH_TRAINING"
    | "PARTIAL_MATCH"
    | "WEAK_MATCH";
}

export async function matchCandidateToJob(
  input: MatchInput
): Promise<MatchResult> {
  const prompt = `Match this candidate to this job:

JOB: ${input.jobTitle}
Required Skills: ${input.jobSkills
    .filter((s) => s.required)
    .map((s) => `${s.name} (min: ${s.minScore || "any"})`)
    .join(", ")}
Preferred Skills: ${input.jobSkills
    .filter((s) => !s.required)
    .map((s) => s.name)
    .join(", ")}
Industry: ${input.jobIndustry || "Not specified"}

CANDIDATE: ${input.candidateName}
Skills: ${input.candidateSkills
    .map(
      (s) => `${s.name} (${s.proficiency}/100, ${s.yearsExp || "?"} years)`
    )
    .join(", ")}
Industry Experience: ${input.candidateIndustry?.join(", ") || "Not specified"}`;

  const response = await callOpenRouter(
    [
      { role: "system", content: MATCHER_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    { temperature: 0.2, responseFormat: "json" }
  );

  return JSON.parse(response) as MatchResult;
}
