import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/email-tokens";

export async function POST(request: Request) {
  try {
    const { email: encodedEmail, token, action } = await request.json();

    if (!encodedEmail || !token) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Decode email from base64url
    let email: string;
    try {
      email = Buffer.from(encodedEmail, "base64url").toString();
    } catch {
      return NextResponse.json({ error: "Invalid email parameter" }, { status: 400 });
    }

    // Verify HMAC token
    if (!verifyUnsubscribeToken(email, token)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    if (action === "unsubscribe") {
      // Find existing consent record
      const existing = await prisma.gdprConsent.findFirst({
        where: {
          email,
          consentType: "marketing",
          consented: true,
          withdrawnAt: null,
        },
      });

      if (existing) {
        await prisma.gdprConsent.update({
          where: { id: existing.id },
          data: { withdrawnAt: new Date() },
        });
      } else {
        // Create a withdrawn consent record even if none existed
        await prisma.gdprConsent.create({
          data: {
            email,
            consentType: "marketing",
            consented: false,
            withdrawnAt: new Date(),
          },
        });
      }

      return NextResponse.json({ success: true, action: "unsubscribed" });
    }

    if (action === "resubscribe") {
      // Create new active consent
      await prisma.gdprConsent.create({
        data: {
          email,
          consentType: "marketing",
          consented: true,
        },
      });

      return NextResponse.json({ success: true, action: "resubscribed" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
