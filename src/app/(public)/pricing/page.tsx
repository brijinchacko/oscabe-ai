"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Zap,
  Shield,
  Award,
  Star,
  ChevronDown,
  Globe,
  Briefcase,
  Users,
  TrendingUp,
  BarChart3,
  BookOpen,
  GraduationCap,
  Sparkles,
  Target,
} from "lucide-react";
import {
  SHORTLIST_PACKAGES,
  SUBSCRIPTION_TIERS,
  SCREENING_PRICES,
  CANDIDATE_SERVICES,
} from "@/lib/stripe";

function formatPrice(pence: number): string {
  const pounds = pence / 100;
  return pounds.toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: pounds % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

const FAQ_ITEMS = [
  {
    q: "How does the shortlist process work?",
    a: "Once you purchase a shortlist package, our team of chartered engineers sources, screens, and technically assesses candidates from our verified talent pool. You receive a curated shortlist within the specified delivery timeframe, complete with skill profiles and availability details.",
  },
  {
    q: "What is the replacement guarantee?",
    a: "If a candidate from your shortlist does not meet expectations or leaves within the guarantee period (30 days for Pro, 90 days for Enterprise), we will provide a replacement candidate at no additional cost.",
  },
  {
    q: "Can I upgrade my subscription later?",
    a: "Yes, you can upgrade or downgrade your subscription at any time. When upgrading, you will be charged the prorated difference for the remainder of your billing cycle.",
  },
  {
    q: "What does the technical screening include?",
    a: "Standard screening is a 60-minute structured technical interview covering core automation engineering competencies. Advanced screening is a 90-minute deep-dive that includes a practical hands-on assessment with detailed reporting.",
  },
  {
    q: "Do you cover all automation engineering specialisms?",
    a: "We specialise in industrial automation including PLC programming (Siemens, Allen-Bradley, Mitsubishi), SCADA, DCS, robotics, controls engineering, and related disciplines. Our Candidate Packs can be filtered by specialism.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards via our secure Stripe payment gateway. For Enterprise plans, we also offer invoicing with NET-30 payment terms.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#02012B]">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-[#4540DB]/10 to-transparent" />
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="mb-4 inline-block rounded-full border border-[#4540DB]/30 bg-[#4540DB]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#4540DB]">
            Pricing
          </span>
          <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            Transparent pricing for{" "}
            <span className="bg-gradient-to-r from-[#4540DB] to-[#00D4FF] bg-clip-text text-transparent">
              quality talent
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            Whether you need a single shortlist or an ongoing talent pipeline, we have a plan that
            fits. All packages include technically-screened automation engineers.
          </p>
        </div>
      </section>

      {/* Shortlist Packages */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white">Shortlist Packages</h2>
          <p className="mt-3 text-gray-400">
            One-off curated shortlists of pre-screened automation engineers
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {SHORTLIST_PACKAGES.map((pkg) => {
            const isPopular = "popular" in pkg && pkg.popular;
            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col rounded-2xl border p-6 backdrop-blur-sm transition-all hover:border-white/20 ${
                  isPopular
                    ? "border-[#4540DB]/40 bg-[#4540DB]/[0.06] shadow-lg shadow-[#4540DB]/10"
                    : "border-white/[0.08] bg-white/[0.03]"
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#4540DB] px-3 py-1 text-xs font-bold text-white">
                    Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-white">{pkg.name}</h3>
                <p className="mt-1 text-sm text-gray-400">{pkg.description}</p>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-white">{formatPrice(pkg.price)}</span>
                  <span className="ml-1 text-sm text-gray-500">one-off</span>
                </div>
                <div className="mb-2 mt-1 text-sm text-[#00D4FF]">
                  {pkg.candidates} candidates
                </div>
                <ul className="mt-4 flex-1 space-y-3">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#00D4FF]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-in"
                  className={`mt-6 block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-all ${
                    isPopular
                      ? "bg-[#4540DB] text-white shadow-lg shadow-[#4540DB]/30 hover:bg-[#3632b5]"
                      : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Employer Subscriptions */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white">Employer Subscriptions</h2>
          <p className="mt-3 text-gray-400">
            Monthly plans for ongoing access to our talent pipeline and tools
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {SUBSCRIPTION_TIERS.map((tier) => {
            const isPopular = "popular" in tier && tier.popular;
            const isEnterprise = tier.id === "employer_enterprise";
            return (
              <div
                key={tier.id}
                className={`relative flex flex-col rounded-2xl border p-8 backdrop-blur-sm transition-all hover:border-white/20 ${
                  isPopular
                    ? "border-[#4540DB]/40 bg-[#4540DB]/[0.06] shadow-lg shadow-[#4540DB]/10"
                    : "border-white/[0.08] bg-white/[0.03]"
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#4540DB] px-3 py-1 text-xs font-bold text-white">
                    Popular
                  </span>
                )}
                <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
                <p className="mt-1 text-sm text-gray-400">{tier.description}</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-white">{formatPrice(tier.price)}</span>
                  <span className="ml-1 text-sm text-gray-500">/month</span>
                </div>
                <ul className="mt-8 flex-1 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#00D4FF]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={isEnterprise ? "/contact" : "/sign-in"}
                  className={`mt-8 block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-all ${
                    isPopular
                      ? "bg-[#4540DB] text-white shadow-lg shadow-[#4540DB]/30 hover:bg-[#3632b5]"
                      : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {isEnterprise ? "Contact Sales" : "Get Started"}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Additional Services */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white">Additional Services</h2>
          <p className="mt-3 text-gray-400">
            Standalone services for employers and candidates
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Technical Screening - Standard */}
          <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition-all hover:border-white/20">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#4540DB]/20">
              <Shield className="h-5 w-5 text-[#4540DB]" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              {SCREENING_PRICES.standard.label}
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              {SCREENING_PRICES.standard.description}
            </p>
            <div className="mt-4 text-2xl font-bold text-white">
              {formatPrice(SCREENING_PRICES.standard.price)}
              <span className="ml-1 text-sm font-normal text-gray-500">per candidate</span>
            </div>
            <Link
              href="/sign-in"
              className="mt-6 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Order Screening
            </Link>
          </div>

          {/* Technical Screening - Advanced */}
          <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition-all hover:border-white/20">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#00D4FF]/20">
              <Zap className="h-5 w-5 text-[#00D4FF]" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              {SCREENING_PRICES.advanced.label}
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              {SCREENING_PRICES.advanced.description}
            </p>
            <div className="mt-4 text-2xl font-bold text-white">
              {formatPrice(SCREENING_PRICES.advanced.price)}
              <span className="ml-1 text-sm font-normal text-gray-500">per candidate</span>
            </div>
            <Link
              href="/sign-in"
              className="mt-6 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Order Screening
            </Link>
          </div>

          {/* Candidate Premium */}
          <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition-all hover:border-white/20">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#8B5CF6]/20">
              <Star className="h-5 w-5 text-[#8B5CF6]" />
            </div>
            <h3 className="text-lg font-semibold text-white">Candidate Premium</h3>
            <p className="mt-1 text-sm text-gray-400">
              {CANDIDATE_SERVICES.premium_monthly.description}
            </p>
            <div className="mt-4 text-2xl font-bold text-white">
              {formatPrice(CANDIDATE_SERVICES.premium_monthly.price)}
              <span className="ml-1 text-sm font-normal text-gray-500">/mo</span>
            </div>
            <Link
              href="/sign-in"
              className="mt-6 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Go Premium
            </Link>
          </div>

          {/* Agency Verify */}
          <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition-all hover:border-white/20 md:col-span-2 lg:col-span-3">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#10B981]/20">
                <Award className="h-5 w-5 text-[#10B981]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Agency Verify</h3>
                <p className="text-sm text-gray-400">
                  Partner with OSCABE to access verified candidates and co-sell our screening
                  services. Custom pricing based on volume.
                </p>
              </div>
              <Link
                href="/contact"
                className="ml-auto shrink-0 rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                Partner With Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Traditional Recruitment */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white">Traditional Recruitment</h2>
          <p className="mt-3 text-gray-400">
            Proven placement models tailored to your hiring needs
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              icon: Briefcase,
              title: "Contingency Placements",
              price: "12–18% of salary",
              description: "Pay only when you hire. Our standard success-based model with built-in protection.",
              features: [
                "Fee based on candidate annual salary",
                "90-day replacement guarantee",
                "Chartered engineer screening included",
              ],
            },
            {
              icon: Shield,
              title: "Retained Search",
              price: "20–25% in milestones",
              description: "Dedicated search for senior and hard-to-fill roles like Engineering Managers, Lead Controls, and Safety PLC.",
              features: [
                "Milestone payments: 30% / 30% / 40%",
                "Exclusive dedicated search team",
                "Ideal for senior & niche automation roles",
              ],
            },
            {
              icon: Users,
              title: "Contractor Staffing",
              price: "8–15% margin on day rates",
              description: "Flexible contractor supply at £300–£500/day typical rates, fully compliant and audit-ready.",
              features: [
                "IR35 compliant engagements",
                "FCSA-accredited umbrella companies",
                "Rapid deployment for project peaks",
              ],
            },
            {
              icon: Globe,
              title: "International Placement",
              price: "£3,000–£8,000 flat fee",
              description: "Global talent sourcing with visa support, powered by our Dubai and Bangalore offices.",
              features: [
                "End-to-end visa & relocation support",
                "Dubai and Bangalore sourcing hubs",
                "Cross-border compliance handled",
              ],
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition-all hover:border-white/20"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#4540DB]/20">
                <item.icon className="h-5 w-5 text-[#4540DB]" />
              </div>
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-1 text-sm text-gray-400">{item.description}</p>
              <div className="mt-4 text-xl font-bold text-[#00D4FF]">{item.price}</div>
              <ul className="mt-4 flex-1 space-y-3">
                {item.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#00D4FF]" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Hybrid Retainer Model */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white">Hybrid Retainer Model</h2>
          <p className="mt-3 text-gray-400">
            De-risk your hiring while lowering total cost per hire
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="relative rounded-2xl border border-[#4540DB]/40 bg-gradient-to-br from-[#4540DB]/[0.08] to-[#00D4FF]/[0.04] p-8 backdrop-blur-sm shadow-lg shadow-[#4540DB]/10">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#4540DB] to-[#00D4FF] px-4 py-1 text-xs font-bold text-white">
              Most Flexible
            </span>
            <div className="text-center">
              <div className="mt-2 flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold text-white">£999</span>
                <span className="text-gray-400">/month retainer</span>
                <span className="text-2xl font-bold text-white">+ 8%</span>
                <span className="text-gray-400">on successful hires</span>
              </div>
              <p className="mx-auto mt-4 max-w-lg text-gray-400">
                Gaining strongest traction in 2026. Combines predictable monthly investment with significantly reduced placement fees.
              </p>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Industry Standard</p>
                <p className="mt-2 text-2xl font-bold text-gray-400">0% retainer + 15–25% fee</p>
                <p className="mt-1 text-sm text-gray-500">High placement cost, no commitment</p>
              </div>
              <div className="rounded-xl border border-[#00D4FF]/30 bg-[#00D4FF]/[0.05] p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">OSCABE Hybrid</p>
                <p className="mt-2 text-2xl font-bold text-white">£999/mo + 8% fee</p>
                <p className="mt-1 text-sm text-[#00D4FF]/70">Lower total cost, ongoing partnership</p>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Link
                href="/contact"
                className="rounded-lg bg-[#4540DB] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#4540DB]/30 transition-all hover:bg-[#3632b5]"
              >
                Discuss Hybrid Retainer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Market Intelligence */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white">Market Intelligence</h2>
          <p className="mt-3 text-gray-400">
            Stay ahead of the competition with real-time talent data
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm transition-all hover:border-white/20">
            <span className="absolute -top-3 right-6 rounded-full bg-[#00D4FF] px-3 py-1 text-xs font-bold text-[#02012B]">
              New
            </span>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#00D4FF]/20">
              <BarChart3 className="h-5 w-5 text-[#00D4FF]" />
            </div>
            <h3 className="text-xl font-semibold text-white">Talent Radar</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">£499</span>
              <span className="text-gray-400">/month subscription</span>
            </div>
            <p className="mt-3 text-sm text-gray-400">
              Weekly intelligence delivered to your inbox — know who is available before your competitors do.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Weekly email: 5 new automation candidates in your region",
                "Salary movement data and market trends",
                "First-look access before competitors",
                "Regional talent supply and demand insights",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#00D4FF]" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              className="mt-6 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Subscribe to Talent Radar
            </Link>
          </div>
        </div>
      </section>

      {/* Advisory & Consulting */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white">Advisory &amp; Consulting</h2>
          <p className="mt-3 text-gray-400">
            Expert guidance to optimise your automation workforce strategy
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: TrendingUp,
              title: "Automation Workforce Audit",
              price: "£2,000–£5,000",
              description: "Full review of your current team structure, skills gaps, and hiring roadmap.",
            },
            {
              icon: Target,
              title: "12-Month Talent Strategy",
              price: "£3,000–£5,000",
              description: "Bespoke workforce plan aligned to your project pipeline and growth targets.",
            },
            {
              icon: BarChart3,
              title: "Salary Benchmarking Report",
              price: "£1,500–£2,500",
              description: "Detailed compensation analysis by role, region, and specialism.",
            },
            {
              icon: Shield,
              title: "IR35 Compliance Assessment",
              price: "£500–£1,500",
              description: "Status determination statements and compliance review for your contractor engagements.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition-all hover:border-white/20"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#4540DB]/20">
                <item.icon className="h-5 w-5 text-[#4540DB]" />
              </div>
              <h3 className="text-base font-semibold text-white">{item.title}</h3>
              <p className="mt-1 text-sm text-gray-400">{item.description}</p>
              <div className="mt-auto pt-4 text-lg font-bold text-[#00D4FF]">{item.price}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Training & Upskilling */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white">Training &amp; Upskilling</h2>
          <p className="mt-3 text-sm font-medium uppercase tracking-wider text-[#4540DB]">
            Powered by Wartens
          </p>
          <p className="mt-3 text-gray-400">
            Bridge the skill gap — we train near-match candidates on your exact stack
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: BookOpen,
              title: "Pre-Placement Upskilling",
              price: "£2,000",
              unit: "/placement",
              description: "Targeted training for near-match candidates to fill specific skill gaps before they start on your site.",
              features: [
                "Customised to your PLC/SCADA stack",
                "Practical hands-on training",
                "Completion certification included",
              ],
            },
            {
              icon: GraduationCap,
              title: "Platform Cross-Training Bootcamp",
              price: "£4,750",
              unit: "/person",
              description: "4-week intensive programme to cross-train engineers on new automation platforms.",
              features: [
                "4-week intensive programme",
                "Siemens, Allen-Bradley, Mitsubishi",
                "Real-world project simulations",
              ],
            },
            {
              icon: Sparkles,
              title: "nxtED AI Candidate Subscriptions",
              price: "£9.99",
              unit: "/month",
              description: "AI-powered continuous learning platform for automation engineers to stay current.",
              features: [
                "AI-personalised learning paths",
                "Micro-certifications on completion",
                "Employer dashboard for team progress",
              ],
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition-all hover:border-white/20"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#4540DB]/20">
                <item.icon className="h-5 w-5 text-[#4540DB]" />
              </div>
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-1 text-sm text-gray-400">{item.description}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">{item.price}</span>
                <span className="text-sm text-gray-500">{item.unit}</span>
              </div>
              <ul className="mt-4 flex-1 space-y-3">
                {item.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#00D4FF]" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white">OSCABE vs Traditional Recruiter</h2>
          <p className="mt-3 text-gray-400">
            See how we compare on cost, speed, and quality
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.08] backdrop-blur-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.05]">
                <th className="px-6 py-4 font-semibold text-white">Feature</th>
                <th className="px-6 py-4 font-semibold text-gray-400">Traditional Recruiter</th>
                <th className="px-6 py-4 font-semibold text-[#00D4FF]">OSCABE</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Fee", traditional: "15–25% of salary", oscabe: "From £1,500 flat fee" },
                { feature: "Screening", traditional: "Keyword matching", oscabe: "Chartered Engineer verification" },
                { feature: "Speed", traditional: "2–4 weeks", oscabe: "48 hours" },
                { feature: "Guarantee", traditional: "Often none", oscabe: "90-day replacement" },
                { feature: "Model Options", traditional: "Contingency only", oscabe: "6 flexible models" },
                { feature: "AI Matching", traditional: "No", oscabe: "Yes (3BOX AI)" },
                { feature: "Training", traditional: "No", oscabe: "Wartens upskilling pipeline" },
              ].map((row, i) => (
                <tr
                  key={row.feature}
                  className={`border-b border-white/[0.05] ${
                    i % 2 === 0 ? "bg-white/[0.02]" : "bg-white/[0.04]"
                  }`}
                >
                  <td className="px-6 py-4 font-medium text-white">{row.feature}</td>
                  <td className="px-6 py-4 text-gray-500">{row.traditional}</td>
                  <td className="px-6 py-4 font-medium text-[#00D4FF]">{row.oscabe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-white/[0.08] bg-white/[0.02] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { icon: Shield, label: "Chartered Engineer Led" },
              { icon: Award, label: "Startup of the Year 2025" },
              { icon: Zap, label: "48hr Priority Delivery" },
              { icon: Star, label: "90-Day Guarantee" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2 text-center">
                <item.icon className="h-6 w-6 text-[#00D4FF]" />
                <span className="text-sm font-medium text-gray-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="mt-3 text-gray-400">
            Everything you need to know about our pricing and services
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => (
            <FaqItem key={item.q} question={item.q} answer={item.a} />
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[#4540DB]/30 bg-gradient-to-r from-[#4540DB]/10 to-[#00D4FF]/10 p-12 backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-white">Ready to find your next engineer?</h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-400">
              Get started today with a shortlist package or speak to our team about a tailored
              solution for your hiring needs.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-in"
                className="rounded-lg bg-[#4540DB] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#4540DB]/30 transition-all hover:bg-[#3632b5]"
              >
                Get Started
              </Link>
              <Link
                href="/contact"
                className="rounded-lg border border-white/10 bg-white/5 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <span className="text-sm font-medium text-white">{question}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-4">
          <p className="text-sm leading-relaxed text-gray-400">{answer}</p>
        </div>
      )}
    </div>
  );
}
