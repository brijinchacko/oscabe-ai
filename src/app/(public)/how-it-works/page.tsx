import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Search,
  Send,
  ShieldCheck,
  Rocket,
  Receipt,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How OSCABE Works | Remote Engineer Portal",
  description:
    "How OSCABE's remote engineer portal works: browse engineers, hire in 72 hours, pay monthly in GBP with no payroll complexity, no NI, no IR35 determination.",
  alternates: { canonical: "https://oscabe.com/how-it-works" },
};

const STEPS = [
  {
    icon: Search,
    title: "Browse the engineer pool",
    body: "Filter by skill, platform, seniority, and rate. Every profile is OSCABE-verified.",
  },
  {
    icon: Send,
    title: "Request an engineer",
    body: "Submit your requirement in under 2 minutes. Or jump straight to a specific engineer.",
  },
  {
    icon: ShieldCheck,
    title: "We match and confirm",
    body: "OSCABE handles paperwork, vetting alignment, and the IR35 / contracting position.",
  },
  {
    icon: Rocket,
    title: "Work begins",
    body: "Engineer joins your team within 72 hours of confirmation. UK working hours overlap built in.",
  },
  {
    icon: Receipt,
    title: "Monthly invoice",
    body: "One GBP invoice from OSCABE. No payroll. No NI. No pension auto-enrolment.",
  },
];

const COMPARISON = [
  { row: "Time to hire", uk: "6-10 weeks", portal: "72 hours" },
  { row: "Monthly cost (SCADA Engineer)", uk: "£8,000+ all-in", portal: "£5,500-6,500" },
  { row: "Payroll setup", uk: "Required", portal: "Not needed" },
  { row: "Employer NI contribution", uk: "13.8% on salary", portal: "Zero" },
  { row: "IR35 determination needed", uk: "Yes", portal: "No" },
  { row: "Holiday pay obligation", uk: "Yes", portal: "No" },
  { row: "Pension auto-enrolment", uk: "Yes", portal: "No" },
  { row: "Notice period risk", uk: "1-3 months", portal: "30 days" },
];

const ENGAGEMENT_TYPES = [
  {
    title: "Short-term Project",
    summary: "1 to 12 weeks of focused delivery",
    bullets: [
      "Day-rate or fixed-price",
      "Best for FAT, migrations, ad-hoc development",
      "Senior engineer assigned within 72 hours",
    ],
    rate: "from £280/day",
  },
  {
    title: "Long-term Retainer",
    summary: "3 to 24 months embedded in your team",
    bullets: [
      "Fixed monthly rate, fully managed",
      "Best for steady automation backlog",
      "30-day notice either side",
    ],
    rate: "from £4,800/month",
    featured: true,
  },
  {
    title: "Bench Access",
    summary: "On-demand capacity, named pool",
    bullets: [
      "Pre-arranged pool of 3-5 engineers",
      "Best for spiky workload, multiple sites",
      "Volume pricing applies",
    ],
    rate: "from £9,800/month",
  },
];

