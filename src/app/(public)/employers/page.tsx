"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  ArrowRight,
  CheckCircle,
  Send,
  Users,
  FileSearch,
  Target,
  ShieldCheck,
  PoundSterling,
  Sparkles,
  Briefcase,
  Code2,
  Cpu,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AwardsBanner } from "@/components/shared/awards-banner";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const BENEFITS = [
  {
    icon: Clock,
    title: "72-Hour Shortlists",
    description:
      "From brief to shortlist in 72 hours. Our pre-qualified talent pool means you get quality candidates faster than any traditional agency.",
  },
  {
    icon: PoundSterling,
    title: "No Upfront Fees",
    description:
      "Zero risk to get started. You only pay when we deliver results, with flexible models to suit your hiring volume and budget.",
  },
  {
    icon: ShieldCheck,
    title: "Pre-Screened Candidates",
    description:
      "Every candidate is technically assessed and validated before you see them. You receive qualified professionals, not just CVs.",
  },
  {
    icon: Sparkles,
    title: "Flexible Pricing",
    description:
      "From contingency to subscription models, choose a pricing structure that works for your business. No hidden costs, ever.",
  },
  {
    icon: Target,
    title: "Domain Expertise",
    description:
      "Our recruiters specialise across operations, technology, and engineering, so they understand the roles they are hiring for.",
  },
];

const ROLE_CATEGORIES = [
  {
    icon: Briefcase,
    title: "Business & Operations",
    color: "#4540DB",
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop",
    roles: [
      "Office & Admin",
      "Business Analysts",
      "Project Managers",
      "HR & People",
      "Finance & Procurement",
    ],
  },
  {
    icon: Code2,
    title: "Technology",
    color: "#00D4FF",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop",
    roles: [
      "Software Developers",
      "QA Engineers",
      "Data & AI Specialists",
      "DevOps & Cloud",
      "IT Support & Infrastructure",
    ],
  },
  {
    icon: Cpu,
    title: "Engineering",
    color: "#22C55E",
    image:
      "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=600&h=400&fit=crop",
    roles: [
      "Automation Engineers",
      "PLC / SCADA / Controls",
      "Electrical & Mechanical",
      "Design Engineers",
      "Commissioning Engineers",
    ],
  },
];

const STEPS = [
  {
    step: 1,
    icon: MessageSquare,
    title: "Understand Your Requirement",
    description:
      "We learn about the role, your team, must-have skills, and timeline so we target the right candidates from day one.",
  },
  {
    step: 2,
    icon: FileSearch,
    title: "Source & Pre-Screen",
    description:
      "We search our talent network and the wider market, then technically screen every candidate before they reach your desk.",
  },
  {
    step: 3,
    icon: Send,
    title: "Deliver Shortlist in 72 Hours",
    description:
      "You receive a curated shortlist of pre-qualified professionals, complete with screening notes and availability.",
  },
  {
    step: 4,
    icon: Users,
    title: "Support Through Hiring",
    description:
      "We coordinate interviews, manage offers, and support onboarding so you stay focused on your business.",
  },
];

const PRICING_MODELS = [
  {
    title: "Contingency",
    label: "Traditional",
    price: "12-18%",
    unit: "of salary",
    best: "Best for standard roles",
    popular: false,
    features: [
      "Pay only when you hire",
      "90-day replacement guarantee",
      "Full screening included",
    ],
  },
  {
    title: "Flat-Fee Shortlist",
    label: "Fixed Price",
    price: "\u00A31,500-\u00A34,000",
    unit: "per curated shortlist",
    best: "Best for specific needs",
    popular: true,
    features: [
      "Pre-screened candidate shortlists",
      "72-hour priority delivery",
      "Technical assessment included",
    ],
  },
  {
    title: "Subscription",
    label: "Ongoing Access",
    price: "From \u00A3999",
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
    price: "\u00A3999/mo + 8%",
    unit: "on hires",
    best: "Best for predictable hiring",
    popular: false,
    features: [
      "Lower total cost per hire",
      "Ongoing partnership model",
      "Strongest traction in 2026",
    ],
  },
];

