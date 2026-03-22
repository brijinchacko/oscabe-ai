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

      {/* Pricing */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Pricing That Works
            </h2>
            <p className="mt-4 text-gray-400">
              We operate on a simple percentage-based fee, charged only on
              successful placement. No upfront costs, no retainers, no hidden
              charges. You only pay when we deliver.
            </p>
            <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm px-6 py-5">
              <div className="flex flex-col items-start gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-[#4540DB]" />
                  <span className="font-medium text-white">
                    No upfront costs
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-[#4540DB]" />
                  <span className="font-medium text-white">
                    Percentage-based placement fee
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-[#4540DB]" />
                  <span className="font-medium text-white">
                    Rebate period included
                  </span>
                </div>
              </div>
            </div>
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
