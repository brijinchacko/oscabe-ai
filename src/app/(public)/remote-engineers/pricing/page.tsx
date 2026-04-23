"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Phone,
  TrendingDown,
  Clock,
  Users,
  Building2,
} from "lucide-react";

const TIERS = [
  { tier: "Associate", experience: "2-4 yrs", monthly: "2,200", annual: "26,400", ukEquivalent: "~50,000", savings: "47%" },
  { tier: "Engineer", experience: "4-7 yrs", monthly: "2,900", annual: "34,800", ukEquivalent: "~58,000", savings: "40%" },
  { tier: "Senior", experience: "7+ yrs", monthly: "3,800", annual: "45,600", ukEquivalent: "~70,000", savings: "35%" },
  { tier: "Lead / Architect", experience: "10+ yrs", monthly: "5,200", annual: "62,400", ukEquivalent: "~90,000", savings: "31%" },
];

const UPLIFTS = [
  { specialism: "AI / ML", uplift: "+15%" },
  { specialism: "Functional Safety", uplift: "+20%" },
  { specialism: "Industrial Cybersecurity", uplift: "+20%" },
  { specialism: "Rockwell / Siemens Expert", uplift: "+10%" },
  { specialism: "Digital Twin", uplift: "+15%" },
];

const ENGAGEMENT_MODELS = [
  {
    title: "Monthly",
    subtitle: "1-month pilot",
    description: "Try a single remote engineer for one month. Ideal for evaluating the model before committing. No long-term contract.",
    color: "#4540DB",
    icon: Clock,
  },
  {
    title: "Project",
    subtitle: "3-9 months",
    description: "Dedicated engineers for a defined project scope. Fixed timeline with clear deliverables and milestones.",
    color: "#00D4FF",
    icon: CheckCircle,
  },
  {
    title: "Team",
    subtitle: "3+ engineers, 15% discount",
    description: "Build a remote engineering team with volume pricing. Shared delivery manager and structured reporting.",
    color: "#8B5CF6",
    icon: Users,
  },
  {
    title: "Dedicated Capability Centre",
    subtitle: "8+ engineers, custom",
    description: "A fully managed offshore engineering centre branded to your company. Custom pricing, dedicated office space, and full operational support.",
    color: "#22C55E",
    icon: Building2,
  },
];

export default function RemotePricingPage() {
  return (
    <div className="bg-[#010118]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#4540DB]/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-[#00D4FF]/10 blur-[120px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/40 bg-[#00D4FF]/10 px-4 py-1.5 text-xs font-medium tracking-wide text-[#00D4FF]">
            <TrendingDown className="h-3.5 w-3.5" />
            Save 31-47% vs UK Costs
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Remote Engineer Pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
            Transparent monthly pricing. No hidden fees. All engineers are Engineer-verified and work from the Wartens India office in Bangalore.
          </p>
        </div>
      </section>

      {/* Pricing Table */}
      <section className="border-y border-white/[0.06] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Monthly Rates
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-gray-400">
            All prices in GBP. Billed monthly. Minimum 1-month engagement.
          </p>

          <div className="mt-14 overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr className="border-b border-white/[0.1]">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Tier</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Experience</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Monthly (GBP)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Annual (GBP)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">UK Equivalent</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Savings</th>
                </tr>
              </thead>
              <tbody>
                {TIERS.map((tier, index) => (
                  <tr
                    key={tier.tier}
                    className={`transition-colors hover:bg-white/[0.03] ${
                      index < TIERS.length - 1 ? "border-b border-white/[0.06]" : ""
                    }`}
                  >
                    <td className="px-6 py-5 text-sm font-semibold text-white">{tier.tier}</td>
                    <td className="px-6 py-5 text-sm text-gray-400">{tier.experience}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-[#00D4FF]">{"\u00A3"}{tier.monthly}</td>
                    <td className="px-6 py-5 text-sm text-gray-400">{"\u00A3"}{tier.annual}</td>
                    <td className="px-6 py-5 text-sm text-gray-500">{"\u00A3"}{tier.ukEquivalent}</td>
                    <td className="px-6 py-5">
                      <span className="inline-flex rounded-full bg-[#22C55E]/15 px-3 py-1 text-xs font-semibold text-[#22C55E]">
                        {tier.savings}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Specialist Uplifts */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Specialist Uplifts
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-gray-400">
            For engineers with niche or high-demand specialisms, a percentage uplift applies on top of the base tier rate.
          </p>

          <div className="mx-auto mt-14 max-w-lg overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/[0.1]">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Specialism</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white">Uplift</th>
                </tr>
              </thead>
              <tbody>
                {UPLIFTS.map((item, index) => (
                  <tr
                    key={item.specialism}
                    className={`transition-colors hover:bg-white/[0.03] ${
                      index < UPLIFTS.length - 1 ? "border-b border-white/[0.06]" : ""
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-300">{item.specialism}</td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-[#F59E0B]">{item.uplift}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Engagement Models */}
      <section className="border-y border-white/[0.06] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Engagement Models
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-gray-400">
            Choose the engagement model that fits your needs.
          </p>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ENGAGEMENT_MODELS.map((model) => (
              <div
                key={model.title}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.06]"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: `${model.color}15` }}
                >
                  <model.icon className="h-6 w-6" style={{ color: model.color }} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{model.title}</h3>
                <p className="mt-1 text-xs font-medium" style={{ color: model.color }}>{model.subtitle}</p>
                <p className="mt-3 text-sm text-gray-400">{model.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] px-8 py-16 backdrop-blur-sm sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to save 40% on engineering costs?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
              Start with a 1-month pilot. No long-term commitment required.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-[#4540DB] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-[#4540DB]/25 transition-all hover:bg-[#4540DB]/90 hover:scale-105"
              >
                Book a Call
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/remote-engineers"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
              >
                Learn About Remote Engineers
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
