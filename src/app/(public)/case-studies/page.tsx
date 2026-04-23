"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  TrendingUp,
  Building2,
  Monitor,
  Cpu,
  Briefcase,
  Landmark,
  Truck,
  Phone,
} from "lucide-react";

type FilterTab = "all" | "remote" | "uk";

const CASE_STUDIES = [
  {
    id: "engineering-technical",
    clientType: "Engineering / Technical Hiring",
    industry: "Manufacturing",
    category: "uk" as const,
    icon: Cpu,
    color: "#8B5CF6",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&h=400&fit=crop",
    challenge:
      "A large manufacturing firm needed two specialist PLC engineers urgently to keep a major commissioning project on track. Previous agencies had taken 6+ weeks to deliver unsuitable candidates, putting the project timeline at risk.",
    solution: [
      "Rapid sourcing from our verified engineering talent pool",
      "Technical pre-screening against specific PLC platform requirements",
      "Delivered a shortlist of 5 qualified candidates in 3 days",
    ],
    results: [
      { metric: "2 positions", detail: "Filled within 10 days" },
      { metric: "40%", detail: "Reduction in hiring time" },
    ],
  },
  {
    id: "financial-services",
    clientType: "Insurance & Financial Services",
    industry: "Insurance",
    category: "uk" as const,
    icon: Landmark,
    color: "#4540DB",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=400&fit=crop",
    challenge:
      "A mid-size insurance company was scaling its claims team and needed 4 experienced claims handlers within a tight deadline. Internal HR was overwhelmed and traditional agencies were sending unvetted CVs that wasted interview time.",
    solution: [
      "Targeted sourcing of candidates with claims handling experience",
      "Pre-qualification interviews assessing technical knowledge and soft skills",
      "Shortlist of 8 candidates delivered within 72 hours",
    ],
    results: [
      { metric: "4 hires", detail: "Made within 3 weeks" },
      { metric: "60%", detail: "Less time spent on interviews" },
    ],
  },
  {
    id: "technology-startup",
    clientType: "Technology / Software Development",
    industry: "SaaS / Technology",
    category: "remote" as const,
    icon: Monitor,
    color: "#00D4FF",
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&h=400&fit=crop",
    challenge:
      "A fast-growing SaaS startup needed 3 full-stack developers to meet product launch deadlines. The founder had spent 2 months trying to hire through job boards with no success, receiving hundreds of irrelevant applications.",
    solution: [
      "Sourced candidates with specific tech stack experience (React, Node.js, AWS)",
      "Technical screening with coding assessment and architecture discussion",
      "Delivered 6 pre-qualified candidates in 4 days",
    ],
    results: [
      { metric: "3 developers", detail: "Hired within 2 weeks" },
      { metric: "100%", detail: "Retention after 6 months" },
    ],
  },
  {
    id: "operations-admin",
    clientType: "Business Operations / Admin",
    industry: "Professional Services",
    category: "uk" as const,
    icon: Briefcase,
    color: "#22C55E",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
    challenge:
      "A professional services firm opening a new regional office needed an Office Manager, HR Coordinator, and two Admin Assistants. They had no local recruitment presence and needed the team ready before the office launch date.",
    solution: [
      "Local talent mapping and targeted outreach",
      "Behavioural and competency-based screening for cultural fit",
      "Staggered delivery of shortlists over 5 days to match onboarding schedule",
    ],
    results: [
      { metric: "4 roles", detail: "Filled before office launch" },
      { metric: "50%", detail: "Cost saving vs traditional agency fees" },
    ],
  },
  {
    id: "supply-chain",
    clientType: "Supply Chain & Logistics",
    industry: "Logistics",
    category: "uk" as const,
    icon: Truck,
    color: "#F59E0B",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop",
    challenge:
      "A national logistics company was experiencing rapid growth and needed a Supply Chain Manager and two Warehouse Supervisors across multiple sites. High turnover in the sector made finding reliable, experienced candidates extremely difficult.",
    solution: [
      "Industry-specific sourcing targeting candidates with multi-site experience",
      "Reference verification and background checks included",
      "Delivered shortlist of 7 candidates across all 3 roles in 5 days",
    ],
    results: [
      { metric: "3 hires", detail: "Completed within 18 days" },
      { metric: "0%", detail: "Turnover in first 12 months" },
    ],
  },
  {
    id: "data-ai",
    clientType: "Data & AI Recruitment",
    industry: "Technology / Enterprise",
    category: "remote" as const,
    icon: Building2,
    color: "#EC4899",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=400&fit=crop",
    challenge:
      "An enterprise software company was building a new AI/ML team from scratch. They needed a Data Engineering Lead and two Data Scientists with specific NLP experience. The niche skill requirement made traditional recruitment channels ineffective.",
    solution: [
      "Specialist sourcing through AI/ML professional communities",
      "Technical assessment covering machine learning fundamentals and NLP expertise",
      "Delivered 5 strong candidates in 6 days with detailed skill profiles",
    ],
    results: [
      { metric: "3 hires", detail: "Team built in under 4 weeks" },
      { metric: "35%", detail: "Below market rate agency fees" },
    ],
  },
];

