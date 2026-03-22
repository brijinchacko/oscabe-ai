import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod/v4";
import prisma from "@/lib/prisma";
import { createSubscriptionCheckout, SUBSCRIPTION_TIERS, isStripeConfigured } from "@/lib/stripe";

const checkoutSchema = z.object({
  tierId: z.string().min(1),
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

    const { tierId } = parsed.data;

    // Validate tier exists
    const tier = SUBSCRIPTION_TIERS.find((t) => t.id === tierId);
    if (!tier) {
      return NextResponse.json({ error: "Subscription tier not found" }, { status: 404 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If Stripe is not configured, return mock success
    if (!isStripeConfigured()) {
      return NextResponse.json({
        message: "Stripe not configured. In production, this would redirect to Stripe Checkout.",
        tierId,
        price: tier.price,
        mockSuccess: true,
      });
    }

    const origin = request.nextUrl.origin;
    const successUrl = `${origin}/portal/employer?subscribed=true`;
    const cancelUrl = `${origin}/pricing?cancelled=true`;

    const checkoutUrl = await createSubscriptionCheckout(
      tierId,
      user.email,
      successUrl,
      cancelUrl,
      {
        userId: user.id,
      },
    );

    if (!checkoutUrl) {
      return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("[Checkout/Subscription]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
