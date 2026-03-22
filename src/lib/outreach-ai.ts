/**
 * Claude-powered AI utilities for outreach personalisation and analysis.
 *
 * Built on top of the existing OpenRouter integration so all AI calls
 * go through a single, configurable gateway.
 */

import { callOpenRouter } from "@/lib/openrouter";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProspectData {
  first_name: string;
  last_name: string;
  title: string;
  company: string;
  industry?: string;
  location?: string;
  linkedin_url?: string;
  /** Any extra context scraped or enriched (recent news, funding, etc.) */
  extra_context?: string;
}

export interface PersonalisedEmail {
  subject: string;
  body: string;
  /** Short note explaining the personalisation angle used */
  personalisation_note: string;
}

export type ReplySentiment =
  | "INTERESTED"
  | "NOT_INTERESTED"
  | "OOO"
  | "WRONG_PERSON"
  | "MEETING_REQUEST";

export interface ReplyClassification {
  sentiment: ReplySentiment;
  confidence: number;
  summary: string;
  /** Suggested next action (e.g. "Schedule call", "Remove from sequence") */
  suggested_action: string;
}

export interface OutreachSummary {
  /** Natural-language weekly performance summary */
  summary: string;
  /** Top 3 actionable recommendations */
  recommendations: string[];
  /** Key metrics highlighted */
  highlights: {
    label: string;
    value: string;
    trend: "up" | "down" | "flat";
  }[];
}

export interface OutreachMetrics {
  emails_sent: number;
  emails_opened: number;
  emails_replied: number;
  emails_bounced: number;
  open_rate: number;
  reply_rate: number;
  bounce_rate: number;
  meetings_booked: number;
  positive_replies: number;
  negative_replies: number;
  period: string;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a personalised email for a prospect using their enriched data
 * and a base template.
 *
 * @param prospect - Enriched prospect data
 * @param template - Base email template with optional `{{placeholders}}`
 * @returns Personalised email with subject, body, and personalisation note
 */
export async function personaliseEmail(
  prospect: ProspectData,
  template: string
): Promise<PersonalisedEmail> {
  try {
    const systemPrompt = `You are an expert B2B cold-email copywriter. Your job is to personalise outreach emails so they feel genuinely relevant to the recipient, not spammy or generic.

Rules:
- Keep the email concise (under 150 words for the body).
- Reference something specific about the prospect or their company.
- Maintain a professional but warm tone.
- Do NOT use clickbait or misleading subject lines.
- Return valid JSON only.`;

    const userPrompt = `Personalise this email template for the prospect below.

PROSPECT:
Name: ${prospect.first_name} ${prospect.last_name}
Title: ${prospect.title}
Company: ${prospect.company}
Industry: ${prospect.industry ?? "Unknown"}
Location: ${prospect.location ?? "Unknown"}
LinkedIn: ${prospect.linkedin_url ?? "N/A"}
Extra context: ${prospect.extra_context ?? "None"}

TEMPLATE:
${template}

Return JSON with keys: "subject", "body", "personalisation_note"`;

    const raw = await callOpenRouter(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.7, responseFormat: "json" }
    );

    const parsed = JSON.parse(raw);
    return {
      subject: parsed.subject ?? "",
      body: parsed.body ?? "",
      personalisation_note: parsed.personalisation_note ?? "",
    };
  } catch (error) {
    console.error("[outreach-ai] personaliseEmail failed:", error);
    throw error;
  }
}

/**
 * Classify an inbound reply by sentiment so it can be routed or
 * handled automatically.
 *
 * @param replyText - The raw text of the inbound reply
 * @returns Classification with sentiment, confidence, summary, and suggested action
 */
export async function classifyReply(
  replyText: string
): Promise<ReplyClassification> {
  try {
    const systemPrompt = `You classify inbound email replies into exactly one of these categories:
- INTERESTED - prospect wants to learn more or continue the conversation
- NOT_INTERESTED - prospect declines or asks to be removed
- OOO - out-of-office / auto-reply
- WRONG_PERSON - the recipient says they are not the right contact
- MEETING_REQUEST - prospect explicitly requests a meeting or call

Return valid JSON with keys: "sentiment", "confidence" (0-1), "summary", "suggested_action"`;

    const raw = await callOpenRouter(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Classify this reply:\n\n${replyText}` },
      ],
      { temperature: 0.1, responseFormat: "json" }
    );

    const parsed = JSON.parse(raw);
    return {
      sentiment: parsed.sentiment ?? "NOT_INTERESTED",
      confidence: parsed.confidence ?? 0,
      summary: parsed.summary ?? "",
      suggested_action: parsed.suggested_action ?? "",
    };
  } catch (error) {
    console.error("[outreach-ai] classifyReply failed:", error);
    throw error;
  }
}

/**
 * Generate A/B test subject line variants from a base subject.
 *
 * @param baseSubject - The original subject line
 * @param count - Number of variants to generate (default 3)
 * @returns Array of subject line variants
 */
export async function generateSubjectVariants(
  baseSubject: string,
  count: number = 3
): Promise<string[]> {
  try {
    const systemPrompt = `You are an expert email subject line writer for B2B outreach.
Generate subject line variants for A/B testing.
Each variant should take a different angle (curiosity, value prop, social proof, question, etc.).
Keep them under 60 characters.
Return valid JSON: { "variants": ["...", "..."] }`;

    const raw = await callOpenRouter(
      [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Generate ${count} subject line variants based on:\n"${baseSubject}"`,
        },
      ],
      { temperature: 0.8, responseFormat: "json" }
    );

    const parsed = JSON.parse(raw);
    return (parsed.variants as string[]) ?? [];
  } catch (error) {
    console.error("[outreach-ai] generateSubjectVariants failed:", error);
    throw error;
  }
}

