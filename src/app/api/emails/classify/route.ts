import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";

const POSITIVE_KEYWORDS = [
  "interested",
  "yes",
  "let's talk",
  "lets talk",
  "schedule",
  "available",
  "send me",
  "tell me more",
  "sounds good",
  "great",
  "love to",
  "happy to",
  "look forward",
  "keen",
  "absolutely",
  "when can we",
  "set up a call",
  "book a meeting",
  "let's discuss",
  "lets discuss",
  "perfect",
  "sign me up",
];

const NEGATIVE_KEYWORDS = [
  "not interested",
  "no thank you",
  "no thanks",
  "remove me",
  "unsubscribe",
  "not looking",
  "already have",
  "pass on this",
  "not right now",
  "not at this time",
  "decline",
  "not for us",
  "no need",
  "stop emailing",
  "do not contact",
  "please remove",
  "opt out",
];

const OOO_KEYWORDS = [
  "out of office",
  "ooo",
  "annual leave",
  "vacation",
  "will return",
  "away from",
  "on leave",
  "auto-reply",
  "automatic reply",
  "currently away",
  "limited access",
  "back on",
  "returning on",
  "maternity leave",
  "paternity leave",
  "sabbatical",
];

function classifyEmail(emailBody: string): {
  classification: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "OUT_OF_OFFICE";
  confidence: number;
  keywords: string[];
} {
  const lower = emailBody.toLowerCase();
  const matchedKeywords: string[] = [];

  // Check OOO first (highest priority)
  let oooScore = 0;
  for (const kw of OOO_KEYWORDS) {
    if (lower.includes(kw)) {
      oooScore++;
      matchedKeywords.push(kw);
    }
  }
  if (oooScore > 0) {
    return {
      classification: "OUT_OF_OFFICE",
      confidence: Math.min(0.95, 0.7 + oooScore * 0.1),
      keywords: matchedKeywords,
    };
  }

  // Check negative (higher priority than positive)
  let negScore = 0;
  for (const kw of NEGATIVE_KEYWORDS) {
    if (lower.includes(kw)) {
      negScore++;
      matchedKeywords.push(kw);
    }
  }

  // Check positive
  let posScore = 0;
  for (const kw of POSITIVE_KEYWORDS) {
    if (lower.includes(kw)) {
      posScore++;
      matchedKeywords.push(kw);
    }
  }

  if (negScore > posScore && negScore > 0) {
    return {
      classification: "NEGATIVE",
      confidence: Math.min(0.9, 0.5 + negScore * 0.15),
      keywords: matchedKeywords,
    };
  }

  if (posScore > 0) {
    return {
      classification: "POSITIVE",
      confidence: Math.min(0.9, 0.5 + posScore * 0.15),
      keywords: matchedKeywords,
    };
  }

  return {
    classification: "NEUTRAL",
    confidence: 0.5,
    keywords: [],
  };
}

// POST: Classify an email body
export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { emailBody } = body;

  if (!emailBody || typeof emailBody !== "string") {
    return NextResponse.json(
      { error: "emailBody is required" },
      { status: 400 }
    );
  }

  const result = classifyEmail(emailBody);

  return NextResponse.json(result);
}
