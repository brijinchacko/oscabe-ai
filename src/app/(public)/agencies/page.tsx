"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Users,
  ArrowRight,
  Network,
  Paintbrush,
  CheckCircle,
  Radar,
  Calculator,
  Gift,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AwardsBanner } from "@/components/shared/awards-banner";

const PRODUCTS = [
  {
    icon: ShieldCheck,
    title: "OSCABE Verify",
    subtitle: "Skill Verification as a Service",
    description:
      "Leverage our engineer-led technical assessment framework to verify your candidates' PLC, SCADA, and controls skills. Provide your clients with confidence that your candidates can deliver.",
    features: [
      "Technical assessments designed by chartered engineers",
      "Platform-specific verification (Siemens, Rockwell, Schneider, etc.)",
      "Verification badges for candidate profiles",
      "Faster client acceptance rates",
    ],
  },
  {
    icon: Users,
    title: "Talent Pool Access",
    subtitle: "Verified Candidate Database",
    description:
      "Access our growing database of pre-verified automation engineers. Search by platform, industry, and skill level to find candidates that match your open requirements.",
    features: [
      "Pre-screened and technically verified engineers",
      "Search by PLC platform, industry, and seniority",
      "Candidate availability alerts",
      "Reduced time-to-shortlist",
    ],
  },
  {
    icon: Network,
    title: "Marketplace",
    subtitle: "Split-Fee Network",
    description:
      "Join our split-fee marketplace to collaborate with other specialist recruiters. Share roles, share candidates, and close more placements together.",
    features: [
      "Access to exclusive automation roles",
      "Transparent split-fee arrangements",
      "Vetted network of specialist agencies",
      "Collaborative placement tracking",
    ],
  },
  {
    icon: Paintbrush,
    title: "White-Label",
    subtitle: "White-Label AI Recruitment Tools",
    description:
      "Embed OSCABE's AI-powered matching and verification technology into your own platform. Offer cutting-edge recruitment capabilities under your brand.",
    features: [
      "AI candidate matching engine",
      "Customisable to your brand",
      "API integration with your ATS",
      "Technical verification workflows",
    ],
  },
];

