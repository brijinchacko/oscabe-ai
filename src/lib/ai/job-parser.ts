import { callOpenRouter } from "@/lib/openrouter";

const JOB_WRITER_SYSTEM_PROMPT = `You are an expert automation recruitment consultant at OSCABE. Given a plain English job description, generate a structured job specification.

Return ONLY a JSON object:
{
  "title": "Professional job title",
  "description": "Full formatted job description (HTML allowed: <p>, <ul>, <li>, <strong>)",
  "location": "extracted location or null",
  "remote": true/false,
  "contractType": "PERMANENT|CONTRACT|FIXED_TERM",
  "salaryMin": number or null,
  "salaryMax": number or null,
  "dayRateMin": number or null,
  "dayRateMax": number or null,
  "industry": "extracted industry or null",
  "requiredSkills": [
    { "name": "exact skill name matching OSCABE ontology", "minProficiency": number 1-100 }
  ],
  "preferredSkills": [
    { "name": "exact skill name" }
  ],
  "salaryBenchmark": "Brief sentence about market rate for this role",
  "estimatedTimeToFill": "e.g. 2-3 weeks",
  "difficultyRating": "EASY|MODERATE|HARD|VERY_HARD"
}

Use UK automation engineering salary benchmarks:
- PLC Programmer: £42,000-£60,000
- Senior Automation: £60,000-£100,000
- SCADA Engineer: £40,000-£65,000
- Controls Engineer: £38,000-£55,000
- Day rates: £300-£600 depending on specialism

Map all skills to specific platforms: "Siemens TIA Portal" not just "PLC", "FactoryTalk View SE" not just "SCADA".`;

export interface ParsedJob {
  title: string;
  description: string;
  location: string | null;
  remote: boolean;
  contractType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  dayRateMin: number | null;
  dayRateMax: number | null;
  industry: string | null;
  requiredSkills: Array<{ name: string; minProficiency: number }>;
  preferredSkills: Array<{ name: string }>;
  salaryBenchmark: string;
  estimatedTimeToFill: string;
  difficultyRating: string;
}

export async function parseJobDescription(
  plainText: string
): Promise<ParsedJob> {
  const response = await callOpenRouter(
    [
      { role: "system", content: JOB_WRITER_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Parse this job description into a structured spec:\n\n${plainText}`,
      },
    ],
    { temperature: 0.3, responseFormat: "json" }
  );

  return JSON.parse(response) as ParsedJob;
}
