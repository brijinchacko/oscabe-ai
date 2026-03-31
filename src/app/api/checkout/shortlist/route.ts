import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod/v4";
import prisma from "@/lib/prisma";
import { createShortlistCheckout, SHORTLIST_PACKAGES, isStripeConfigured } from "@/lib/stripe";

const checkoutSchema = z.object({
  packageId: z.string().min(1),
  requirements: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.issues }, { status: 400 });
    }

    const { packageId, requirements } = parsed.data;

    // Validate package exists
    const pkg = SHORTLIST_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    // Find the employer record
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employer: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If Stripe is not configured, return mock success
    if (!isStripeConfigured()) {
      return NextResponse.json({
        message: "Stripe not configured. In production, this would redirect to Stripe Checkout.",
        packageId,
        price: pkg.price,
        mockSuccess: true,
      });
    }

    const origin = request.nextUrl.origin;
    const successUrl = `${origin}/portal/employer/orders?success=true`;
    const cancelUrl = `${origin}/pricing?cancelled=true`;

    const checkoutUrl = await createShortlistCheckout(
      packageId,
      user.email,
      successUrl,
      cancelUrl,
      {
        userId: user.id,
        employerId: user.employer?.id || "",
        ...(requirements ? { requirements } : {}),
      },
    );

    if (!checkoutUrl) {
      return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("[Checkout/Shortlist]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