export default function AgenciesPage() {
  return (
    <div className="bg-[#02012B]">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#8B5CF6]/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-[#8B5CF6]/15 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/2 right-1/4 h-[300px] w-[300px] rounded-full bg-[#8B5CF6]/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Partner With OSCABE
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            Supercharge your automation recruitment with OSCABE&apos;s verification
            technology, talent pool, and collaborative marketplace.
          </p>
          <Link href="/contact">
            <Button
              size="lg"
              className="mt-8 bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white px-8 transition-transform hover:scale-105"
              style={{ boxShadow: "0 0 30px rgba(139,92,246,0.4)" }}
            >
              Partner With Us
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Products */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Our Agency Solutions
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-400">
              Four ways to grow your automation recruitment business with OSCABE.
            </p>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {PRODUCTS.map((product) => (
              <div
                key={product.title}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]"
                style={{ transition: "box-shadow 0.3s, border-color 0.3s, background 0.3s" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 30px rgba(139,92,246,0.15)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#8B5CF6]/15">
                  <product.icon className="h-5 w-5 text-[#8B5CF6]" />
                </div>
                <h3 className="text-xl font-semibold text-white">{product.title}</h3>
                <p className="mt-1 text-sm font-medium text-[#8B5CF6]">
                  {product.subtitle}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">
                  {product.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-400">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#8B5CF6]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OSCABE Verify Pricing */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              OSCABE Verify Pricing
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-400">
              Transparent, per-candidate pricing. No hidden fees.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {/* Basic Assessment */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#8B5CF6]/15">
                <ShieldCheck className="h-5 w-5 text-[#8B5CF6]" />
              </div>
              <h3 className="text-xl font-semibold text-white">Basic Assessment</h3>
              <p className="mt-2 text-3xl font-bold text-[#8B5CF6]">
                &pound;30<span className="text-base font-normal text-gray-400">/candidate</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Single platform skill test. Quick turnaround for high-volume screening.
              </p>
            </div>

            {/* Advanced Assessment */}
            <div className="relative rounded-2xl border border-[#8B5CF6]/30 bg-white/[0.03] backdrop-blur-sm p-6 transition-all duration-300 hover:border-[#8B5CF6]/50 hover:bg-white/[0.06]">
              <span className="absolute -top-3 right-6 rounded-full bg-[#8B5CF6] px-3 py-1 text-xs font-semibold text-white">
                Most Popular
              </span>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#8B5CF6]/15">
                <ShieldCheck className="h-5 w-5 text-[#8B5CF6]" />
              </div>
              <h3 className="text-xl font-semibold text-white">Advanced Assessment</h3>
              <p className="mt-2 text-3xl font-bold text-[#8B5CF6]">
                &pound;75<span className="text-base font-normal text-gray-400">/candidate</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Multi-platform testing + Chartered Engineer review + white-label PDF report branded to your agency.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-center">
            <p className="text-sm text-gray-400">
              <span className="font-semibold text-[#8B5CF6]">Volume discount:</span>{" "}
              Contact us for volume packages (50+ assessments/month)
            </p>
            <p className="text-xs text-gray-500">
              Different from our employer Technical Screening (&pound;150&ndash;&pound;250) which includes deeper analysis
            </p>
          </div>
        </div>
      </section>

      {/* Talent Radar for Agencies */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  Talent Radar for Agencies
                </h2>
                <span className="rounded-full bg-[#22C55E] px-3 py-1 text-xs font-bold text-white">
                  New
                </span>
              </div>
              <p className="mt-2 text-3xl font-bold text-[#8B5CF6]">
                &pound;499<span className="text-base font-normal text-gray-400">/month</span>
              </p>
              <p className="mt-4 text-gray-400">
                Stay ahead of competing agencies with market intelligence delivered straight to your inbox.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Weekly updates on new automation talent in your region",
                  "Salary movement data for key specialisms",
                  "First-look access before candidates hit the open market",
                  "Regional market trends and demand forecasting",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-400">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#8B5CF6]" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/contact">
                <button
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#8B5CF6] px-8 py-3 text-sm font-bold text-white shadow-xl transition-all hover:scale-105"
                  style={{ boxShadow: "0 0 30px rgba(139,92,246,0.4)" }}
                >
                  <Radar className="h-4 w-4" />
                  Subscribe to Talent Radar
                </button>
              </Link>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative h-64 w-64 rounded-full border border-[#8B5CF6]/20">
                <div className="absolute inset-4 rounded-full border border-[#8B5CF6]/15" />
                <div className="absolute inset-8 rounded-full border border-[#8B5CF6]/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Radar className="h-16 w-16 text-[#8B5CF6]/60" />
                </div>
                <div className="absolute top-4 right-8 h-3 w-3 rounded-full bg-[#22C55E] shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                <div className="absolute bottom-8 left-4 h-2 w-2 rounded-full bg-[#8B5CF6] shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
                <div className="absolute top-1/3 right-4 h-2.5 w-2.5 rounded-full bg-[#00D4FF] shadow-[0_0_10px_rgba(0,212,255,0.6)]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Potential Calculator */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Revenue Potential Calculator
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-400">
              See what partnering with OSCABE could mean for your bottom line.
            </p>
          </div>

          <div
            className="mx-auto mt-10 max-w-2xl rounded-2xl border border-[#22C55E]/20 bg-white/[0.03] backdrop-blur-sm p-8"
            style={{ boxShadow: "0 0 40px rgba(34,197,94,0.08)" }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#22C55E]/15">
                <Calculator className="h-5 w-5 text-[#22C55E]" />
              </div>
              <h3 className="text-lg font-semibold text-white">Example Earnings</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
                <span className="text-sm text-gray-400">10 assessments/month &times; &pound;50 avg</span>
                <span className="text-lg font-bold text-white">&pound;500/month</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
                <span className="text-sm text-gray-400">5 split-fee placements/year &times; &pound;3,500 avg</span>
                <span className="text-lg font-bold text-white">&pound;17,500/year</span>
              </div>
              <div className="mt-2 h-px bg-gradient-to-r from-transparent via-[#22C55E]/30 to-transparent" />
              <div className="flex items-center justify-between px-5 py-2">
                <span className="text-base font-semibold text-white">Total potential Year 1</span>
                <span className="text-2xl font-extrabold text-[#22C55E]">&pound;20,000+</span>
              </div>
              <p className="text-center text-xs text-gray-500">
                in additional revenue from OSCABE partnership
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[#8B5CF6]/20 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Let&apos;s Build Something Together
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
            Whether you want to verify candidates, access our talent pool, or
            white-label our technology, we would love to talk.
          </p>
          <Link href="/contact">
            <Button
              size="lg"
              className="mt-8 bg-[#8B5CF6] text-white hover:bg-[#8B5CF6]/90 px-8 transition-transform hover:scale-105"
              style={{ boxShadow: "0 0 30px rgba(139,92,246,0.4)" }}
            >
              Partner With Us
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Awards */}
      <AwardsBanner compact accentColor="#8B5CF6" />
    </div>
  );
}
