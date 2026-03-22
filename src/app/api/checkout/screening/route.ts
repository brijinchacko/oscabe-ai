import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod/v4";
import prisma from "@/lib/prisma";
import { createScreeningCheckout, SCREENING_PRICES, isStripeConfigured } from "@/lib/stripe";

const checkoutSchema = z.object({
  screeningType: z.enum(["standard", "advanced"]),
  candidateEmail: z.string().email(),
  candidateName: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.issues }, { status: 400 });
    }

    const { screeningType, candidateEmail, candidateName } = parsed.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If Stripe is not configured, return mock success
    if (!isStripeConfigured()) {
      const screening = SCREENING_PRICES[screeningType];
      return NextResponse.json({
        message: "Stripe not configured. In production, this would redirect to Stripe Checkout.",
        screeningType,
        price: screening.price,
        mockSuccess: true,
      });
    }

    const origin = request.nextUrl.origin;
    const successUrl = `${origin}/portal/employer?screening=ordered`;
    const cancelUrl = `${origin}/pricing?cancelled=true`;

    const checkoutUrl = await createScreeningCheckout(
      screeningType,
      user.email,
      successUrl,
      cancelUrl,
      {
        userId: user.id,
        candidateEmail,
        candidateName,
      },
    );

    if (!checkoutUrl) {
      return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("[Checkout/Screening]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
