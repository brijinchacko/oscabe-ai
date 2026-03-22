import { NextResponse } from "next/server";
import { parseJobDescription } from "@/lib/ai/job-parser";
import { isAIConfigured } from "@/lib/openrouter";

export async function POST(request: Request) {
  try {
    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: "AI features require an OpenRouter API key. Configure it in Settings → Integrations." },
        { status: 503 }
      );
    }

    const { description } = await request.json();

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "description is required" },
        { status: 400 }
      );
    }

    const parsed = await parseJobDescription(description);

    return NextResponse.json({ parsed });
  } catch (error) {
    console.error("Job parse error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to parse job description";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
