"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Wrench,
  HardHat,
  Cable,
  ClipboardCheck,
  Cog,
  Users,
  Briefcase,
  Cpu,
  Phone,
  Award,
} from "lucide-react";
import { AwardsBanner } from "@/components/shared/awards-banner";

const WHEN_UK = [
  { title: "Commissioning", description: "On-site commissioning that requires physical presence at the plant or factory.", icon: Wrench },
  { title: "Field Service", description: "Breakdown response, maintenance visits, and on-site support contracts.", icon: HardHat },
  { title: "Panel Wiring", description: "Electrical panel build, wiring, and testing in your workshop or on-site.", icon: Cable },
  { title: "Site Acceptance Testing", description: "FAT/SAT procedures that must be witnessed in person by the client.", icon: ClipboardCheck },
  { title: "On-Site Installation", description: "Physical installation of control systems, instrumentation, and equipment.", icon: Cog },
];

const HOW_IT_WORKS = [
  { step: 1, title: "Brief Us", description: "Tell us the role, location, tech stack, and timeline. We will confirm if UK recruitment is the right fit.", color: "#4540DB" },
  { step: 2, title: "We Source & Screen", description: "Our team identifies UK-based candidates with verified experience on the exact platforms you use.", color: "#00D4FF" },
  { step: 3, title: "72-Hour Shortlist", description: "You receive a curated shortlist of pre-qualified UK candidates, ready for interview.", color: "#8B5CF6" },
  { step: 4, title: "Hire & Onboard", description: "We manage interviews, offers, and onboarding support. You pay only on successful placement.", color: "#22C55E" },
];

const ROLES_BUSINESS = [
  "Operations Manager",
  "Project Manager",
  "Business Development Manager",
  "Procurement Specialist",
  "Quality Manager",
  "Health & Safety Manager",
];

const ROLES_TECHNOLOGY = [
  "IT/OT Network Engineer",
  "Cybersecurity Specialist",
  "SCADA Administrator",
  "MES/MOM Consultant",
  "IoT Platform Engineer",
  "Data Analyst",
];

const ROLES_ENGINEERING = [
  "PLC Programmer",
  "Controls Engineer",
  "Commissioning Engineer",
  "Field Service Engineer",
  "Panel Design Engineer",
  "Electrical Design Engineer",
  "Safety Engineer (SIL)",
  "Robotics Engineer",
  "EC&I Engineer",
  "DCS Engineer",
];

