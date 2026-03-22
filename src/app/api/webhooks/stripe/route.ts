import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!stripe || !webhookSecret) {
    console.warn("[Stripe Webhook] Stripe not configured");
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Stripe Webhook] Signature verification failed:", message);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription, event.type);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("[Stripe Webhook] Invoice paid:", invoice.id, "Amount:", invoice.amount_paid);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.error("[Stripe Webhook] Invoice payment failed:", invoice.id);
        // In production, send notification to the customer
        break;
      }

      default:
        console.log("[Stripe Webhook] Unhandled event type:", event.type);
    }
  } catch (error) {
    console.error("[Stripe Webhook] Error handling event:", event.type, error);
    // Return 200 to acknowledge receipt even if processing fails
    // This prevents Stripe from retrying; process errors separately
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {};
  const customerEmail = session.customer_email || session.customer_details?.email;

  console.log("[Stripe Webhook] Checkout completed:", {
    sessionId: session.id,
    mode: session.mode,
    metadata,
    customerEmail,
  });

  // Handle shortlist package purchase
  if (metadata.packageId) {
    const userId = metadata.userId;

    if (userId) {
      await prisma.activity.create({
        data: {
          type: "PURCHASE",
          title: `Shortlist package purchased: ${metadata.packageId}`,
          content: JSON.stringify({
            sessionId: session.id,
            packageId: metadata.packageId,
            amount: session.amount_total,
            currency: session.currency,
            customerEmail,
            requirements: metadata.requirements || null,
          }),
          userId,
          metadata: JSON.stringify({ stripeSessionId: session.id, packageId: metadata.packageId }),
        },
      });
    }

    console.log("[Stripe Webhook] Shortlist purchase recorded for package:", metadata.packageId);
  }

  // Handle screening purchase
  if (metadata.type === "screening") {
    const userId = metadata.userId;

    if (userId) {
      await prisma.activity.create({
        data: {
          type: "SCREENING_ORDER",
          title: `Technical screening ordered: ${metadata.screeningType}`,
          content: JSON.stringify({
            sessionId: session.id,
            screeningType: metadata.screeningType,
            candidateEmail: metadata.candidateEmail,
            candidateName: metadata.candidateName,
            amount: session.amount_total,
            currency: session.currency,
          }),
          userId,
          metadata: JSON.stringify({ stripeSessionId: session.id, screeningType: metadata.screeningType }),
        },
      });
    }

    console.log("[Stripe Webhook] Screening order recorded:", metadata.screeningType);
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription, eventType: string) {
  const metadata = subscription.metadata || {};
  const userId = metadata.userId;

  console.log("[Stripe Webhook] Subscription update:", {
    subscriptionId: subscription.id,
    status: subscription.status,
    eventType,
    metadata,
  });

  if (userId) {
    await prisma.activity.create({
      data: {
        type: "SUBSCRIPTION",
        title: `Subscription ${eventType === "customer.subscription.created" ? "created" : "updated"}: ${subscription.status}`,
        content: JSON.stringify({
          subscriptionId: subscription.id,
          status: subscription.status,
          tierId: metadata.tierId,
          currentPeriodEnd: (subscription as unknown as Record<string, unknown>).current_period_end ?? null,
        }),
        userId,
        metadata: JSON.stringify({
          stripeSubscriptionId: subscription.id,
          status: subscription.status,
        }),
      },
    });
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const metadata = subscription.metadata || {};
  const userId = metadata.userId;

  console.log("[Stripe Webhook] Subscription cancelled:", subscription.id);

  if (userId) {
    await prisma.activity.create({
      data: {
        type: "SUBSCRIPTION",
        title: "Subscription cancelled",
        content: JSON.stringify({
          subscriptionId: subscription.id,
          cancelledAt: subscription.canceled_at,
        }),
        userId,
        metadata: JSON.stringify({
          stripeSubscriptionId: subscription.id,
          status: "cancelled",
        }),
      },
    });
  }
}
