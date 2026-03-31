export const AVAILABLE_TOKENS = {
  // Candidate tokens
  "{{firstName}}": "Candidate's first name",
  "{{lastName}}": "Candidate's last name",
  "{{fullName}}": "Candidate's full name",
  "{{email}}": "Candidate's email",
  "{{location}}": "Candidate's location",
  "{{topSkill}}": "Candidate's highest-rated skill",
  "{{skills}}": "Comma-separated list of candidate's skills",

  // Job tokens
  "{{jobTitle}}": "Job title",
  "{{jobLocation}}": "Job location",
  "{{jobSalary}}": "Salary range (e.g. £45,000 - £55,000)",
  "{{jobCompany}}": "Hiring company name",
  "{{jobType}}": "Contract type (Permanent/Contract)",

  // Company tokens
  "{{companyName}}": "Client company name",
  "{{contactName}}": "Client contact name",

  // OSCABE tokens
  "{{senderName}}": "Sending recruiter's name",
  "{{senderEmail}}": "Sending recruiter's email",
  "{{unsubscribeLink}}": "GDPR unsubscribe link",
  "{{booking_link}}": "Your meeting booking page URL",
} as const;

export type TokenKey = keyof typeof AVAILABLE_TOKENS;

export function replaceTokens(
  template: string,
  data: Record<string, string | undefined>
): string {
  let result = template;
  for (const [token, value] of Object.entries(data)) {
    result = result.replaceAll(token, value || "");
  }
  // Always add unsubscribe link if not already present
  if (!result.includes("{{unsubscribeLink}}") && !result.includes("unsubscribe")) {
    result += `\n<p style="font-size:11px;color:#999;margin-top:24px;">If you no longer wish to receive these emails, <a href="{{unsubscribeLink}}">unsubscribe here</a>.</p>`;
  }
  return result;
}

export function generateUnsubscribeLink(email: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const encoded = Buffer.from(email).toString("base64url");
  // Simple HMAC using a secret
  const crypto = require("crypto");
  const secret = process.env.UNSUBSCRIBE_SECRET || "oscabe-unsub-secret";
  const token = crypto.createHmac("sha256", secret).update(email).digest("hex").slice(0, 32);
  return `${base}/unsubscribe?email=${encoded}&token=${token}`;
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const crypto = require("crypto");
  const secret = process.env.UNSUBSCRIBE_SECRET || "oscabe-unsub-secret";
  const expected = crypto.createHmac("sha256", secret).update(email).digest("hex").slice(0, 32);
  return token === expected;
}