/**
 * Suggest the optimal send time for a prospect based on their profile.
 *
 * @param prospectData - Prospect information (especially location and title)
 * @returns Suggested send time as a human-readable string and ISO time
 */
export async function suggestOptimalSendTime(
  prospectData: ProspectData
): Promise<{ suggestion: string; iso_time: string; timezone: string }> {
  try {
    const systemPrompt = `You are an email deliverability expert. Based on the prospect's role, industry, and location, suggest the single best day-of-week and time to send a cold email for maximum open rates.
Return valid JSON with keys: "suggestion" (human-readable), "iso_time" (next occurrence as ISO 8601), "timezone" (IANA timezone)`;

    const raw = await callOpenRouter(
      [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Suggest the best send time for:
Name: ${prospectData.first_name} ${prospectData.last_name}
Title: ${prospectData.title}
Company: ${prospectData.company}
Industry: ${prospectData.industry ?? "Unknown"}
Location: ${prospectData.location ?? "Unknown"}`,
        },
      ],
      { temperature: 0.3, responseFormat: "json" }
    );

    const parsed = JSON.parse(raw);
    return {
      suggestion: parsed.suggestion ?? "",
      iso_time: parsed.iso_time ?? "",
      timezone: parsed.timezone ?? "UTC",
    };
  } catch (error) {
    console.error("[outreach-ai] suggestOptimalSendTime failed:", error);
    throw error;
  }
}

/**
 * Generate a weekly outreach performance summary with recommendations.
 *
 * @param metrics - Campaign performance metrics for the period
 * @returns Natural-language summary with actionable recommendations
 */
/**
 * Generate outreach email copy for a campaign sequence step.
 *
 * @param params - Segment, step number, and purpose
 * @returns Generated subject and body with personalisation tokens
 */
export async function generateOutreachCopy(params: {
  segment: string;
  stepNumber: number;
  purpose: string;
}): Promise<{ subject: string; body: string }> {
  try {
    const systemPrompt = `You are a B2B outreach copywriter for OSCABE, a UK-based automation recruitment agency. Write cold outreach emails to hiring managers and agency owners.

Rules:
- Keep emails concise: 3-5 sentences max for the body
- Personalize using tokens: {{firstName}}, {{company}}, {{jobTitle}}
- Include a clear value proposition and call to action
- Tone: professional, friendly, direct. Not salesy.
- Use {{firstName}} and other tokens as literal text - they will be replaced later
- Return valid JSON with "subject" and "body" fields.`;

    const userPrompt = `Generate outreach email copy:

Segment: ${params.segment}
Sequence step: ${params.stepNumber} (${params.stepNumber === 1 ? "initial outreach" : `follow-up #${params.stepNumber - 1}`})
Purpose: ${params.purpose}

Return JSON with keys: "subject", "body". Body should be plain text with line breaks.`;

    const raw = await callOpenRouter(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.7, responseFormat: "json" }
    );

    const parsed = JSON.parse(raw);
    return {
      subject: parsed.subject ?? "Quick question, {{firstName}}",
      body: parsed.body ?? "",
    };
  } catch (error) {
    console.error("[outreach-ai] generateOutreachCopy failed:", error);
    return {
      subject: "Quick question, {{firstName}}",
      body: "Hi {{firstName}},\n\nI wanted to reach out about...",
    };
  }
}

export async function summariseOutreachPerformance(
  metrics: OutreachMetrics
): Promise<OutreachSummary> {
  try {
    const systemPrompt = `You are an outreach analytics advisor. Analyse the campaign metrics and produce a concise weekly performance summary.
Include:
1. A 2-3 sentence natural-language summary of performance.
2. Top 3 specific, actionable recommendations.
3. 3-5 key metric highlights with trend direction.

Return valid JSON with keys: "summary", "recommendations" (array of strings), "highlights" (array of { "label", "value", "trend": "up"|"down"|"flat" })`;

    const raw = await callOpenRouter(
      [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Weekly outreach metrics (${metrics.period}):
- Emails sent: ${metrics.emails_sent}
- Opened: ${metrics.emails_opened} (${metrics.open_rate}%)
- Replied: ${metrics.emails_replied} (${metrics.reply_rate}%)
- Bounced: ${metrics.emails_bounced} (${metrics.bounce_rate}%)
- Meetings booked: ${metrics.meetings_booked}
- Positive replies: ${metrics.positive_replies}
- Negative replies: ${metrics.negative_replies}`,
        },
      ],
      { temperature: 0.4, responseFormat: "json" }
    );

    const parsed = JSON.parse(raw);
    return {
      summary: parsed.summary ?? "",
      recommendations: parsed.recommendations ?? [],
      highlights: parsed.highlights ?? [],
    };
  } catch (error) {
    console.error(
      "[outreach-ai] summariseOutreachPerformance failed:",
      error
    );
    throw error;
  }
}
