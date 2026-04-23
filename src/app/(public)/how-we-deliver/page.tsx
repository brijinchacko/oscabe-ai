"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Clock,
  Users,
  CalendarCheck,
  BarChart3,
  ShieldCheck,
  RefreshCw,
  Phone,
} from "lucide-react";

const OPERATIONAL_MODEL = [
  {
    title: "Wartens India Office, Bangalore",
    description: "Every remote engineer works from the Wartens India office in Bangalore. This is not a work-from-home arrangement. Engineers work in a professional office environment with high-speed internet, dual monitors, and the collaboration tools your team uses.",
    icon: Building2,
    color: "#4540DB",
  },
  {
    title: "Daily Standup Overlap: 10am-2pm UK Time",
    description: "Engineers are available for a minimum of 4 hours of real-time overlap with UK working hours (10am-2pm UK time). This covers daily standups, pair programming sessions, and ad-hoc calls. Many engineers choose to extend beyond this window.",
    icon: Clock,
    color: "#00D4FF",
  },
  {
    title: "Weekly Check-In with OSCABE Delivery Manager",
    description: "Every week, an OSCABE delivery manager reviews progress with the engineer. We track deliverables, identify blockers, and ensure the engineer is performing to the standard you expect. You get a summary report.",
    icon: Users,
    color: "#8B5CF6",
  },
  {
    title: "Fortnightly Engineering Review by CEng Lead",
    description: "Every two weeks, a Chartered Engineer reviews the technical output of the remote engineer. This is a code review, architecture review, or design review depending on the role. It is an independent quality gate that traditional outsourcing firms do not offer.",
    icon: CalendarCheck,
    color: "#F59E0B",
  },
  {
    title: "Monthly Business Review with Client",
    description: "Once a month, we sit down with you to review the engagement. We discuss performance, feedback, upcoming work, and any adjustments needed. This is your opportunity to steer the engagement and ensure you are getting full value.",
    icon: BarChart3,
    color: "#22C55E",
  },
];

const GUARANTEES = [
  {
    title: "30-Day Replacement Guarantee",
    description: "If a remote engineer is not the right fit for any reason within the first 30 days, we will replace them at no additional cost. No questions asked.",
    icon: RefreshCw,
    color: "#00D4FF",
  },
  {
    title: "90-Day Full Refund for Unfit Placements",
    description: "If a placement proves genuinely unfit for purpose within 90 days, you receive a full refund. We stand behind the quality of our vetting process.",
    icon: ShieldCheck,
    color: "#22C55E",
  },
];

export default function HowWeDeliverPage() {
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
            <Building2 className="h-3.5 w-3.5" />
            Managed Delivery
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            How We Deliver
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
            A structured operational model with daily overlap, weekly management, fortnightly technical reviews, and monthly business reviews. Not just outsourcing — managed engineering delivery.
          </p>
        </div>
      </section>

      {/* Operational Model */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {OPERATIONAL_MODEL.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.06]"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `${item.color}15` }}
                  >
                    <item.icon className="h-6 w-6" style={{ color: item.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-gray-400">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="border-y border-white/[0.06] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Our Guarantees
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-gray-400">
            We put our money where our mouth is.
          </p>

          <div className="mx-auto mt-14 grid max-w-4xl gap-8 sm:grid-cols-2">
            {GUARANTEES.map((guarantee) => (
              <div
                key={guarantee.title}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.06]"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{ background: `${guarantee.color}15` }}
                >
                  <guarantee.icon className="h-7 w-7" style={{ color: guarantee.color }} />
                </div>
                <h3 className="mt-4 text-xl font-bold text-white">{guarantee.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">{guarantee.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] px-8 py-16 backdrop-blur-sm sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              See the model in action
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
              Book a call and we will show you how the delivery model works with your team.
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
                href="/how-we-vet"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
              >
                See How We Vet
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
