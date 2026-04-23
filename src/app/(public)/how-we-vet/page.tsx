"use client";

import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Mic,
  Monitor,
  Languages,
  ShieldCheck,
  Phone,
} from "lucide-react";

const STEPS = [
  {
    step: 1,
    title: "Application & Self-Declaration",
    description: "Every candidate submits their CV along with a detailed platform questionnaire. We collect information about the specific tools, platforms, and protocols they have worked with, including version numbers and project context. This self-declaration forms the basis for all subsequent technical evaluation.",
    icon: FileText,
    color: "#4540DB",
  },
  {
    step: 2,
    title: "Technical Screen by",
    description: "A 60-minute structured technical interview conducted by one of our Senior Engineers. This is not a generic competency chat. We test real-world problem-solving on the exact platforms the candidate claims experience in: PLC logic, SCADA configuration, controls theory, AI/ML architecture, or whatever the specialism demands.",
    icon: Mic,
    color: "#00D4FF",
  },
  {
    step: 3,
    title: "Live Platform Test",
    description: "Candidates complete a timed practical task on the exact platform they will be working with. For a Siemens TIA Portal engineer, that means writing and debugging real PLC logic in TIA Portal. For an ML engineer, that means building and deploying a model. There is no shortcut here, and no way to fake it.",
    icon: Monitor,
    color: "#8B5CF6",
  },
  {
    step: 4,
    title: "English Proficiency",
    description: "All remote engineers must demonstrate IELTS-equivalent English proficiency with a minimum score of 7.0. We assess reading, writing, listening, and speaking. Clear communication is non-negotiable for remote collaboration with UK engineering teams.",
    icon: Languages,
    color: "#F59E0B",
  },
  {
    step: 5,
    title: "Final Approval",
    description: "Every candidate is signed off by a Senior Engineer before they enter our placement pool. This final review considers the full picture: technical skill, communication ability, cultural fit for UK engineering teams, and professional conduct. Only candidates who pass all five steps are available for client placement.",
    icon: ShieldCheck,
    color: "#22C55E",
  },
];

export default function HowWeVetPage() {
  return (
    <div className="bg-[#010118]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#4540DB]/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-[#00D4FF]/10 blur-[120px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#4540DB]/40 bg-[#4540DB]/10 px-4 py-1.5 text-xs font-medium tracking-wide text-[#4540DB]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Quality Guaranteed
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            How We Vet Engineers
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
            A 5-step process designed by Senior Engineers. No shortcuts, no CV forwarding, no guesswork.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 hidden h-full w-[2px] bg-gradient-to-b from-[#4540DB] via-[#00D4FF] to-[#22C55E] lg:block" />

            <div className="space-y-16">
              {STEPS.map((step) => (
                <div key={step.step} className="relative flex gap-8">
                  {/* Step number */}
                  <div
                    className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white shadow-lg"
                    style={{ background: step.color, boxShadow: `0 0 30px ${step.color}30` }}
                  >
                    {step.step}
                  </div>

                  {/* Content */}
                  <div className="flex-1 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ background: `${step.color}15` }}
                      >
                        <step.icon className="h-5 w-5" style={{ color: step.color }} />
                      </div>
                      <h3 className="text-xl font-bold text-white">{step.title}</h3>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] px-8 py-16 backdrop-blur-sm sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Want to see our engineers in action?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
              Book a call and we will walk you through the process and introduce you to available engineers.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-[#4540DB] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-[#4540DB]/25 transition-all hover:bg-[#4540DB]/90 hover:scale-105"
              >
                Book a Call
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/how-we-deliver"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
              >
                See How We Deliver
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
