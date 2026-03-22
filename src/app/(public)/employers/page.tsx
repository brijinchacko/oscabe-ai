"use client";

import Link from "next/link";
import {
  Brain,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle,
  Send,
  Users,
  FileSearch,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AwardsBanner } from "@/components/shared/awards-banner";

const BENEFITS = [
  {
    icon: Brain,
    title: "AI-Powered Matching",
    description:
      "Our AI analyses skills, experience, and cultural fit to shortlist candidates that actually match your requirements, not just keyword matches.",
  },
  {
    icon: ShieldCheck,
    title: "Technical Verification",
    description:
      "Every candidate is technically assessed by chartered engineers who understand PLC, SCADA, and controls inside out.",
  },
  {
    icon: Clock,
    title: "48-Hour Shortlists",
    description:
      "From brief to shortlist in 48 hours. Our pre-verified talent pool means you get quality candidates faster than any traditional recruiter.",
  },
];

const STEPS = [
  {
    step: 1,
    icon: Send,
    title: "Submit Your Brief",
    description:
      "Tell us about the role, the skills you need, and your timeline. It takes less than 5 minutes.",
  },
  {
    step: 2,
    icon: Target,
    title: "AI-Matched Candidates",
    description:
      "Our AI engine searches our verified talent pool and ranks candidates by technical fit, availability, and location.",
  },
  {
    step: 3,
    icon: FileSearch,
    title: "Engineer-Reviewed Shortlist",
    description:
      "Our team of engineers review and validate every shortlist before it reaches you, ensuring quality over quantity.",
  },
  {
    step: 4,
    icon: Users,
    title: "Interview & Hire",
    description:
      "We coordinate interviews, handle offers, and support onboarding. You stay focused on your projects.",
  },
];

export default function EmployersPage() {
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
        <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#4540DB]/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-[#4540DB]/15 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4540DB]/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Hire Verified Automation Engineers
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            Stop sifting through unqualified CVs. OSCABE delivers technically
            verified PLC, SCADA, and controls engineers, matched by AI and vetted
            by engineers.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/post-a-role">
              <Button
                size="lg"
                className="bg-[#4540DB] hover:bg-[#4540DB]/90 text-white px-8 transition-transform hover:scale-105"
                style={{ boxShadow: "0 0 30px rgba(69,64,219,0.4)" }}
              >
                Post a Role Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="border border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:text-white"
              >
                Talk to Our Team
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Why Employers Choose OSCABE
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-400">
              Purpose-built for industrial automation recruitment, powered by
              technology, delivered by engineers.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]"
                style={{ transition: "box-shadow 0.3s, border-color 0.3s, background 0.3s" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 30px rgba(69,64,219,0.15)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#4540DB]/15">
                  <benefit.icon className="h-5 w-5 text-[#4540DB]" />
                </div>
                <h3 className="text-lg font-semibold text-white">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              How It Works
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-400">
              From brief to hire in four simple steps.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.step} className="relative text-center">
                <div
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#4540DB] text-white"
                  style={{ boxShadow: "0 0 25px rgba(69,64,219,0.35)" }}
                >
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="absolute -top-2 left-1/2 flex h-6 w-6 -translate-x-[calc(50%-24px)] items-center justify-center rounded-full bg-[#02012B] border border-[#4540DB] text-xs font-bold text-white">
                  {step.step}
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Choose Your Hiring Model */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Choose Your Hiring Model
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-400">
              Flexible pricing that fits your hiring volume and budget. No hidden fees.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Contingency",
                label: "Traditional",
                price: "12–18%",
                unit: "of salary",
                best: "Best for standard roles",
                popular: false,
                features: [
                  "Pay only when you hire",
                  "90-day replacement guarantee",
                  "Chartered engineer screening",
                ],
              },
              {
                title: "Shortlist Packages",
                label: "Flat-Fee",
                price: "£1,500–£4,000",
                unit: "per curated shortlist",
                best: "Best for specific needs",
                popular: true,
                features: [
                  "Pre-screened candidate shortlists",
                  "48-hour priority delivery",
                  "Technical assessment included",
                ],
              },
              {
                title: "Subscription",
                label: "Ongoing Access",
                price: "From £999",
                unit: "/month",
                best: "Best for volume hiring",
                popular: false,
                features: [
                  "Continuous talent pipeline",
                  "Dedicated account manager",
                  "Priority candidate access",
                ],
              },
              {
                title: "Hybrid Retainer",
                label: "Best Value",
                price: "£999/mo + 8%",
                unit: "on hires",
                best: "Best for predictable hiring",
                popular: false,
                features: [
                  "Lower total cost per hire",
                  "Ongoing partnership model",
                  "Strongest traction in 2026",
                ],
              },
            ].map((model) => (
              <div
                key={model.title}
                className={`relative flex flex-col rounded-2xl border p-6 backdrop-blur-sm transition-all hover:border-white/20 ${
                  model.popular
                    ? "border-[#4540DB]/40 bg-[#4540DB]/[0.06] shadow-lg shadow-[#4540DB]/10"
                    : "border-white/[0.08] bg-white/[0.03]"
                }`}
              >
                {model.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#4540DB] px-3 py-1 text-xs font-bold text-white">
                    Most Popular
                  </span>
                )}
                <p className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                  {model.label}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">{model.title}</h3>
                <div className="mt-3">
                  <span className="text-2xl font-bold text-white">{model.price}</span>
                  <span className="ml-1 text-sm text-gray-500">{model.unit}</span>
                </div>
                <p className="mt-2 text-xs font-medium text-[#4540DB]">{model.best}</p>
                <ul className="mt-4 flex-1 space-y-3">
                  {model.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#00D4FF]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/pricing"
                  className={`mt-6 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-center text-sm font-semibold transition-all ${
                    model.popular
                      ? "bg-[#4540DB] text-white shadow-lg shadow-[#4540DB]/30 hover:bg-[#3632b5]"
                      : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  Learn More
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards */}
      <AwardsBanner compact accentColor="#4540DB" />

      {/* CTA */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[#4540DB]/20 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to Hire?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
            Post your role today and receive a shortlist of technically verified
            automation engineers within 48 hours.
          </p>
          <Link href="/post-a-role">
            <Button
              size="lg"
              className="mt-8 bg-[#4540DB] text-white hover:bg-[#4540DB]/90 px-8 transition-transform hover:scale-105"
              style={{ boxShadow: "0 0 30px rgba(69,64,219,0.4)" }}
            >
              Post a Role Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
