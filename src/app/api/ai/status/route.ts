import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    configured: !!process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4-20250514",
  });
}
