"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Users,
  ArrowRight,
  Network,
  Paintbrush,
  CheckCircle,
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
