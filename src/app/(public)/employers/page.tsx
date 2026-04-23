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
  Cpu,
  Brain,
  MessageSquare,
  Bot,
  Eye,
  Cog,
  Wrench,
  Shield,
  BarChart3,
  Network,
  Database,
  Server,
  Settings,
} from "lucide-react";
import { AwardsBanner } from "@/components/shared/awards-banner";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Engineer-Led Screening",
    description:
      "Every candidate is technically assessed by a Senior Engineer who understands PLC, SCADA, controls, robotics, and AI tech stacks. Not just CV forwarding.",
  },
  {
    icon: Clock,
    title: "72-Hour Shortlists",
    description:
      "From brief to shortlist in 72 hours. Our 6,000+ pre-screened talent pool means you get quality automation and AI candidates faster than any agency.",
  },
  {
    icon: PoundSterling,
    title: "No Upfront Fees",
    description:
      "Zero risk to get started. You only pay when we deliver results, with flexible models to suit your hiring volume and budget.",
  },
  {
    icon: Sparkles,
    title: "Flexible Pricing",
    description:
      "From contingency to subscription models, choose a pricing structure that works for your business. No hidden costs, ever.",
  },
  {
    icon: Target,
    title: "Deep Automation & AI Expertise",
    description:
      "13+ years of industrial automation expertise, now expanded into AI/ML recruitment. We speak the language of Siemens, Rockwell, TensorFlow, and PyTorch.",
  },
];

const AUTOMATION_ROLES = [
  "PLC Programmer",
  "SCADA Engineer",
  "Controls Engineer",
  "Automation Engineer",
  "Robotics Engineer",
  "Commissioning Engineer",
  "EC&I Engineer",
  "DCS Engineer",
  "Safety Engineer (SIL)",
  "Panel Design Engineer",
  "Field Service Engineer",
  "BMS Engineer",
];

const AI_ROLES = [
  "ML Engineer",
  "AI Engineer",
  "Data Scientist",
  "Computer Vision Engineer",
  "NLP Engineer",
  "MLOps Engineer",
  "AI Research Scientist",
  "Robotics AI Engineer",
  "IoT Engineer",
  "Digital Twin Engineer",
  "Data Engineer",
  "Automation Architect",
];

