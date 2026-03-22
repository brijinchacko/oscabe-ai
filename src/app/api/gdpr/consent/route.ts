import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, consentType, consent } = body;

    // Validate
    if (!consentType || consentType !== "cookies") {
      return NextResponse.json({ error: "Invalid consent type" }, { status: 400 });
    }

    if (!consent || !["all", "essential"].includes(consent)) {
      return NextResponse.json(
        { error: "Consent must be 'all' or 'essential'" },
        { status: 400 }
      );
    }

    // Record the consent
    await prisma.gdprConsent.create({
      data: {
        email: email || "anonymous",
        consentType: `cookies_${consent}`,
        consented: true,
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      consent,
      message: "Cookie preferences saved",
    });
  } catch (error) {
    console.error("GDPR consent error:", error);
    return NextResponse.json({ error: "Failed to save consent" }, { status: 500 });
  }
}
