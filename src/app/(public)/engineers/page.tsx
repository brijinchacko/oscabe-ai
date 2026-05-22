import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Users, Clock, TrendingDown, ShieldCheck } from "lucide-react";
import {
  getPublishedEngineers,
  RATE_BANDS,
  type EngineerProfile,
} from "@/lib/engineers-data";
import { EngineerCard } from "@/components/shared/engineer-card";
import { EngineerFilterBar } from "@/components/shared/engineer-filter-bar";

export const metadata: Metadata = {
  title: "Browse Remote Automation Engineers | OSCABE",
  description:
    "Browse 6,000+ pre-screened PLC, SCADA, AI/ML and Robotics engineers from India and the Middle East. OSCABE-verified. Hire in 72 hours. Pay monthly in GBP.",
  keywords: [
    "hire remote PLC engineer UK",
    "SCADA engineer on demand",
    "remote automation engineer",
    "hire industrial automation engineer UK",
  ],
  openGraph: {
    title: "Browse Remote Automation Engineers | OSCABE",
    description:
      "Browse 6,000+ pre-screened automation engineers. OSCABE-verified. Hire in 72 hours. Pay monthly in GBP.",
    url: "https://oscabe.com/engineers",
    siteName: "OSCABE",
    locale: "en_GB",
    type: "website",
  },
  alternates: { canonical: "https://oscabe.com/engineers" },
};

interface PageProps {
  searchParams: Promise<{
    role?: string;
    platform?: string;
    seniority?: string;
    availability?: string;
    rate?: string;
  }>;
}

function filterEngineers(
  engineers: EngineerProfile[],
  filters: {
    role?: string;
    platform?: string;
    seniority?: string;
    availability?: string;
    rate?: string;
  },
): EngineerProfile[] {
  let out = engineers;
  if (filters.role) out = out.filter((e) => e.category === filters.role);
  if (filters.platform)
    out = out.filter((e) =>
      e.platforms.some((p) => p.toLowerCase().includes(filters.platform!.toLowerCase())),
    );
  if (filters.seniority) out = out.filter((e) => e.seniorityBucket === filters.seniority);
  if (filters.availability) out = out.filter((e) => e.availability === filters.availability);
  if (filters.rate) {
    const band = RATE_BANDS.find((b) => b.value === filters.rate);
    if (band) {
      out = out.filter((e) => e.monthlyRateLow <= band.max && e.monthlyRateHigh >= band.min);
    }
  }
  return out;
}

export default async function EngineersPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const all = getPublishedEngineers();
  const engineers = filterEngineers(all, filters);

  return (
    <div className="bg-[#010118]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#4540DB]/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-[#00D4FF]/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#4540DB]/40 bg-[#4540DB]/10 px-4 py-1.5 text-xs font-medium tracking-wide text-[#8A85F0]">
            <Users className="h-3.5 w-3.5" />
            Remote Engineer Portal
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Browse Verified Automation Engineers
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-400 sm:text-lg">
            6,000+ pre-screened PLC, SCADA, AI/ML and Robotics engineers from India and the Middle East.
            Senior-engineer verified. Available for short-term projects or long-term contracts.
          </p>

          {/* Stats bar */}
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            <StatPill icon={Users} label="6,000+" sub="Engineers" />
            <StatPill icon={Clock} label="72 hrs" sub="Avg shortlist" />
            <StatPill icon={TrendingDown} label="40-60%" sub="Cost saving" />
            <StatPill icon={ShieldCheck} label="Verified" sub="By Senior Engineers" />
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <Suspense fallback={<div className="h-14" />}>
        <EngineerFilterBar />
      </Suspense>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-baseline justify-between">
          <p className="text-sm text-gray-400">
            <span className="font-semibold text-white">{engineers.length}</span>{" "}
            {engineers.length === 1 ? "engineer" : "engineers"} found
          </p>
          {engineers.length !== all.length && (
            <Link
              href="/engineers"
              className="text-xs font-medium text-[#00D4FF] hover:text-white"
            >
              Show all {all.length}
            </Link>
          )}
        </div>

        {engineers.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {engineers.map((e) => (
              <EngineerCard key={e.slug} engineer={e} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#4540DB]/10 to-[#00D4FF]/10 px-8 py-12 text-center sm:px-16">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Don&apos;t see the right profile?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-gray-400">
            Tell us your requirement and we will source the right engineer from our 6,000+ pool. Average shortlist in 72 hours.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/post-a-role"
              className="inline-flex items-center gap-2 rounded-xl bg-[#4540DB] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#4540DB]/25 transition-all hover:scale-105 hover:bg-[#3733B0]"
            >
              Submit a Requirement
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              How It Works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatPill({
  icon: Icon,
  label,
  sub,
}: {
  icon: typeof Users;
  label: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 backdrop-blur-sm">
      <Icon className="mx-auto h-5 w-5 text-[#00D4FF]" />
      <p className="mt-2 text-lg font-bold text-white sm:text-xl">{label}</p>
      <p className="text-[11px] uppercase tracking-wider text-gray-500">{sub}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
      <p className="text-base text-gray-400">No engineers match these filters.</p>
      <Link
        href="/engineers"
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#00D4FF] hover:text-white"
      >
        Clear filters
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
