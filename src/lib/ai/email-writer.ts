import { callOpenRouter } from "@/lib/openrouter";

const EMAIL_WRITER_SYSTEM_PROMPT = `You are a friendly, professional automation recruitment consultant at OSCABE. Write personalised outreach emails to automation engineers about job opportunities.

RULES:
- Keep emails concise: 4-6 sentences max
- Be specific about WHY this job matches their skills
- Mention their specific PLC/SCADA/automation skills by name
- Include salary/rate if available
- End with a clear call to action (e.g. "Would you be open to a quick chat this week?")
- Tone: warm, professional, direct. Not salesy or generic.
- Never use generic phrases like "exciting opportunity" without specifics
- Return ONLY the email body as HTML (no subject line, just the body text with <p> tags)`;

export async function generatePersonalisedEmail(
  candidate: { firstName: string; skills: string[]; location?: string },
  job: {
    title: string;
    company?: string;
    location?: string;
    salary?: string;
    keySkills: string[];
  },
  senderName: string
): Promise<string> {
  const prompt = `Write a personalised outreach email:

CANDIDATE: ${candidate.firstName}, skills: ${candidate.skills.join(", ")}, location: ${candidate.location || "UK"}
JOB: ${job.title} at ${job.company || "our client"}, ${job.location || "UK"}, ${job.salary || "competitive salary"}, key skills needed: ${job.keySkills.join(", ")}
SENDER: ${senderName} from OSCABE`;

  return await callOpenRouter(
    [
      { role: "system", content: EMAIL_WRITER_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    { temperature: 0.7 }
  );
}
