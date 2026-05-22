import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Star } from "lucide-react";
import { SavingsCalculator } from "@/components/shared/savings-calculator";

export const metadata: Metadata = {
  title: "Pricing | Remote Automation Engineers | OSCABE",
  description:
    "Transparent pricing for remote automation engineers. PLC, SCADA, AI/ML engineers from £4,800/month. No setup fees. Monthly billing in GBP. Cancel with 30 days notice.",
  alternates: { canonical: "https://oscabe.com/pricing" },
};

const SUBSCRIPTION_TIERS = [
  {
    name: "Explorer",
    price: "Free",
    priceNote: "Forever",
    bullets: [
      "Browse all engineer profiles",
      "View rate ranges",
      "Submit up to 2 requirements/month",
      "Email support",
    ],
    cta: "Get Started Free",
    ctaHref: "/engineers",
    featured: false,
  },
  {
    name: "Growth",
    price: "£299",
    priceNote: "per month",
    badge: "Most Popular",
    bullets: [
      "Everything in Explorer",
      "Unlimited requirements",
      "Priority matching (24hr response)",
      "Dedicated account manager",
      "Bulk engineer packages",
      "Invoice-based billing",
    ],
    cta: "Start Free Trial",
    ctaHref: "/contact?plan=growth",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    priceNote: "Annual contract",
    bullets: [
      "Everything in Growth",
      "Named account director",
      "SLA guarantees",
      "Volume discounts",
      "Custom onboarding",
      "Quarterly business reviews",
    ],
    cta: "Talk to Us",
    ctaHref: "/contact?plan=enterprise",
    featured: false,
  },
];

const ENGINEER_RATES = [
  { role: "PLC Programmer (Mid)", monthly: "£4,800-5,600", daily: "£280-320" },
  { role: "PLC / SCADA Lead (Senior)", monthly: "£7,200-8,400", daily: "£420-490" },
  { role: "SCADA Engineer (Mid)", monthly: "£5,600-6,400", daily: "£320-370" },
  { role: "Robotics Engineer (FANUC/ABB)", monthly: "£5,400-6,400", daily: "£310-370" },
  { role: "ML / Computer Vision Engineer", monthly: "£6,800-7,600", daily: "£400-440" },
  { role: "DCS / EC&I Senior", monthly: "£8,400-9,600", daily: "£480-560" },
  { role: "Digital Twin / IoT Engineer", monthly: "£6,200-7,200", daily: "£360-410" },
];

export default function PricingPage() {
  return (
    <div className="bg-[#010118]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#4540DB]/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-[#00D4FF]/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#4540DB]/40 bg-[#4540DB]/10 px-4 py-1.5 text-xs font-medium tracking-wide text-[#8A85F0]">
            Pricing
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Transparent Pricing. No Surprises.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-400 sm:text-lg">
            All prices in GBP. Monthly billing. Cancel with 30 days notice. No setup fees, no commitment beyond the first month.
          </p>
        </div>
      </section>

      {/* Subscription tiers */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">Employer Subscriptions</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-gray-400">
          Choose how much support you want alongside your engineer engagements. All plans include access to the verified engineer pool.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {SUBSCRIPTION_TIERS.map((t) => (
            <article
              key={t.name}
              className={`relative rounded-2xl border p-6 sm:p-8 ${
                t.featured
                  ? "border-[#4540DB]/40 bg-gradient-to-br from-[#4540DB]/10 to-[#00D4FF]/10 shadow-xl shadow-[#4540DB]/10"
                  : "border-white/[0.06] bg-white/[0.02]"
              }`}
            >
              {t.badge && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-[#4540DB] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  <Star className="h-3 w-3" />
                  {t.badge}
                </span>
              )}
              <h3 className="text-lg font-bold text-white">{t.name}</h3>
              <p className="mt-4">
                <span className="text-3xl font-bold text-white">{t.price}</span>
                <span className="ml-2 text-sm text-gray-500">{t.priceNote}</span>
              </p>
              <ul className="mt-6 space-y-3">
                {t.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={t.ctaHref}
                className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                  t.featured
                    ? "bg-[#4540DB] text-white shadow-lg shadow-[#4540DB]/25 hover:bg-[#3733B0]"
                    : "border border-white/15 bg-white/[0.03] text-white hover:border-white/30 hover:bg-white/[0.08]"
                }`}
              >
                {t.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Engineer rate table */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">
          Engineer Rates (what you pay OSCABE)
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-gray-400">
          Indicative monthly and daily rates by role. All-inclusive: salary, equipment, management, vetting, compliance, and OSCABE service fee.
        </p>

        <div className="mt-10 overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Role
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Monthly (long-term)
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Daily (short-term)
                </th>
              </tr>
            </thead>
            <tbody>
              {ENGINEER_RATES.map((r) => (
                <tr key={r.role} className="border-b border-white/[0.04] last:border-0">
                  <td className="px-5 py-3.5 font-medium text-white">{r.role}</td>
                  <td className="px-5 py-3.5 text-gray-300">{r.monthly}</td>
                  <td className="px-5 py-3.5 text-gray-300">{r.daily}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-5 text-center text-xs text-gray-500">
          All rates include OSCABE management, vetting, compliance and IR35 protection. No additional fees.
        </p>
      </section>

      {/* Savings calculator */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <SavingsCalculator />
      </section>

      {/* Comparison note */}
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-6 text-center sm:p-8">
          <p className="text-base leading-relaxed text-gray-300">
            Compared to hiring directly in the UK, OSCABE saves you{" "}
            <strong className="text-emerald-300">30 to 50%</strong> even after all our fees.
          </p>
          <p className="mt-3 text-sm text-gray-400">
            UK SCADA engineer all-in cost: <strong className="text-white">£7,000-8,000/month</strong>.{" "}
            OSCABE equivalent: <strong className="text-white">£5,500-6,500/month</strong>. Zero admin.
          </p>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#4540DB]/10 to-[#00D4FF]/10 px-8 py-12 text-center sm:px-16">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Start with a 20-minute conversation
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-gray-400">
            Tell us your engineering challenge. We will match you with the right engineer in 72 hours.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/engineers"
              className="inline-flex items-center gap-2 rounded-xl bg-[#4540DB] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#4540DB]/25 transition-all hover:scale-105 hover:bg-[#3733B0]"
            >
              Browse Engineers
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              Book a Discovery Call
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
