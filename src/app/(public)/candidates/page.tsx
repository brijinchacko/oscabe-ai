"use client";

import Link from "next/link";
import {
  BadgeCheck,
  Briefcase,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  FileText,
  Headphones,
  Crown,
  GraduationCap,
  Gift,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLATFORMS } from "@/lib/constants";
import { AwardsBanner } from "@/components/shared/awards-banner";

const BENEFITS = [
  {
    icon: BadgeCheck,
    title: "Get Skill-Verified",
    description:
      "Earn a verification badge that proves your PLC, SCADA, and controls expertise to employers. Stand out from the crowd with technical proof, not just a CV.",
  },
  {
    icon: Briefcase,
    title: "Access Premium Roles",
    description:
      "Get exclusive access to high-quality automation roles that are never publicly advertised. Our employer network includes top-tier system integrators and end users.",
  },
  {
    icon: TrendingUp,
    title: "Career Growth",
    description:
      "Receive salary benchmarking data for your role and region, career guidance from engineers who understand your field, and insights to negotiate better.",
  },
];

const WHY_POINTS = [
  "Engineer-reviewed matching, not just keyword search",
  "Transparent salary information on every role",
  "Dedicated support from people who speak your language",
  "Fast-track process: no unnecessary hoops",
  "Your data is secure and only shared with your consent",
];

