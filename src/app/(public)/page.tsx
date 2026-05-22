"use client";

import { useState, useEffect, useRef, type RefObject } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
  Shield,
  Zap,
  Cpu,
  Brain,
  Bot,
  Search,
  Send,
  Rocket,
  Receipt,
  Award,
  Quote,
} from "lucide-react";
import { AwardsBanner } from "@/components/shared/awards-banner";
import { EngineerCard } from "@/components/shared/engineer-card";
import { getFeaturedEngineers } from "@/lib/engineers-data";

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */
function useInView(threshold = 0.15): [RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [ref, visible] = useInView(0.1);
  return (
    <section
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */
const HERO_BADGES = [
  "Expert-Led",
  "ISO 9001:2015",
  "GDPR Compliant",
  "UK Startup National Winner 2025",
];

const STATS = [
  { value: "6,000+", label: "Pre-Screened Engineers", icon: Users },
  { value: "72 hrs", label: "Average Shortlist", icon: Clock },
  { value: "40-60%", label: "Cost Saving vs UK", icon: Zap },
  { value: "97+", label: "Skills in Our Ontology", icon: Cpu },
];

const HOW_IT_WORKS_STEPS = [
  { icon: Search, title: "Browse" },
  { icon: Send, title: "Request" },
  { icon: Shield, title: "We match" },
  { icon: Rocket, title: "Work begins" },
  { icon: Receipt, title: "Monthly invoice" },
];

const WHY_OSCABE = [
  "Engineer-led technical screening - not HR, not keyword matching",
  "72-hour shortlists, guaranteed",
  "No payroll. No NI. No IR35 determination needed",
  "6,000+ pre-screened automation and AI engineers",
  "13+ years of deep automation and AI expertise",
  "30-day replacement guarantee",
];

const SPECIALISMS = [
  {
    title: "Industrial Automation",
    description: "PLC, SCADA, DCS, controls, commissioning, panel design, safety systems",
    icon: Cpu,
    color: "#4540DB",
  },
  {
    title: "AI / ML",
    description: "Machine learning, computer vision, NLP, MLOps, data science, predictive maintenance",
    icon: Brain,
    color: "#00D4FF",
  },
  {
    title: "Robotics",
    description: "FANUC, ABB, KUKA, Universal Robots, autonomous systems, robotics AI",
    icon: Bot,
    color: "#8B5CF6",
  },
  {
    title: "Digital Twin",
    description: "Simulation, digital twin engineering, IoT platforms, edge computing",
    icon: Zap,
    color: "#F59E0B",
  },
];

const TESTIMONIAL_PLACEHOLDERS = [
  { name: "Engineering Manager", company: "UK Manufacturer" },
  { name: "Operations Director", company: "Food & Beverage" },
  { name: "Head of Automation", company: "Pharmaceutical" },
  { name: "CTO", company: "OEM Integrator" },
];

export default function HomePage() {
  const featuredEngineers = getFeaturedEngineers().slice(0, 6);

  return (
    <div className="bg-[#010118]">
      {/* ============ 1. HERO ============ */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -left-40 h-[700px] w-[700px] rounded-full bg-[#4540DB]/15 blur-[150px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-[#00D4FF]/10 blur-[150px]" />

        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 text-center sm:px-6 sm:pt-28 sm:pb-32 lg:px-8">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-4 py-1.5 text-xs font-medium tracking-wide text-amber-300">
            <Award className="h-3.5 w-3.5" />
            National Manufacturing & Engineering Startup of the Year 2025
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Browse Verified Remote{" "}
            <span className="bg-gradient-to-r from-[#4540DB] to-[#00D4FF] bg-clip-text text-transparent">
              Automation Engineers
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base text-gray-400 sm:text-lg">
            UK engineering teams hire senior PLC, SCADA, AI/ML and Robotics engineers from India and the Middle East. OSCABE-verified. Start in 72 hours. Pay monthly in GBP - no payroll, no NI, no IR35.
          </p>

          {/* CTAs */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/engineers"
              className="inline-flex items-center gap-2 rounded-xl bg-[#4540DB] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#4540DB]/30 transition-all hover:scale-105 hover:bg-[#3733B0]"
            >
              Browse Engineers
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              How It Works
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Looking for UK-based engineers?{" "}
            <Link
              href="/uk-recruitment"
              className="font-medium text-[#00D4FF] underline-offset-4 hover:underline"
            >
              See UK recruitment
            </Link>
          </p>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {HERO_BADGES.map((b) => (
              <span
                key={b}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-gray-300"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 2. STATS BAR ============ */}
      <Section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center"
            >
              <s.icon className="mx-auto h-5 w-5 text-[#00D4FF]" />
              <p className="mt-3 text-xl font-bold text-white sm:text-2xl">{s.value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wider text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ============ 3. FEATURED ENGINEERS ============ */}
      <Section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#4540DB]/40 bg-[#4540DB]/10 px-4 py-1.5 text-xs font-medium tracking-wide text-[#8A85F0]">
            <Users className="h-3.5 w-3.5" />
            Featured Engineers
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Available Engineers This Week
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-gray-400">
            Every engineer is senior-engineer verified. Rates shown are all-inclusive monthly cost.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredEngineers.map((e) => (
            <EngineerCard key={e.slug} engineer={e} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/engineers"
            className="inline-flex items-center gap-2 rounded-xl bg-[#4540DB] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#4540DB]/25 transition-all hover:scale-105 hover:bg-[#3733B0]"
          >
            View All Engineers
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      {/* ============ 4. HOW IT WORKS STRIP ============ */}
      <Section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 sm:p-10">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white sm:text-2xl">5 steps. 72 hours.</h2>
            <p className="mt-2 text-sm text-gray-400">From browse to onboarded engineer.</p>
          </div>

          <ol className="mt-8 grid gap-4 sm:grid-cols-5">
            {HOW_IT_WORKS_STEPS.map((s, i) => (
              <li
                key={s.title}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center"
              >
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#4540DB] to-[#00D4FF]">
                  <s.icon className="h-4 w-4 text-white" />
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-wider text-gray-500">
                  Step {i + 1}
                </p>
                <p className="mt-1 text-sm font-semibold text-white">{s.title}</p>
              </li>
            ))}
          </ol>

          <div className="mt-7 text-center">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#00D4FF] transition-colors hover:text-white"
            >
              See Full Process
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </Section>

      {/* ============ 5. TWO WAYS TO HIRE ============ */}
      <Section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Two Ways to Hire
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-gray-400">
          Most teams use a mix. Use what suits the work.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* Primary - Remote */}
          <article className="relative rounded-2xl border border-[#4540DB]/40 bg-gradient-to-br from-[#4540DB]/10 to-[#00D4FF]/10 p-8 lg:p-10">
            <span className="absolute -top-3 left-6 rounded-full bg-[#4540DB] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Primary path
            </span>
            <h3 className="text-2xl font-bold text-white">Remote Engineers</h3>
            <p className="mt-2 text-base text-gray-300">
              Save 40-60% on UK engineering costs. Browse profiles, hire in 72 hours, pay monthly.
            </p>
            <ul className="mt-5 space-y-2">
              {["No payroll setup", "No NI / pension", "No IR35 risk", "30-day notice either way"].map(
                (b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{b}</span>
                  </li>
                ),
              )}
            </ul>
            <Link
              href="/engineers"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#4540DB] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#4540DB]/25 transition-all hover:scale-105 hover:bg-[#3733B0]"
            >
              Browse Engineers
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>

          {/* Secondary - UK */}
          <article className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 lg:p-10">
            <h3 className="text-2xl font-bold text-white">UK Recruitment</h3>
            <p className="mt-2 text-base text-gray-300">
              For roles that cannot go remote: commissioning, field service, panel wiring.
            </p>
            <ul className="mt-5 space-y-2">
              {[
                "Permanent and contract",
                "Engineer-led shortlisting",
                "All major UK regions",
                "SC / DV clearance available",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/uk-recruitment"
              className="mt-7 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white transition-all hover:border-white/30 hover:bg-white/[0.08]"
            >
              UK Recruitment
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        </div>
      </Section>

      {/* ============ 6. WHY OSCABE ============ */}
      <Section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Why OSCABE
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-gray-400">
          Six reasons UK engineering teams choose the OSCABE portal over traditional recruitment.
        </p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {WHY_OSCABE.map((point) => (
            <li
              key={point}
              className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
            >
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              <span className="text-sm text-gray-300">{point}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ============ 7. SPECIALISMS PREVIEW ============ */}
      <Section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Specialisms
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-gray-400">
          Four domains where we have the deepest bench.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SPECIALISMS.map((s) => (
            <article
              key={s.title}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/[0.15] hover:bg-white/[0.04]"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: `${s.color}20` }}
              >
                <s.icon className="h-5 w-5" style={{ color: s.color }} />
              </div>
              <h3 className="mt-3 text-base font-bold text-white">{s.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-400">{s.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/specialisms"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#00D4FF] transition-colors hover:text-white"
          >
            View all specialisms
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </Section>

      {/* ============ 8. TESTIMONIALS (PLACEHOLDERS) ============ */}
      <Section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Trusted by Engineering Teams Across the UK
        </h2>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIAL_PLACEHOLDERS.map((t, i) => (
            <article
              key={i}
              className="flex h-full flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
            >
              <Quote className="h-5 w-5 text-[#4540DB]/60" />
              <p className="mt-3 flex-1 text-sm italic leading-relaxed text-gray-400">
                [Testimonial to be added]
              </p>
              <div className="mt-4 border-t border-white/[0.06] pt-3">
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-gray-500">{t.company}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* ============ 9. AWARDS ============ */}
      <Section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <AwardsBanner />
      </Section>

      {/* ============ 10. FOOTER CTA BANNER ============ */}
      <Section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#4540DB]/15 to-[#00D4FF]/10 px-8 py-14 text-center sm:px-16 sm:py-16">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Start with a 20-minute conversation
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-gray-400">
            Tell us your engineering challenge. We will match you with the right engineer in 72 hours.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/engineers"
              className="inline-flex items-center gap-2 rounded-xl bg-[#4540DB] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#4540DB]/30 transition-all hover:scale-105 hover:bg-[#3733B0]"
            >
              Browse Engineers
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              Book a Call
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
