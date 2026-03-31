"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Users,
  ArrowRight,
  Network,
  Paintbrush,
  CheckCircle,
  TrendingUp,
  Calculator,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AwardsBanner } from "@/components/shared/awards-banner";

const PRODUCTS = [
  {
    icon: ShieldCheck,
    title: "OSCABE Verify",
    subtitle: "Technical Screening as a Service",
    price: "\u00a330\u2013\u00a375/candidate",
    description:
      "Leverage our engineer-led technical assessment framework to verify your candidates\u2019 skills before submission. Provide your clients with confidence that your candidates can deliver from day one.",
    features: [
      "Technical assessments designed by chartered engineers",
      "Platform-specific verification (Siemens, Rockwell, Schneider, etc.)",
      "White-label PDF reports branded to your agency",
      "Faster client acceptance rates",
    ],
  },
  {
    icon: Users,
    title: "Talent Pool Access",
    subtitle: "Verified Candidate Database",
    price: "Subscription",
    description:
      "Access our growing database of pre-verified engineers. Search by platform, industry, and skill level to find candidates that match your open requirements instantly.",
    features: [
      "Pre-screened and technically verified engineers",
      "Search by specialisation, industry, and seniority",
      "Candidate availability alerts",
      "Reduced time-to-shortlist",
    ],
  },
  {
    icon: Network,
    title: "Split-Fee Network",
    subtitle: "Collaborate on Roles and Share Candidates",
    price: "Revenue share",
    description:
      "Join our split-fee marketplace to collaborate with other specialist recruiters. Share roles, share candidates, and close more placements together.",
    features: [
      "Access to exclusive roles across sectors",
      "Transparent split-fee arrangements",
      "Vetted network of specialist agencies",
      "Collaborative placement tracking",
    ],
  },
  {
    icon: Paintbrush,
    title: "White-Label Tools",
    subtitle: "AI Recruitment Tools Under Your Brand",
    price: "Custom pricing",
    description:
      "Embed OSCABE\u2019s AI-powered matching and verification technology into your own platform. Offer cutting-edge recruitment capabilities under your brand.",
    features: [
      "AI candidate matching engine",
      "Customisable to your brand identity",
      "API integration with your ATS",
      "Technical verification workflows",
    ],
  },
];

const WHY_PARTNER = [
  {
    title: "Broader Talent Pool",
    description:
      "Tap into a growing network of verified candidates you won\u2019t find on job boards. Expand your reach without expanding your sourcing team.",
  },
  {
    title: "AI-Powered Matching",
    description:
      "Our AI analyses skills, experience, and preferences to surface the best-fit candidates for your roles in seconds, not days.",
  },
  {
    title: "Technical Verification",
    description:
      "Every candidate in our pool is assessed by chartered engineers. Submit with confidence and reduce client rejection rates.",
  },
  {
    title: "Flexible Commercial Terms",
    description:
      "Whether you prefer per-candidate pricing, subscriptions, or revenue share, we\u2019ll find a model that works for your agency.",
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
            Expand your reach, share candidates across a trusted network, and
            earn split fees&mdash;all backed by AI-powered matching and
            engineer-led technical verification.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white px-8 transition-transform hover:scale-105"
                style={{ boxShadow: "0 0 30px rgba(139,92,246,0.4)" }}
              >
                Become a Partner
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#products">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8"
              >
                Learn More
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Partnership Products */}
      <section
        id="products"
        className="border-y border-white/[0.06] bg-white/[0.02] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Partnership Products
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-400">
              Four ways to grow your recruitment business with OSCABE.
            </p>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {PRODUCTS.map((product) => (
              <div
                key={product.title}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]"
                style={{
                  transition:
                    "box-shadow 0.3s, border-color 0.3s, background 0.3s",
                }}
                onMouseEnter={(e) => {
                  (
                    e.currentTarget as HTMLDivElement
                  ).style.boxShadow =
                    "0 0 30px rgba(139,92,246,0.15)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "none";
                }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#8B5CF6]/15">
                    <product.icon className="h-5 w-5 text-[#8B5CF6]" />
                  </div>
                  <span className="rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3 py-1 text-xs font-medium text-[#8B5CF6]">
                    {product.price}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {product.title}
                </h3>
                <p className="mt-1 text-sm font-medium text-[#8B5CF6]">
                  {product.subtitle}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">
                  {product.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {product.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-gray-400"
                    >
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

      {/* Why Partner */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Why Partner With OSCABE?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-400">
              We give your agency a competitive edge with technology,
              talent, and flexible terms.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {WHY_PARTNER.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-[#8B5CF6]" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Potential */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Revenue Potential
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-400">
              See what partnering with OSCABE could mean for your bottom
              line.
            </p>
          </div>

          <div
            className="mx-auto mt-10 max-w-2xl rounded-2xl border border-[#8B5CF6]/20 bg-white/[0.03] backdrop-blur-sm p-8"
            style={{ boxShadow: "0 0 40px rgba(139,92,246,0.08)" }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#8B5CF6]/15">
                <Calculator className="h-5 w-5 text-[#8B5CF6]" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Example Earnings
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
                <span className="text-sm text-gray-400">
                  10 OSCABE Verify assessments/month &times; &pound;50 avg
                </span>
                <span className="text-lg font-bold text-white">
                  &pound;500/month
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
                <span className="text-sm text-gray-400">
                  5 split-fee placements/year &times; &pound;3,500 avg
                </span>
                <span className="text-lg font-bold text-white">
                  &pound;17,500/year
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
                <span className="text-sm text-gray-400">
                  Talent Pool subscription savings on sourcing
                </span>
                <span className="text-lg font-bold text-white">
                  &pound;5,000+/year
                </span>
              </div>
              <div className="mt-2 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent" />
              <div className="flex items-center justify-between px-5 py-2">
                <span className="text-base font-semibold text-white">
                  Total potential Year 1
                </span>
                <span className="text-2xl font-extrabold text-[#8B5CF6]">
                  &pound;28,500+
                </span>
              </div>
              <p className="text-center text-xs text-gray-500">
                in additional revenue and cost savings from OSCABE
                partnership
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[#8B5CF6]/20 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4 flex justify-center">
            <TrendingUp className="h-10 w-10 text-[#8B5CF6]" />
          </div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to Grow Your Agency?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
            Join a growing network of recruitment partners who are placing
            faster, earning more, and delivering verified talent their
            clients trust.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-[#8B5CF6] text-white hover:bg-[#8B5CF6]/90 px-8 transition-transform hover:scale-105"
                style={{ boxShadow: "0 0 30px rgba(139,92,246,0.4)" }}
              >
                Partner With Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8"
              >
                Book a Call
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Awards */}
      <AwardsBanner compact accentColor="#8B5CF6" />
    </div>
  );
}