export default function CandidatesPage() {
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
        <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#00D4FF]/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-[#00D4FF]/15 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/3 left-1/4 h-[300px] w-[300px] rounded-full bg-[#00D4FF]/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Your Skills, Verified.
            <br />
            Your Career, Accelerated.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            OSCABE connects skilled automation engineers with the best
            opportunities in the industry. Get technically verified and let
            employers come to you.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/jobs">
              <Button
                size="lg"
                className="bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-[#02012B] font-semibold px-8 transition-transform hover:scale-105"
                style={{ boxShadow: "0 0 30px rgba(0,212,255,0.4)" }}
              >
                Browse Jobs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="border border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:text-white"
              >
                Register Your Interest
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
              Built for Engineers, by Engineers
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-400">
              We understand automation because our team lives and breathes it.
              Here is what you get with OSCABE.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]"
                style={{ transition: "box-shadow 0.3s, border-color 0.3s, background 0.3s" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 30px rgba(0,212,255,0.15)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#00D4FF]/15">
                  <benefit.icon className="h-5 w-5 text-[#00D4FF]" />
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

      {/* Why OSCABE */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Why Engineers Trust OSCABE
            </h2>
            <div className="mt-8 space-y-4 text-left">
              {WHY_POINTS.map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#00D4FF]" />
                  <p className="text-gray-400">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Platforms We Recruit For
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-400">
              Whether you specialise in Siemens, Rockwell, Schneider, or niche
              platforms, we have roles that match your expertise.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-2.5">
            {PLATFORMS.map((platform) => (
              <span
                key={platform}
                className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-sm text-gray-300 backdrop-blur-sm"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Services */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Premium Services
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-400">
              Invest in your career with expert-led services designed for automation professionals.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {/* AI CV Review */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#00D4FF]/15">
                <FileText className="h-5 w-5 text-[#00D4FF]" />
              </div>
              <h3 className="text-lg font-semibold text-white">AI CV Review</h3>
              <p className="mt-2 text-2xl font-bold text-[#00D4FF]">
                &pound;50<span className="text-sm font-normal text-gray-400"> one-time</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Professional CV optimisation for automation roles. AI-powered analysis with expert review to make your experience shine.
              </p>
            </div>

            {/* Interview Prep */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#00D4FF]/15">
                <Headphones className="h-5 w-5 text-[#00D4FF]" />
              </div>
              <h3 className="text-lg font-semibold text-white">Interview Prep</h3>
              <p className="mt-2 text-2xl font-bold text-[#00D4FF]">
                &pound;50<span className="text-sm font-normal text-gray-400">/session</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                1-hour coaching session with an industry expert. Technical interview practice tailored to your target role and platform.
              </p>
            </div>

            {/* Premium Membership */}
            <div className="relative rounded-2xl border border-[#00D4FF]/30 bg-white/[0.03] backdrop-blur-sm p-6 transition-all duration-300 hover:border-[#00D4FF]/50 hover:bg-white/[0.06]">
              <span className="absolute -top-3 right-6 rounded-full bg-[#00D4FF] px-3 py-1 text-xs font-semibold text-[#02012B]">
                Best Value
              </span>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#00D4FF]/15">
                <Crown className="h-5 w-5 text-[#00D4FF]" />
              </div>
              <h3 className="text-lg font-semibold text-white">Premium Membership</h3>
              <p className="mt-2 text-2xl font-bold text-[#00D4FF]">
                &pound;9.99<span className="text-sm font-normal text-gray-400">/month</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Priority job alerts, career intelligence reports, and exclusive access to premium roles before they go public.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upskill Your Career */}
      <section className="border-y border-white/[0.06] overflow-hidden">
        <div
          className="py-16 sm:py-20"
          style={{
            background: "linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(139,92,246,0.08) 50%, rgba(0,212,255,0.04) 100%)",
          }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  Upskill Your Career
                </h2>
                <span className="rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3 py-1 text-xs font-semibold text-[#8B5CF6]">
                  Powered by Wartens
                </span>
              </div>
              <p className="mx-auto mt-3 max-w-2xl text-gray-400">
                Level up your skills with AI-powered learning and expert-led training programmes.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6 text-center transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#8B5CF6]/15">
                  <GraduationCap className="h-5 w-5 text-[#8B5CF6]" />
                </div>
                <h3 className="text-lg font-semibold text-white">Platform Cross-Training</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  Learn a new PLC platform in 4 weeks. Structured programmes for Siemens, Rockwell, Schneider and more.
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6 text-center transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#8B5CF6]/15">
                  <Sparkles className="h-5 w-5 text-[#8B5CF6]" />
                </div>
                <h3 className="text-lg font-semibold text-white">nxtED AI Learning</h3>
                <p className="mt-2 text-2xl font-bold text-[#8B5CF6]">
                  &pound;9.99<span className="text-sm font-normal text-gray-400">/month</span>
                </p>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  AI-powered microlearning tailored to your skill gaps and career goals.
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6 text-center transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#8B5CF6]/15">
                  <BookOpen className="h-5 w-5 text-[#8B5CF6]" />
                </div>
                <h3 className="text-lg font-semibold text-white">Pre-Placement Training</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  Get trained on your new employer&apos;s exact stack before day one. Hit the ground running.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Refer & Earn */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-2xl border border-[#22C55E]/20 bg-white/[0.03] backdrop-blur-sm p-8 sm:p-10"
            style={{ boxShadow: "0 0 40px rgba(34,197,94,0.08)" }}
          >
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#22C55E]/15">
                <Gift className="h-8 w-8 text-[#22C55E]" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  Refer &amp; Earn &pound;200
                </h2>
                <p className="mt-2 text-gray-400">
                  Know a talented automation engineer? Refer them and earn &pound;200 for every successful placement.
                </p>
              </div>
              <Link href="/refer">
                <button
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#22C55E] px-8 py-3 text-sm font-bold text-white shadow-xl transition-all hover:scale-105"
                  style={{ boxShadow: "0 0 30px rgba(34,197,94,0.4)" }}
                >
                  <Gift className="h-4 w-4" />
                  Start Referring
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Awards */}
      <AwardsBanner compact accentColor="#00D4FF" />

      {/* CTA */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[#00D4FF]/20 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to Take the Next Step?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
            Browse live roles or register your interest and we will match you
            with opportunities that fit your skills and career goals.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/jobs">
              <Button
                size="lg"
                className="bg-[#00D4FF] text-[#02012B] font-semibold hover:bg-[#00D4FF]/90 px-8 transition-transform hover:scale-105"
                style={{ boxShadow: "0 0 30px rgba(0,212,255,0.4)" }}
              >
                Browse Jobs
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="border border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:text-white"
              >
                Register Your Interest
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
