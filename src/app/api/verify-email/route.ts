import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { verifyEmail, verifyBatch } from "@/lib/email-verifier";

export async function POST(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await req.json();

    // Single email verification
    if (body.email) {
      const result = await verifyEmail(body.email);
      return NextResponse.json(result);
    }

    // Batch verification
    if (body.emails && Array.isArray(body.emails)) {
      if (body.emails.length > 100) {
        return NextResponse.json({ error: "Max 100 emails per batch" }, { status: 400 });
      }
      const results = await verifyBatch(body.emails);
      const summary = {
        total: results.length,
        valid: results.filter((r) => r.isValid).length,
        invalid: results.filter((r) => r.status === "invalid").length,
        disposable: results.filter((r) => r.isDisposable).length,
        risky: results.filter((r) => r.status === "risky").length,
        freeProvider: results.filter((r) => r.isFreeProvider).length,
      };
      return NextResponse.json({ results, summary });
    }

    return NextResponse.json({ error: "Provide email or emails array" }, { status: 400 });
  } catch (err) {
    console.error("Email verification error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