const TABS: { label: string; value: FilterTab }[] = [
  { label: "All", value: "all" },
  { label: "Remote", value: "remote" },
  { label: "UK", value: "uk" },
];

export default function CaseStudiesPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filteredStudies = activeTab === "all"
    ? CASE_STUDIES
    : CASE_STUDIES.filter((s) => s.category === activeTab);

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
          <span className="inline-flex items-center gap-2 rounded-full border border-[#4540DB]/40 bg-[#4540DB]/10 px-4 py-1.5 text-xs font-medium tracking-wide text-[#4540DB]">
            <TrendingUp className="h-3.5 w-3.5" />
            Real Results
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Case Studies
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
            See how we help organisations hire high-performing talent quickly and cost-effectively across every sector.
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/[0.06] py-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-12 px-4">
          {[
            { value: "72hrs", label: "Average time to shortlist" },
            { value: "40%", label: "Avg reduction in hiring time" },
            { value: "95%", label: "Client satisfaction rate" },
            { value: "0", label: "Upfront fees" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-[#00D4FF] sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Filter Tabs + Case Studies */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="mb-12 flex items-center justify-center gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
                  activeTab === tab.value
                    ? "bg-[#4540DB] text-white shadow-lg shadow-[#4540DB]/25"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-16">
            {filteredStudies.map((study, index) => (
              <div
                key={study.id}
                className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm"
              >
                {/* Case study image */}
                <div className="relative h-56 w-full sm:h-64">
                  <Image
                    src={study.image}
                    alt={`${study.clientType} - ${study.industry}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#010118]/50 to-[#010118]" />
                  <div className="absolute bottom-6 left-8 flex items-center gap-4 sm:left-10">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-xl"
                      style={{ background: `${study.color}20` }}
                    >
                      <study.icon className="h-7 w-7" style={{ color: study.color }} />
                    </div>
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                        {study.category === "remote" ? "Remote" : "UK"} Case Study
                      </span>
                      <h2 className="text-xl font-bold text-white sm:text-2xl">
                        {study.clientType}
                      </h2>
                    </div>
                  </div>
                  <span
                    className="absolute right-8 bottom-6 inline-block rounded-full px-3 py-0.5 text-[11px] font-medium sm:right-10"
                    style={{ background: `${study.color}15`, color: study.color }}
                  >
                    {study.industry}
                  </span>
                </div>

                {/* Content grid */}
                <div className="p-8 sm:p-10">
                  <div className="grid gap-6 sm:grid-cols-3">
                    {/* Challenge */}
                    <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.03] p-6">
                      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-red-400">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-[10px]">!</span>
                        Challenge
                      </h3>
                      <p className="mt-4 text-sm leading-relaxed text-gray-400">
                        {study.challenge}
                      </p>
                    </div>

                    {/* Solution */}
                    <div
                      className="rounded-2xl border p-6"
                      style={{ borderColor: `${study.color}20`, background: `${study.color}03` }}
                    >
                      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider" style={{ color: study.color }}>
                        <Clock className="h-4 w-4" />
                        Solution
                      </h3>
                      <ul className="mt-4 space-y-3">
                        {study.solution.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-gray-400">
                            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: study.color }} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Results */}
                    <div className="rounded-2xl border border-[#22C55E]/20 bg-[#22C55E]/[0.03] p-6">
                      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
                        <TrendingUp className="h-4 w-4" />
                        Result
                      </h3>
                      <div className="mt-4 space-y-4">
                        {study.results.map((result) => (
                          <div key={result.detail}>
                            <p className="text-2xl font-bold text-[#22C55E]">{result.metric}</p>
                            <p className="text-sm text-gray-400">{result.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/[0.06]">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] px-8 py-16 backdrop-blur-sm sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to be our next success story?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
              Join the growing number of organisations that trust OSCABE for fast, reliable recruitment.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
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