const STEPS = [
  {
    step: 1,
    icon: MessageSquare,
    title: "Understand Your Requirement",
    description:
      "We learn about the role, your tech stack, must-have skills, and timeline - whether it is Siemens TIA Portal or PyTorch.",
  },
  {
    step: 2,
    icon: FileSearch,
    title: "Source & Pre-Screen",
    description:
      "We search our 6,000+ automation and AI talent pool, then technically screen every candidate with Technical verification.",
  },
  {
    step: 3,
    icon: Send,
    title: "Deliver Shortlist in 72 Hours",
    description:
      "You receive a curated shortlist of technically verified professionals, complete with screening notes and availability.",
  },
  {
    step: 4,
    icon: Users,
    title: "Support Through Hiring",
    description:
      "We coordinate interviews, manage offers, and support onboarding so you stay focused on your projects.",
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
      "Technical screening included",
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
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#4540DB]/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-[#4540DB]/15 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Hire Verified Automation & AI Engineers
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 lg:mx-0">
                Senior Engineer-screened candidates across PLC, SCADA, Controls, Robotics, Machine Learning, and Computer Vision - delivered in 72 hours, with no upfront fees.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                <Link
                  href="/post-a-role"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#4540DB] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#4540DB]/25 transition-all hover:bg-[#4540DB]/90 hover:scale-105"
                >
                  Submit a Role
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  View Pricing
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
                    <Image
                      src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop"
                      alt="Industrial automation engineering"
                      width={600}
                      height={400}
                      className="h-48 w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
                    <Image
                      src="https://images.unsplash.com/photo-1555255707-c07966088b7b?w=600&h=400&fit=crop"
                      alt="AI and machine learning development"
                      width={600}
                      height={400}
                      className="h-32 w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
                    <Image
                      src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&h=400&fit=crop"
                      alt="Robotics and automation"
                      width={600}
                      height={400}
                      className="h-32 w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
                    <Image
                      src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop"
                      alt="Control systems and SCADA"
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
      {/*  WHY OSCABE                                                   */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Why Employers Choose OSCABE
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-400">
              Built for hiring managers who need verified automation and AI engineers, not piles of unscreened CVs.
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
              From PLC programmers to AI research scientists, we recruit across the full spectrum of automation and intelligent systems.
            </p>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {/* Automation Roles */}
            <div className="rounded-2xl border border-[#4540DB]/20 bg-white/[0.02] p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4540DB]/15">
                  <Cpu className="h-5 w-5 text-[#4540DB]" />
                </div>
                <h3 className="text-lg font-semibold text-white">Industrial Automation</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {AUTOMATION_ROLES.map((role) => (
                  <div key={role} className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle className="h-3.5 w-3.5 shrink-0 text-[#4540DB]" />
                    {role}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Roles */}
            <div className="rounded-2xl border border-[#00D4FF]/20 bg-white/[0.02] p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00D4FF]/15">
                  <Brain className="h-5 w-5 text-[#00D4FF]" />
                </div>
                <h3 className="text-lg font-semibold text-white">AI & Intelligent Systems</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {AI_ROLES.map((role) => (
                  <div key={role} className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle className="h-3.5 w-3.5 shrink-0 text-[#00D4FF]" />
                    {role}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  HOW IT WORKS                                                 */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="hidden lg:block">
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.08]">
                <Image
                  src="https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=800&h=600&fit=crop"
                  alt="Automation engineers at work"
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
                      Technical verification at every stage
                    </p>
                  </div>
                </div>
              </div>
            </div>

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
              Flexible pricing that fits your hiring volume and budget. No hidden fees.
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
      {/*  REMOTE ENGINEERS CROSS-PROMO                                 */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[#00D4FF]/20 bg-[#00D4FF]/[0.04] p-8 sm:p-10">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-white sm:text-2xl">
                  Save 50%+ with Remote Engineers
                </h3>
                <p className="mt-2 max-w-lg text-sm text-gray-400">
                  Access pre-screened Indian automation and AI engineers from{" "}
                  <span className="font-semibold text-[#22C55E]">{"\u00A3"}22,000/year</span>.
                  Senior Engineer verified, GDPR compliant, monthly billing.
                </p>
              </div>
              <Link
                href="/remote-engineers"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#00D4FF] px-6 py-3 text-sm font-semibold text-[#010118] shadow-lg shadow-[#00D4FF]/20 transition-all hover:bg-[#00D4FF]/90 hover:scale-105"
              >
                Explore Remote Engineers
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
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
              Automation & AI Hiring for Industry 4.0
            </h2>
          </div>

          <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-4">
            <div className="hidden overflow-hidden rounded-2xl border border-white/[0.08] lg:block">
              <Image
                src="https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=600&h=800&fit=crop"
                alt="Automation engineering in factory"
                width={600}
                height={800}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-3 lg:col-span-3">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-red-400">
                  Challenge
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">
                  Manufacturing client implementing predictive maintenance needed 3 PLC programmers (Siemens) and 1 ML engineer within 2 weeks.
                </p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#00D4FF]">
                  Solution
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#00D4FF]" />
                    Technical screening
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#00D4FF]" />
                    AI-powered candidate matching
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#00D4FF]" />
                    Shortlist delivered in 48 hours
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
                      4 positions
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
            Ready to Hire Automation & AI Engineers?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
            Submit your requirement and receive a Engineer-verified shortlist of automation and AI candidates within 72 hours.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/post-a-role"
              className="inline-flex items-center gap-2 rounded-xl bg-[#4540DB] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-[#4540DB]/25 transition-all hover:bg-[#4540DB]/90 hover:scale-105"
            >
              Submit a Requirement
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              Book a Call
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
