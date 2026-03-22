import Stripe from "stripe";

/**
 * Stripe client - uses STRIPE_SECRET_KEY from env.
 * Returns null if not configured (graceful degradation).
 */
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-03-31.basil" as Stripe.LatestApiVersion })
  : null;

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

/** Shortlist Package definitions */
export const SHORTLIST_PACKAGES = [
  {
    id: "shortlist_starter",
    name: "Shortlist Starter",
    price: 150000, // £1,500 in pence
    currency: "gbp",
    description: "3 technically-screened candidates with skill profiles and availability",
    candidates: 3,
    features: [
      "3 verified automation engineers",
      "Technical skill profiles",
      "Availability confirmation",
      "5-day delivery",
    ],
  },
  {
    id: "shortlist_pro",
    name: "Shortlist Pro",
    price: 250000, // £2,500
    currency: "gbp",
    description: "5 candidates + technical assessment reports + salary benchmark",
    candidates: 5,
    popular: true,
    features: [
      "5 verified automation engineers",
      "Full technical assessment reports",
      "Salary benchmarking data",
      "3-day priority delivery",
      "30-day replacement guarantee",
    ],
  },
  {
    id: "shortlist_enterprise",
    name: "Shortlist Enterprise",
    price: 400000, // £4,000
    currency: "gbp",
    description: "8 candidates + full assessments + 1 upskill-ready + 90-day guarantee",
    candidates: 8,
    features: [
      "8 verified automation engineers",
      "Comprehensive technical assessments",
      "1 upskill-ready candidate (Wartens training)",
      "Salary + market intelligence report",
      "48-hour priority delivery",
      "90-day replacement guarantee",
    ],
  },
  {
    id: "candidate_pack",
    name: "Candidate Pack",
    price: 150000, // £1,500
    currency: "gbp",
    description: "10 anonymised profiles by specialism (e.g. Siemens PLC Pack)",
    candidates: 10,
    features: [
      "10 anonymised candidate profiles",
      "Filtered by specialism",
      "Skill-level indicators",
      "Availability windows",
      "Ideal for pipeline building",
    ],
  },
] as const;

/** Employer Subscription tiers */
export const SUBSCRIPTION_TIERS = [
  {
    id: "employer_basic",
    name: "Basic",
    price: 99900, // £999/mo in pence
    currency: "gbp",
    interval: "month" as const,
    description: "Essential access to OSCABE's talent pipeline",
    features: [
      "2 shortlists per month",
      "Candidate database access",
      "Salary benchmarking",
      "Email support",
    ],
  },
  {
    id: "employer_pro",
    name: "Pro",
    price: 199900, // £1,999/mo
    currency: "gbp",
    interval: "month" as const,
    popular: true,
    description: "Advanced recruitment tools for growing teams",
    features: [
      "5 shortlists per month",
      "Technical assessments included",
      "Market intelligence reports",
      "Priority sourcing",
      "Dedicated account manager",
    ],
  },
  {
    id: "employer_enterprise",
    name: "Enterprise",
    price: 349900, // £3,499/mo
    currency: "gbp",
    interval: "month" as const,
    description: "Unlimited access for large-scale hiring",
    features: [
      "Unlimited shortlists",
      "Dedicated account manager",
      "Contractor management",
      "Upskilling pipeline (Wartens)",
      "Custom reporting",
      "API access",
    ],
  },
] as const;

/** Technical Screening pricing */
export const SCREENING_PRICES = {
  standard: { price: 15000, label: "Standard Screening", description: "60-min structured technical interview" },
  advanced: { price: 25000, label: "Advanced Screening", description: "90-min deep-dive with practical assessment" },
} as const;

/** Candidate Premium services */
export const CANDIDATE_SERVICES = {
  cv_review: { price: 5000, label: "AI CV Review", description: "Professional CV optimization for automation roles" },
  interview_prep: { price: 5000, label: "Interview Preparation", description: "1-hour coaching session with industry expert" },
  premium_monthly: { price: 999, label: "Premium Membership", description: "Priority job alerts + career intelligence", interval: "month" as const },
} as const;

/**
 * Create a Stripe Checkout Session for a one-time shortlist package purchase.
 */
export async function createShortlistCheckout(
  packageId: string,
  customerEmail: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>,
): Promise<string | null> {
  if (!stripe) {
    console.warn("[Stripe] Not configured - returning mock checkout URL");
    return null;
  }

  const pkg = SHORTLIST_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) throw new Error(`Package not found: ${packageId}`);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: pkg.currency,
          unit_amount: pkg.price,
          product_data: {
            name: `OSCABE ${pkg.name}`,
            description: pkg.description,
          },
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { packageId, ...metadata },
  });

  return session.url;
}

/**
 * Create a Stripe Checkout Session for a subscription.
 */
export async function createSubscriptionCheckout(
  tierId: string,
  customerEmail: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>,
): Promise<string | null> {
  if (!stripe) {
    console.warn("[Stripe] Not configured - returning mock checkout URL");
    return null;
  }

  const tier = SUBSCRIPTION_TIERS.find((t) => t.id === tierId);
  if (!tier) throw new Error(`Tier not found: ${tierId}`);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: tier.currency,
          unit_amount: tier.price,
          recurring: { interval: tier.interval },
          product_data: {
            name: `OSCABE ${tier.name} Plan`,
            description: tier.description,
          },
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { tierId, ...metadata },
  });

  return session.url;
}

/**
 * Create a Stripe Checkout for technical screening.
 */
export async function createScreeningCheckout(
  screeningType: "standard" | "advanced",
  customerEmail: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>,
): Promise<string | null> {
  if (!stripe) return null;

  const screening = SCREENING_PRICES[screeningType];

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: "gbp",
          unit_amount: screening.price,
          product_data: {
            name: `OSCABE ${screening.label}`,
            description: screening.description,
          },
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { type: "screening", screeningType, ...metadata },
  });

  return session.url;
}
