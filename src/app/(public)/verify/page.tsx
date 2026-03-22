"use client";

import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  ClipboardList,
  UserCheck,
  FileText,
  Star,
  Zap,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AwardsBanner } from "@/components/shared/awards-banner";

const PRICING = [
  {
    tier: "Basic Assessment",
    price: "30",
    description:
      "Essential skill verification for a single automation platform. Ideal for confirming core competencies before client submission.",
    features: [
      "Single platform assessment",
      "Written technical evaluation",
      "Pass / Fail grading with score",
      "PDF report with your branding",
      "48-hour turnaround",
    ],
  },
  {
    tier: "Advanced Assessment",
    price: "75",
    popular: true,
    description:
      "In-depth multi-platform assessment with scenario-based questions reviewed by a Chartered Engineer.",
    features: [
      "Multi-platform assessment (up to 3)",
      "Scenario-based practical questions",
      "Chartered Engineer review & sign-off",
      "Detailed skills breakdown report",
      "White-label branded PDF",
      "Priority 24-hour turnaround",
    ],
  },
];

const HOW_IT_WORKS = [
  {
    icon: ClipboardList,
    step: "1",
    title: "Submit Candidate",
    description:
      "Enter your candidate details and select the platforms to assess. Choose Basic or Advanced assessment level.",
  },
  {
    icon: UserCheck,
    step: "2",
    title: "OSCABE Assesses",
    description:
      "Our Chartered Engineers evaluate the candidate against platform-specific criteria using our proprietary framework.",
  },
  {
    icon: FileText,
    step: "3",
    title: "Receive Branded Report",
    description:
      "Get a professional PDF report branded with your agency logo. Share it with your clients to build trust and close faster.",
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "20+ Automation Platforms",
    description:
      "Siemens, Rockwell, Schneider, Beckhoff, Mitsubishi, ABB, FANUC, KUKA, and more.",
  },
  {
    icon: Award,
    title: "Chartered Engineer Review",
    description:
      "Every Advanced assessment is reviewed and signed off by a registered Chartered Engineer.",
  },
  {
    icon: ShieldCheck,
    title: "White-Label Branded PDF",
    description:
      "Reports carry your agency branding. Your clients see your name, not ours.",
  },
  {
    icon: Star,
    title: "Trusted by Agencies",
    description:
      "Used by recruitment agencies across the UK to differentiate their candidates in a competitive market.",
  },
];

export default function VerifyPage() {
  return (
    <div className="bg-[#02012B]">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#8B5CF6]/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-[#8B5CF6]/15 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8B5CF6]/20">
            <ShieldCheck className="h-8 w-8 text-[#8B5CF6]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            OSCABE Verify
          </h1>
          <p className="mt-2 text-lg font-medium text-[#8B5CF6]">
            Technical Assessment as a Service
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            Verify your candidates&apos; automation skills with engineer-led
            assessments. Deliver branded reports to your clients and close
            placements with confidence.
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

      {/* How it Works */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              How It Works
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-400">
              Three simple steps to verified candidates.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8B5CF6]/15">
                  <item.icon className="h-6 w-6 text-[#8B5CF6]" />
                </div>
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-[#8B5CF6]">
                  Step {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-400">
              Pay per assessment. No subscriptions, no hidden fees.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {PRICING.map((plan) => (
              <div
                key={plan.tier}
                className={`rounded-2xl border p-8 backdrop-blur-sm transition-all duration-300 ${
                  plan.popular
                    ? "border-[#8B5CF6]/40 bg-[#8B5CF6]/[0.08]"
                    : "border-white/[0.08] bg-white/[0.03]"
                }`}
              >
                {plan.popular && (
                  <span className="mb-4 inline-block rounded-full bg-[#8B5CF6]/20 px-3 py-1 text-xs font-semibold text-[#8B5CF6]">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-white">{plan.tier}</h3>
                <div className="mt-3">
                  <span className="text-4xl font-bold text-white">
                    &pound;{plan.price}
                  </span>
                  <span className="ml-1 text-sm text-gray-400">
                    per assessment
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-gray-400">
                  {plan.description}
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-gray-300"
                    >
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#8B5CF6]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/contact">
                  <Button
                    className={`mt-8 w-full transition-transform hover:scale-[1.02] ${
                      plan.popular
                        ? "bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white"
                        : "border border-white/[0.15] bg-white/[0.05] text-white hover:bg-white/[0.1]"
                    }`}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Why Agencies Choose OSCABE Verify
            </h2>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#8B5CF6]/15">
                  <feature.icon className="h-5 w-5 text-[#8B5CF6]" />
                </div>
                <h3 className="text-sm font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm">
            <div className="flex justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="h-5 w-5 fill-[#8B5CF6] text-[#8B5CF6]"
                />
              ))}
            </div>
            <blockquote className="text-lg italic leading-relaxed text-gray-300">
              &ldquo;OSCABE Verify has transformed how we present candidates to
              our clients. The branded technical reports give us instant
              credibility and have shortened our placement cycles
              significantly.&rdquo;
            </blockquote>
            <div className="mt-6">
              <p className="font-semibold text-white">Sarah Mitchell</p>
              <p className="text-sm text-gray-400">
                Director, Apex Automation Recruitment
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
            Ready to Verify Your Candidates?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
            Join agencies across the UK who use OSCABE Verify to differentiate
            their candidates and win more placements.
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
