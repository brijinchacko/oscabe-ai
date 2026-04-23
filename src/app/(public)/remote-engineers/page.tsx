"use client";

import { useState, useEffect, useRef, type RefObject, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Shield,
  Users,
  Globe,
  Clock,
  FileCheck,
  XCircle,
  Building2,
  Cpu,
  Brain,
  Zap,
  Send,
  Minus,
  Plus,
} from "lucide-react";

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
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const [ref, visible] = useInView(0.1);
  return (
    <section
      ref={ref}
      id={id}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
    >
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const SAVINGS_DATA = [
  { role: "PLC Engineer", ukSalary: 50000, remoteCost: 35000, available: true },
  { role: "SCADA Engineer", ukSalary: 55000, remoteCost: 38500, available: true },
  { role: "Controls Design Engineer", ukSalary: 48000, remoteCost: 33600, available: true },
  { role: "ML Engineer", ukSalary: 70000, remoteCost: 49000, available: true },
  { role: "Data Scientist", ukSalary: 65000, remoteCost: 45500, available: true },
  { role: "Computer Vision Engineer", ukSalary: 65000, remoteCost: 45500, available: true },
  { role: "IoT Engineer", ukSalary: 55000, remoteCost: 38500, available: true },
  { role: "Digital Twin Developer", ukSalary: 60000, remoteCost: 42000, available: true },
  { role: "Robotics AI Engineer", ukSalary: 70000, remoteCost: 49000, available: true },
  { role: "NLP Engineer", ukSalary: 65000, remoteCost: 45500, available: true },
  { role: "MLOps Engineer", ukSalary: 60000, remoteCost: 42000, available: true },
  { role: "Automation Architect", ukSalary: 75000, remoteCost: 52500, available: true },
];

const STEPS = [
  {
    step: 1,
    title: "Tell Us Your Need",
    description:
      "Define role requirements, skills, experience level.",
    color: "#4540DB",
  },
  {
    step: 2,
    title: "We Source & Screen",
    description:
      "Chartered Engineer verification on real platforms (Siemens, AB, TensorFlow etc.)",
    color: "#00D4FF",
  },
  {
    step: 3,
    title: "You Interview & Select",
    description:
      "Meet shortlisted engineers via video, you choose who to hire.",
    color: "#8B5CF6",
  },
  {
    step: 4,
    title: "Engineer Starts Remotely",
    description:
      "Onboarded, equipped, and managed. Monthly billing, minimum 3-month contract.",
    color: "#22C55E",
  },
];

const AUTOMATION_REMOTE = [
  "PLC Programming",
  "SCADA Development",
  "Control System Design",
  "DCS Programming",
  "EPLAN/AutoCAD Design",
  "Digital Twin Development",
];

const AI_REMOTE = [
  "ML Engineering",
  "Data Science",
  "Computer Vision",
  "NLP",
  "IoT Development",
  "MLOps",
];

const NOT_REMOTE = [
  "Commissioning",
  "Field Service",
  "Panel Wiring",
  "On-Site Installation",
];

const BENEFITS = [
  {
    icon: Shield,
    title: "Chartered Engineer-Led Verification",
    description: "Same screening as UK candidates.",
    color: "#4540DB",
  },
  {
    icon: Users,
    title: "Wartens India Talent Pipeline",
    description: "Direct access via our India office.",
    color: "#00D4FF",
  },
  {
    icon: Cpu,
    title: "Pre-Screened on Real Platforms",
    description: "Tested on Siemens TIA Portal, Studio 5000, TensorFlow, etc.",
    color: "#8B5CF6",
  },
  {
    icon: Clock,
    title: "UK Morning Overlap",
    description: "India is 4.5-5.5hrs ahead, 4+ hours daily overlap.",
    color: "#22C55E",
  },
  {
    icon: FileCheck,
    title: "Full Compliance Handled",
    description: "Employment via Wartens India, NDA, IP protection, GDPR.",
    color: "#F59E0B",
  },
  {
    icon: Zap,
    title: "3-Month Minimum",
    description: "No long-term contracts, monthly billing, 30-day notice.",
    color: "#EF4444",
  },
];

const FAQ_DATA = [
  {
    q: "How does the time zone difference work?",
    a: "India is 4.5-5.5 hours ahead of the UK, providing 4+ hours of morning overlap for real-time collaboration. The rest of the day works asynchronously with updates, code commits, and documentation shared before your next morning.",
  },
  {
    q: "What platforms can remote engineers work on?",
    a: "Siemens TIA Portal, Allen-Bradley Studio 5000, Schneider EcoStruxure, and more via simulation environments and remote access. AI engineers work with TensorFlow, PyTorch, cloud ML platforms, and standard development tools.",
  },
  {
    q: "How is quality verified?",
    a: "Every remote engineer undergoes the same Chartered Engineer-led screening process as our UK candidates. They are tested on real platforms with practical assessments, not just CV reviews.",
  },
  {
    q: "What about IP and confidentiality?",
    a: "All engineers sign comprehensive NDAs and IP assignment agreements. We include a GDPR Data Processing Agreement as standard. Your intellectual property is fully protected.",
  },
  {
    q: "Can we interview candidates before hiring?",
    a: "Absolutely. You receive a shortlist of pre-screened candidates and interview them via video. You select who joins your team — we never assign engineers without your approval.",
  },
  {
    q: "What is the minimum commitment?",
    a: "The minimum contract is 3 months. After the initial period, billing continues monthly with 30 days notice to cancel. This ensures the engineer has enough time to onboard and deliver value for your team.",
  },
  {
    q: "How quickly can we get an engineer?",
    a: "Typically 2-3 weeks from initial enquiry to engineer start date, depending on the specialism required.",
  },
  {
    q: "What happens if the engineer doesn't work out?",
    a: "We offer a free replacement within 30 days. Our screening process minimises this risk, but we stand behind our placements.",
  },
];

const ROLE_OPTIONS = [
  "PLC Engineer",
  "SCADA Engineer",
  "Controls Engineer",
  "ML Engineer",
  "Data Scientist",
  "IoT Engineer",
  "Digital Twin Developer",
  "Other",
];

const TIMELINE_OPTIONS = [
  "ASAP",
  "Within 1 month",
  "Within 3 months",
  "Planning ahead",
];

/* ------------------------------------------------------------------ */
/*  HELPER                                                             */
/* ------------------------------------------------------------------ */
function formatGBP(n: number) {
  return `\u00A3${n.toLocaleString("en-GB")}`;
}

/* ================================================================== */
/*  PAGE                                                               */
/* ================================================================== */
export default function RemoteEngineersPage() {
  const [heroRef, heroVisible] = useInView(0.05);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    roleType: "",
    engineersNeeded: "1",
    timeline: "",
    notes: "",
    gdprConsent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.gdprConsent) {
      setFormError("Please consent to data processing to submit your enquiry.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/remote-engineers/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#010118]">
      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section ref={heroRef} className="relative overflow-x-clip">
        <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#4540DB]/10 blur-[150px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#00D4FF]/8 blur-[150px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div
            className={`mx-auto max-w-4xl text-center transition-all duration-700 ease-out ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/40 bg-[#00D4FF]/10 px-4 py-1.5 text-xs font-medium tracking-wide text-[#00D4FF]">
              <Globe className="h-3.5 w-3.5" />
              New Service: Remote Engineers from India
            </span>

            <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Remote Automation & AI Engineers{" "}
              <span className="bg-gradient-to-r from-[#22C55E] to-[#00D4FF] bg-clip-text text-transparent">
                — Save 30%
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg">
              Access Chartered Engineer-verified automation and AI talent from
              India. Same quality standards, 30% lower cost. You interview
              and select — we handle everything else.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#enquiry"
                className="inline-flex items-center gap-2 rounded-xl bg-[#4540DB] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#4540DB]/25 transition-all hover:bg-[#4540DB]/90 hover:scale-105"
              >
                Get a Free Consultation
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
              >
                See Pricing
              </a>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {[
                { icon: Shield, label: "Chartered Engineer Verified" },
                { icon: Building2, label: "Wartens India Delivery" },
                { icon: FileCheck, label: "GDPR Compliant" },
                { icon: CheckCircle, label: "ISO 9001:2015" },
              ].map((badge) => (
                <span
                  key={badge.label}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-gray-400"
                >
                  <badge.icon className="h-3.5 w-3.5 text-[#22C55E]" />
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SAVINGS COMPARISON TABLE                                     */}
      {/* ============================================================ */}
      <Section id="pricing" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Savings Comparison
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-400">
              See how much you save with pre-screened remote engineers vs UK
              market rates.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SAVINGS_DATA.map((item) => {
              const saving = item.ukSalary - item.remoteCost;
              const pct = Math.round((saving / item.ukSalary) * 100);
              return (
                <div
                  key={item.role}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.06]"
                  style={{ backdropFilter: "blur(12px)" }}
                >
                  <h3 className="text-sm font-semibold text-white">
                    {item.role}
                  </h3>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">UK Salary</span>
                      <span className="text-gray-300">
                        {formatGBP(item.ukSalary)}/yr
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Remote Cost</span>
                      <span className="text-[#00D4FF]">
                        {formatGBP(item.remoteCost)}/yr
                      </span>
                    </div>
                    <div className="my-2 h-px bg-white/[0.06]" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-400">
                        You Save
                      </span>
                      <span className="text-lg font-bold text-[#22C55E]">
                        {formatGBP(saving)}
                      </span>
                    </div>
                    <div className="text-right text-xs text-[#22C55E]/70">
                      {pct}% saving
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  HOW IT WORKS                                                 */}
      {/* ============================================================ */}
      <Section className="py-20 sm:py-24 border-y border-white/[0.04]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-400">
              From enquiry to working engineer in 2-3 weeks.
            </p>
          </div>

          <div className="relative mt-16">
            <div
              className="absolute top-12 left-[12.5%] right-[12.5%] hidden h-[2px] lg:block"
              style={{
                background:
                  "linear-gradient(90deg, #4540DB, #00D4FF, #8B5CF6, #22C55E)",
              }}
            />

            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((item) => (
                <div
                  key={item.step}
                  className="relative flex flex-col items-center text-center"
                >
                  <div
                    className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg"
                    style={{
                      background: item.color,
                      boxShadow: `0 0 30px ${item.color}30`,
                    }}
                  >
                    {item.step}
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-gray-500">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  ROLES THAT WORK REMOTELY                                    */}
      {/* ============================================================ */}
      <Section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Roles That Work Remotely
            </h2>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            {/* Automation column */}
            <div className="rounded-2xl border border-[#4540DB]/20 bg-white/[0.02] p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4540DB]/15">
                  <Cpu className="h-5 w-5 text-[#4540DB]" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Automation
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {AUTOMATION_REMOTE.map((role) => (
                  <div
                    key={role}
                    className="flex items-center gap-2 text-sm text-gray-400"
                  >
                    <CheckCircle className="h-3.5 w-3.5 shrink-0 text-[#4540DB]" />
                    {role}
                  </div>
                ))}
              </div>
            </div>

            {/* AI / ML column */}
            <div className="rounded-2xl border border-[#00D4FF]/20 bg-white/[0.02] p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00D4FF]/15">
                  <Brain className="h-5 w-5 text-[#00D4FF]" />
                </div>
                <h3 className="text-lg font-semibold text-white">AI / ML</h3>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {AI_REMOTE.map((role) => (
                  <div
                    key={role}
                    className="flex items-center gap-2 text-sm text-gray-400"
                  >
                    <CheckCircle className="h-3.5 w-3.5 shrink-0 text-[#00D4FF]" />
                    {role}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Not suitable for remote */}
          <div className="mt-8 rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-4">
            <p className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <XCircle className="h-3.5 w-3.5 text-red-400/60" />
              <span className="font-medium text-gray-400">
                Not suitable for remote:
              </span>
              {NOT_REMOTE.map((item, i) => (
                <span key={item}>
                  {item}
                  {i < NOT_REMOTE.length - 1 ? "," : ""}
                </span>
              ))}
            </p>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  WHY OSCABE REMOTE ENGINEERS                                  */}
      {/* ============================================================ */}
      <Section className="py-20 sm:py-24 border-y border-white/[0.04]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Why OSCABE Remote Engineers
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: `${b.color}18` }}
                >
                  <b.icon className="h-6 w-6" style={{ color: b.color }} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  SERVICE MODEL                                                */}
      {/* ============================================================ */}
      <Section className="py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Service Model
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-400">
              A simple, transparent structure. No hidden costs.
            </p>
          </div>

          <div className="mt-14">
            {/* Visual flow */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Your Company */}
              <div className="rounded-2xl border border-[#4540DB]/30 bg-[#4540DB]/[0.06] p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#4540DB]/20">
                  <Building2 className="h-7 w-7 text-[#4540DB]" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">
                  Your Company (UK)
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  Signs service agreement with OSCABE UK. Monthly fee includes
                  everything.
                </p>
              </div>

              {/* OSCABE */}
              <div className="rounded-2xl border border-[#00D4FF]/30 bg-[#00D4FF]/[0.06] p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#00D4FF]/20">
                  <Shield className="h-7 w-7 text-[#00D4FF]" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">
                  OSCABE
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  Handles sourcing, screening, equipment, payroll, and
                  compliance.
                </p>
              </div>

              {/* Engineer */}
              <div className="rounded-2xl border border-[#22C55E]/30 bg-[#22C55E]/[0.06] p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#22C55E]/20">
                  <Users className="h-7 w-7 text-[#22C55E]" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">
                  Remote Engineer
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  Employed by Wartens India, works full-time for your team.
                </p>
              </div>
            </div>

            {/* Arrows between cards on desktop */}
            <div className="mt-6 hidden items-center justify-center gap-2 text-xs text-gray-500 md:flex">
              <span>Service Agreement</span>
              <ChevronRight className="h-4 w-4 text-[#4540DB]" />
              <span>Sourcing + Screening + Compliance</span>
              <ChevronRight className="h-4 w-4 text-[#00D4FF]" />
              <span>Full-Time Dedicated Engineer</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  FAQ                                                          */}
      {/* ============================================================ */}
      <Section className="py-20 sm:py-24 border-y border-white/[0.04]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-14 space-y-3">
            {FAQ_DATA.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-xl border transition-all ${
                    isOpen
                      ? "border-[#4540DB]/30 bg-white/[0.04]"
                      : "border-white/[0.06] bg-white/[0.02]"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left"
                  >
                    <span className="text-sm font-medium text-white pr-4">
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <Minus className="h-4 w-4 shrink-0 text-[#00D4FF]" />
                    ) : (
                      <Plus className="h-4 w-4 shrink-0 text-gray-500" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4">
                      <p className="text-sm leading-relaxed text-gray-400">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  ENQUIRY FORM                                                 */}
      {/* ============================================================ */}
      <Section id="enquiry" className="py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Get a Free Consultation
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-gray-400">
              Tell us what you need and we will get back to you within 24 hours
              with a tailored proposal.
            </p>
          </div>

          {submitted ? (
            <div className="mt-12 rounded-2xl border border-[#22C55E]/30 bg-[#22C55E]/[0.06] p-10 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-[#22C55E]" />
              <h3 className="mt-4 text-xl font-semibold text-white">
                Enquiry Submitted
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Thank you! We will be in touch within 24 hours with a tailored
                proposal.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-12 space-y-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm"
            >
              {/* Company + Contact */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">
                    Company Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-[#4540DB]/60 focus:bg-white/[0.06]"
                    placeholder="Acme Engineering Ltd"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">
                    Contact Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.contactName}
                    onChange={(e) =>
                      setFormData({ ...formData, contactName: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-[#4540DB]/60 focus:bg-white/[0.06]"
                    placeholder="John Smith"
                  />
                </div>
              </div>

              {/* Email + Phone */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">
                    Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-[#4540DB]/60 focus:bg-white/[0.06]"
                    placeholder="john@acme.com"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-[#4540DB]/60 focus:bg-white/[0.06]"
                    placeholder="+44 7000 000000"
                  />
                </div>
              </div>

              {/* Role Type + Engineers Needed */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">
                    Role Type *
                  </label>
                  <select
                    required
                    value={formData.roleType}
                    onChange={(e) =>
                      setFormData({ ...formData, roleType: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#4540DB]/60 focus:bg-white/[0.06]"
                  >
                    <option value="" disabled className="bg-[#010118]">
                      Select a role
                    </option>
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r} className="bg-[#010118]">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">
                    Number of Engineers Needed
                  </label>
                  <select
                    value={formData.engineersNeeded}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        engineersNeeded: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#4540DB]/60 focus:bg-white/[0.06]"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option
                        key={n}
                        value={String(n)}
                        className="bg-[#010118]"
                      >
                        {n}
                      </option>
                    ))}
                    <option value="10+" className="bg-[#010118]">
                      10+
                    </option>
                  </select>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">
                  Start Timeline *
                </label>
                <select
                  required
                  value={formData.timeline}
                  onChange={(e) =>
                    setFormData({ ...formData, timeline: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#4540DB]/60 focus:bg-white/[0.06]"
                >
                  <option value="" disabled className="bg-[#010118]">
                    Select timeline
                  </option>
                  {TIMELINE_OPTIONS.map((t) => (
                    <option key={t} value={t} className="bg-[#010118]">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">
                  Additional Notes
                </label>
                <textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-[#4540DB]/60 focus:bg-white/[0.06]"
                  placeholder="Specific skills, platforms, or experience requirements..."
                />
              </div>

              {/* GDPR Consent */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.gdprConsent}
                  onChange={(e) =>
                    setFormData({ ...formData, gdprConsent: e.target.checked })
                  }
                  className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-white/[0.04] accent-[#4540DB]"
                />
                <span className="text-xs leading-relaxed text-gray-400">
                  I consent to OSCABE processing my personal data for the
                  purpose of this enquiry, in accordance with the{" "}
                  <Link
                    href="/privacy"
                    className="text-[#00D4FF] underline hover:text-white"
                  >
                    Privacy Policy
                  </Link>
                  . I understand I can withdraw consent at any time.
                </span>
              </label>

              {formError && (
                <p className="text-sm text-red-400">{formError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={`flex w-full items-center justify-center gap-2 rounded-lg py-3.5 text-sm font-semibold text-white transition-all ${
                  submitting
                    ? "bg-[#4540DB]/50 cursor-not-allowed"
                    : "bg-[#4540DB] shadow-lg shadow-[#4540DB]/30 hover:bg-[#3632b5]"
                }`}
              >
                {submitting ? (
                  "Submitting..."
                ) : (
                  <>
                    Submit Enquiry
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  FINAL CTA                                                    */}
      {/* ============================================================ */}
      <Section className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] px-8 py-16 backdrop-blur-sm sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to save 30% on engineering costs?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
              Get started today with a free consultation. No obligations.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#enquiry"
                className="inline-flex items-center gap-2 rounded-xl bg-[#4540DB] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-[#4540DB]/25 transition-all hover:bg-[#4540DB]/90 hover:scale-105"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
              >
                Book a Call
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