const FAQS = [
  {
    q: "Does IR35 apply?",
    a: "No. Engineers are based and taxed in India or the UAE. You pay OSCABE as a service provider, so there is no employment relationship and no IR35 determination required.",
  },
  {
    q: "What about data security?",
    a: "All engineers connect via VPN-only with MFA enforced. We provide a security policy template your IT team can adopt. GDPR-compliant and ISO 27001-aligned.",
  },
  {
    q: "Can I trial an engineer first?",
    a: "Yes. All new engagements include a 2-week trial period. If it's not working, we replace at no cost.",
  },
  {
    q: "What if I want to hire permanently?",
    a: "A conversion fee applies (15% of first-year equivalent salary). Contact us to discuss the specifics.",
  },
  {
    q: "What are the working hours?",
    a: "Engineers maintain a minimum 9am-2pm UK overlap. Many extend to 7am-4pm UK. All hours are agreed up front before the engagement starts.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="bg-[#010118]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#4540DB]/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-[#00D4FF]/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/40 bg-[#00D4FF]/10 px-4 py-1.5 text-xs font-medium tracking-wide text-[#33D9FF]">
            The Process
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            The OSCABE Remote Engineer Portal
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-400 sm:text-lg">
            Browse verified automation engineers. Hire in 72 hours. Pay monthly in GBP. Zero payroll complexity.
          </p>
        </div>
      </section>

      {/* Three-party diagram */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 sm:p-12">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-gray-400">
            How the model works
          </h2>
          <div className="mt-8 grid items-center gap-6 sm:grid-cols-3">
            <PartyCard label="UK Employer" sub="Pays one GBP invoice" color="#4540DB" />
            <FlowArrow label="OSCABE" sub="Billing, compliance, management" />
            <PartyCard label="Engineer" sub="India or Middle East" color="#00D4FF" />
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">How It Works</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-gray-400">
          Five steps from browsing to onboarded engineer. Most clients move from request to first day in under a working week.
        </p>

        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#4540DB] to-[#00D4FF]">
                <s.icon className="h-5 w-5 text-white" />
              </div>
              <p className="mt-3 text-xs uppercase tracking-wider text-gray-500">
                Step {i + 1}
              </p>
              <h3 className="mt-1 text-base font-bold text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-gray-400">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Comparison */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">
          Traditional UK Hire vs OSCABE Portal
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-gray-400">
          Like-for-like comparison for a Senior SCADA Engineer engagement.
        </p>

        <div className="mt-10 overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Dimension
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Traditional UK Hire
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#33D9FF]">
                  OSCABE Portal
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((c) => (
                <tr key={c.row} className="border-b border-white/[0.04] last:border-0">
                  <td className="px-4 py-3.5 font-medium text-white">{c.row}</td>
                  <td className="px-4 py-3.5 text-gray-400">{c.uk}</td>
                  <td className="px-4 py-3.5 font-semibold text-emerald-300">{c.portal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Engagement types */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">Engagement Options</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-gray-400">
          Three ways to engage. Switch between models as your needs change.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {ENGAGEMENT_TYPES.map((t) => (
            <article
              key={t.title}
              className={`relative rounded-2xl border p-6 ${
                t.featured
                  ? "border-[#4540DB]/40 bg-gradient-to-br from-[#4540DB]/10 to-[#00D4FF]/10"
                  : "border-white/[0.06] bg-white/[0.02]"
              }`}
            >
              {t.featured && (
                <span className="absolute -top-3 left-6 rounded-full bg-[#4540DB] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-bold text-white">{t.title}</h3>
              <p className="mt-1 text-sm text-gray-400">{t.summary}</p>
              <ul className="mt-5 space-y-2">
                {t.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm font-semibold text-[#33D9FF]">{t.rate}</p>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">FAQ</h2>
        <div className="mt-10 space-y-4">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
            >
              <summary className="cursor-pointer list-none text-base font-semibold text-white">
                <span className="flex items-center justify-between gap-3">
                  {f.q}
                  <span className="text-[#4540DB] transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-gray-300">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#4540DB]/10 to-[#00D4FF]/10 px-8 py-12 text-center sm:px-16">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Ready to see who&apos;s available?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-gray-400">
            Browse the portal or book a 20-minute call to talk through your specific requirement.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/engineers"
              className="inline-flex items-center gap-2 rounded-xl bg-[#4540DB] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#4540DB]/25 transition-all hover:scale-105 hover:bg-[#3733B0]"
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
      </section>
    </div>
  );
}

function PartyCard({ label, sub, color }: { label: string; sub: string; color: string }) {
  return (
    <div
      className="rounded-2xl border p-6 text-center"
      style={{
        borderColor: `${color}40`,
        background: `linear-gradient(135deg, ${color}15, transparent)`,
      }}
    >
      <p className="text-lg font-bold text-white">{label}</p>
      <p className="mt-1 text-xs text-gray-400">{sub}</p>
    </div>
  );
}

function FlowArrow({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="relative flex flex-col items-center">
      <div className="hidden h-px w-full bg-gradient-to-r from-[#4540DB]/50 via-white/40 to-[#00D4FF]/50 sm:block" />
      <div className="-mt-4 rounded-full border border-white/15 bg-[#010118] px-4 py-2.5 text-center">
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="mt-0.5 text-[10px] uppercase tracking-wider text-gray-500">{sub}</p>
      </div>
    </div>
  );
}