const SECTOR_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop",
    alt: "Business meeting",
    label: "Operations",
  },
  {
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop",
    alt: "Team collaboration",
    label: "Technology",
  },
  {
    src: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=400&h=300&fit=crop",
    alt: "Engineering work",
    label: "Engineering",
  },
  {
    src: "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=300&fit=crop",
    alt: "Interview session",
    label: "Hiring",
  },
  {
    src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop",
    alt: "Office building",
    label: "Workplaces",
  },
];

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function EmployersPage() {
  return (
    <div className="bg-[#010118]">
      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
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

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left column - text */}
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Hire High-Performing Talent, Fast
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 lg:mx-0">
                Pre-qualified candidates across operations, technology, and
                engineering — delivered in 72 hours, with no upfront fees.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                <Link href="/post-a-role">
                  <Button
                    size="lg"
                    className="bg-[#4540DB] hover:bg-[#4540DB]/90 text-white px-8 transition-transform hover:scale-105"
                    style={{ boxShadow: "0 0 30px rgba(69,64,219,0.4)" }}
                  >
                    Submit a Role
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:text-white"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right column - image grid */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
                    <Image
                      src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop"
                      alt="Business meeting"
                      width={600}
                      height={400}
                      className="h-48 w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
                    <Image
                      src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=400&fit=crop"
                      alt="Office discussion"
                      width={600}
                      height={400}
                      className="h-32 w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
                    <Image
                      src="https://images.unsplash.com/photo-1542744173-8e7e91415657?w=600&h=400&fit=crop"
                      alt="Professional at work"
                      width={600}
                      height={400}
                      className="h-32 w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
                    <Image
                      src="https://images.unsplash.com/photo-1560472355-536de3962603?w=600&h=400&fit=crop"
                      alt="Interview session"
                      width={600}
                      height={400}
                      className="h-48 w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTOR IMAGE STRIP                                           */}
      {/* ============================================================ */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {SECTOR_IMAGES.map((img) => (
              <div key={img.label} className="group relative overflow-hidden rounded-xl border border-white/[0.08]">
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={400}
                  height={300}
                  className="h-36 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <span className="absolute bottom-3 left-3 text-sm font-semibold text-white">
                  {img.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  WHY OSCABE                                                   */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Why Employers Choose OSCABE
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-400">
              Built for hiring managers who need quality candidates, not piles of
              CVs. We combine domain expertise with speed.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]"
                style={{
                  transition:
                    "box-shadow 0.3s, border-color 0.3s, background 0.3s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 0 30px rgba(69,64,219,0.15)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#4540DB]/15">
                  <benefit.icon className="h-5 w-5 text-[#4540DB]" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  ROLES WE FILL                                                */}
      {/* ============================================================ */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Roles We Fill
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-400">
              From office operations to complex engineering, we recruit across
              three core disciplines.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ROLE_CATEGORIES.map((cat) => (
              <div
                key={cat.title}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]"
                style={{
                  transition:
                    "box-shadow 0.3s, border-color 0.3s, background 0.3s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px ${cat.color}15`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                {/* Category image */}
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    width={600}
                    height={400}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#010118] via-[#010118]/40 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-2">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${cat.color}30` }}
                    >
                      <cat.icon
                        className="h-4 w-4"
                        style={{ color: cat.color }}
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {cat.title}
                    </h3>
                  </div>
                </div>

                {/* Roles list */}
                <div className="p-6 pt-4">
                  <ul className="space-y-2">
                    {cat.roles.map((role) => (
                      <li
                        key={role}
                        className="flex items-center gap-2 text-sm text-gray-400"
                      >
                        <CheckCircle
                          className="h-3.5 w-3.5 shrink-0"
                          style={{ color: cat.color }}
                        />
                        {role}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  HOW IT WORKS                                                 */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left - image */}
            <div className="hidden lg:block">
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.08]">
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                  alt="Team working together"
                  width={800}
                  height={600}
                  className="h-[420px] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#010118]/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="rounded-xl border border-white/10 bg-[#010118]/80 backdrop-blur-sm p-4">
                    <p className="text-sm font-medium text-white">
                      From brief to hire in four simple steps
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Our streamlined process keeps things moving fast
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - steps */}
            <div>
              <h2 className="text-center text-2xl font-bold text-white sm:text-3xl lg:text-left">
                How It Works
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-center text-gray-400 lg:mx-0 lg:text-left">
                From brief to hire in four simple steps.
              </p>
              <div className="mt-10 space-y-8">
                {STEPS.map((step) => (
                  <div key={step.step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#4540DB] text-white"
                        style={{
                          boxShadow: "0 0 25px rgba(69,64,219,0.35)",
                        }}
                      >
                        <step.icon className="h-5 w-5" />
                      </div>
                      {step.step < 4 && (
                        <div className="mt-2 h-full w-px bg-gradient-to-b from-[#4540DB]/40 to-transparent" />
                      )}
                    </div>
                    <div className="pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#4540DB] text-[10px] font-bold text-white">
                          {step.step}
                        </span>
                        <h3 className="text-base font-semibold text-white">
                          {step.title}
                        </h3>
                      </div>
                      <p className="mt-1.5 text-sm text-gray-500">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  PRICING MODELS                                               */}
      {/* ============================================================ */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Choose Your Hiring Model
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-400">
              Flexible pricing that fits your hiring volume and budget. No hidden
              fees.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRICING_MODELS.map((model) => (
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
                <h3 className="mt-1 text-lg font-semibold text-white">
                  {model.title}
                </h3>
                <div className="mt-3">
                  <span className="text-2xl font-bold text-white">
                    {model.price}
                  </span>
                  <span className="ml-1 text-sm text-gray-500">
                    {model.unit}
                  </span>
                </div>
                <p className="mt-2 text-xs font-medium text-[#4540DB]">
                  {model.best}
                </p>
                <ul className="mt-4 flex-1 space-y-3">
                  {model.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-gray-300"
                    >
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

      {/* ============================================================ */}
      {/*  CASE STUDY                                                   */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#4540DB]/40 bg-[#4540DB]/10 px-4 py-1.5 text-xs font-medium tracking-wide text-[#4540DB]">
              Case Study
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Engineering / Technical Hiring
            </h2>
          </div>

          <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-4">
            {/* Case study image */}
            <div className="hidden overflow-hidden rounded-2xl border border-white/[0.08] lg:block">
              <Image
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=800&fit=crop"
                alt="Professional in office"
                width={600}
                height={800}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Case study cards */}
            <div className="grid gap-6 sm:grid-cols-3 lg:col-span-3">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-red-400">
                  Challenge
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">
                  Client needed urgent hiring support with limited time and budget
                  constraints for critical technical positions.
                </p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#00D4FF]">
                  Solution
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#00D4FF]" />
                    Rapid sourcing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#00D4FF]" />
                    Pre-screening & validation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#00D4FF]" />
                    Delivered shortlist in 3 days
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
                  Result
                </h3>
                <div className="mt-3 space-y-3">
                  <div>
                    <p className="text-2xl font-bold text-[#22C55E]">
                      2 positions
                    </p>
                    <p className="text-sm text-gray-400">Filled within 10 days</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#22C55E]">40%</p>
                    <p className="text-sm text-gray-400">
                      Reduction in hiring time
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Awards */}
      <AwardsBanner compact accentColor="#4540DB" />

      {/* ============================================================ */}
      {/*  FINAL CTA                                                    */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[#4540DB]/20 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to Hire?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
            Let&apos;s find your next great team member. Submit your requirement
            and receive a shortlist of pre-qualified candidates within 72 hours.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/post-a-role">
              <Button
                size="lg"
                className="bg-[#4540DB] text-white hover:bg-[#4540DB]/90 px-8 transition-transform hover:scale-105"
                style={{ boxShadow: "0 0 30px rgba(69,64,219,0.4)" }}
              >
                Submit a Requirement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="border border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:text-white"
              >
                Book a Call
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