export default function UkRecruitmentPage() {
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

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#4540DB]/40 bg-[#4540DB]/10 px-4 py-1.5 text-xs font-medium tracking-wide text-[#4540DB]">
              <Users className="h-3.5 w-3.5" />
              UK-Based Recruitment
            </span>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              UK-Based Recruitment for Roles That{" "}
              <span className="bg-gradient-to-r from-[#4540DB] to-[#00D4FF] bg-clip-text text-transparent">
                Cannot Go Remote
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base text-gray-400 sm:text-lg">
              Commissioning engineers, field service, panel wiring, on-site project leads. Pre-qualified UK candidates delivered in 72 hours, no upfront fees.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/post-a-role"
                className="inline-flex items-center gap-2 rounded-xl bg-[#4540DB] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#4540DB]/25 transition-all hover:bg-[#4540DB]/90 hover:scale-105"
              >
                Post a Role
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
              >
                See Pricing Models
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* When to use UK Recruitment */}
      <section className="border-y border-white/[0.06] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              When to Use UK Recruitment
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-400">
              Some roles require boots on the ground. These are the situations where UK-based recruitment is the right choice.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHEN_UK.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.06]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4540DB]/15">
                  <item.icon className="h-6 w-6 text-[#4540DB]" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/remote-engineers"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#00D4FF] transition-colors hover:text-white"
            >
              Need remote? See our Remote Engineers service
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-500">
              Simple, transparent, and fast.
            </p>
          </div>

          <div className="relative mt-16">
            <div className="absolute top-12 left-[12.5%] right-[12.5%] hidden h-[2px] lg:block" style={{ background: "linear-gradient(90deg, #4540DB, #00D4FF, #8B5CF6, #22C55E)" }} />

            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {HOW_IT_WORKS.map((item) => (
                <div key={item.step} className="relative flex flex-col items-center text-center">
                  <div
                    className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg"
                    style={{ background: item.color, boxShadow: `0 0 30px ${item.color}30` }}
                  >
                    {item.step}
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-gray-500">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Roles We Fill */}
      <section className="border-y border-white/[0.06] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Roles We Fill
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-400">
              Across business operations, technology, and engineering.
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {/* Business & Operations */}
            <div className="rounded-2xl border border-[#22C55E]/20 bg-white/[0.02] p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22C55E]/15">
                  <Briefcase className="h-5 w-5 text-[#22C55E]" />
                </div>
                <h3 className="text-lg font-bold text-white">Business & Operations</h3>
              </div>
              <ul className="mt-6 space-y-3">
                {ROLES_BUSINESS.map((role) => (
                  <li key={role} className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle className="h-4 w-4 shrink-0 text-[#22C55E]" />
                    {role}
                  </li>
                ))}
              </ul>
            </div>

            {/* Technology */}
            <div className="rounded-2xl border border-[#00D4FF]/20 bg-white/[0.02] p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00D4FF]/15">
                  <Cpu className="h-5 w-5 text-[#00D4FF]" />
                </div>
                <h3 className="text-lg font-bold text-white">Technology</h3>
              </div>
              <ul className="mt-6 space-y-3">
                {ROLES_TECHNOLOGY.map((role) => (
                  <li key={role} className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle className="h-4 w-4 shrink-0 text-[#00D4FF]" />
                    {role}
                  </li>
                ))}
              </ul>
            </div>

            {/* Engineering */}
            <div className="rounded-2xl border border-[#4540DB]/20 bg-white/[0.02] p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4540DB]/15">
                  <Wrench className="h-5 w-5 text-[#4540DB]" />
                </div>
                <h3 className="text-lg font-bold text-white">Engineering</h3>
              </div>
              <ul className="mt-6 space-y-3">
                {ROLES_ENGINEERING.map((role) => (
                  <li key={role} className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle className="h-4 w-4 shrink-0 text-[#4540DB]" />
                    {role}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Models */}
      <section id="pricing" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Pricing Models
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-400">
              Flexible pricing to suit your hiring needs. No hidden fees.
            </p>
          </div>

          <div className="mt-14 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="border-b border-white/[0.1]">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Model</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Fee</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Best For</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Upfront Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/[0.06] transition-colors hover:bg-white/[0.03]">
                  <td className="px-6 py-5">
                    <span className="text-sm font-semibold text-white">Contingency</span>
                  </td>
                  <td className="px-6 py-5 text-sm text-[#00D4FF]">12-18% of salary</td>
                  <td className="px-6 py-5 text-sm text-gray-400">Standard permanent hires</td>
                  <td className="px-6 py-5 text-sm text-[#22C55E]">None</td>
                </tr>
                <tr className="border-b border-white/[0.06] transition-colors hover:bg-white/[0.03]">
                  <td className="px-6 py-5">
                    <span className="text-sm font-semibold text-white">Flat-Fee</span>
                  </td>
                  <td className="px-6 py-5 text-sm text-[#00D4FF]">{"\u00A3"}1,500 - {"\u00A3"}4,000</td>
                  <td className="px-6 py-5 text-sm text-gray-400">Volume hiring, junior-mid roles</td>
                  <td className="px-6 py-5 text-sm text-[#22C55E]">None</td>
                </tr>
                <tr className="border-b border-white/[0.06] transition-colors hover:bg-white/[0.03]">
                  <td className="px-6 py-5">
                    <span className="text-sm font-semibold text-white">Subscription</span>
                  </td>
                  <td className="px-6 py-5 text-sm text-[#00D4FF]">From {"\u00A3"}999/mo</td>
                  <td className="px-6 py-5 text-sm text-gray-400">Ongoing hiring needs</td>
                  <td className="px-6 py-5 text-sm text-yellow-400">{"\u00A3"}999/mo retainer</td>
                </tr>
                <tr className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-6 py-5">
                    <span className="text-sm font-semibold text-white">Hybrid</span>
                  </td>
                  <td className="px-6 py-5 text-sm text-[#00D4FF]">{"\u00A3"}999/mo + 8%</td>
                  <td className="px-6 py-5 text-sm text-gray-400">Strategic partnership, high volume</td>
                  <td className="px-6 py-5 text-sm text-yellow-400">{"\u00A3"}999/mo retainer</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Awards */}
      <AwardsBanner />

      {/* CTA */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] px-8 py-16 backdrop-blur-sm sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Post a role or book a call
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
              Get pre-qualified UK candidates in 72 hours. No upfront fees on contingency.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/post-a-role"
                className="inline-flex items-center gap-2 rounded-xl bg-[#4540DB] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-[#4540DB]/25 transition-all hover:bg-[#4540DB]/90 hover:scale-105"
              >
                Post a Role
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
              >
                <Phone className="h-4 w-4" />
                Book a Call
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
