"use client";

import Link from "next/link";
import {
  ArrowRight,
  Search,
  Brain,
  GitBranch,
  Activity,
  MessageSquare,
  ShieldCheck,
  Send,
  Bot,
  Phone,
} from "lucide-react";

const AGENTS = [
  {
    name: "SCOUT",
    tagline: "Candidate Sourcing",
    icon: Search,
    color: "#4540DB",
    description: "SCOUT autonomously sources candidates from job boards, LinkedIn, professional communities, and our internal talent pool. It identifies passive candidates who match the technical profile, even if they are not actively looking. SCOUT prioritises engineers with verified platform experience and filters out noise before a human ever reviews a profile.",
    whyItMatters: "Traditional sourcing is slow and relies on keyword matching that misses great candidates. SCOUT uses semantic understanding of engineering specialisms to find candidates that keyword searches would never surface. It runs 24/7 and never misses a new profile.",
  },
  {
    name: "PROBE",
    tagline: "Technical Screening",
    icon: Brain,
    color: "#00D4FF",
    description: "PROBE runs the initial technical screen for every candidate. It generates platform-specific questions based on the candidate's claimed experience, scores responses against our Senior Engineer-defined rubrics, and flags candidates who need deeper investigation. PROBE adapts its difficulty based on the seniority level of the role.",
    whyItMatters: "Human screeners cannot scale. With thousands of candidates flowing through our pipeline, PROBE ensures every single one gets a consistent, rigorous initial assessment. It frees our Senior Engineers to focus on the final, high-value stages of vetting.",
  },
  {
    name: "BRIDGE",
    tagline: "Candidate-Role Matching",
    icon: GitBranch,
    color: "#8B5CF6",
    description: "BRIDGE matches candidates to roles based on platform fit, industry experience, seniority, location preference, and cultural alignment. It goes beyond simple keyword matching to understand that a Siemens TIA Portal engineer with automotive experience is a different profile to one with pharma experience, even though both are PLC programmers.",
    whyItMatters: "The difference between a good hire and a great hire is context. BRIDGE ensures that the shortlist you receive is not just technically qualified but also aligned with your industry, team dynamics, and project requirements.",
  },
  {
    name: "PULSE",
    tagline: "Engagement & Retention",
    icon: Activity,
    color: "#22C55E",
    description: "PULSE monitors engagement and retention signals across our placed engineers and active candidates. It tracks satisfaction scores, response times, workload indicators, and early warning signs of disengagement. PULSE alerts our delivery managers before a problem becomes a resignation.",
    whyItMatters: "Losing a placed engineer costs time and money. PULSE gives us early warning so we can intervene, adjust workloads, or prepare a replacement before a gap appears in your team.",
  },
  {
    name: "ENGAGE",
    tagline: "Communication Cadence",
    icon: MessageSquare,
    color: "#F59E0B",
    description: "ENGAGE manages the candidate communication cadence throughout the recruitment lifecycle. From initial outreach to interview scheduling to offer management, ENGAGE ensures every candidate receives timely, personalised communication. It handles reminders, follow-ups, and status updates automatically.",
    whyItMatters: "Candidate experience directly impacts your employer brand and offer acceptance rates. ENGAGE ensures no candidate falls through the cracks and every interaction feels personal, even at scale.",
  },
  {
    name: "COMPLY",
    tagline: "Compliance & Verification",
    icon: ShieldCheck,
    color: "#EF4444",
    description: "COMPLY flags compliance issues before they become problems. It checks right-to-work documentation, verifies professional credentials, monitors IR35 status for contractors, and ensures GDPR compliance across all candidate data. COMPLY maintains a full audit trail for every compliance decision.",
    whyItMatters: "Compliance failures can cost thousands in fines and destroy client relationships. COMPLY provides an automated compliance layer that catches issues human reviewers might miss, especially across different jurisdictions and regulation types.",
  },
  {
    name: "OUTREACH",
    tagline: "Passive Candidate Outreach",
    icon: Send,
    color: "#EC4899",
    description: "OUTREACH runs targeted outbound campaigns to passive candidates who are not actively looking for roles. It crafts personalised messages based on the candidate's background, adjusts timing and channel based on response patterns, and manages multi-touch sequences that convert passive interest into active engagement.",
    whyItMatters: "The best engineers are rarely on job boards. OUTREACH enables us to reach them proactively, at scale, with messaging that resonates with their specific expertise and career stage.",
  },
];

export default function AiPlatformPage() {
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
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/40 bg-[#00D4FF]/10 px-4 py-1.5 text-xs font-medium tracking-wide text-[#00D4FF]">
            <Bot className="h-3.5 w-3.5" />
            AI-Powered Recruitment
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            7 AI Agents. One Platform.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
            Every stage of our recruitment process is powered by purpose-built AI agents. From sourcing to compliance, our platform ensures speed, accuracy, and consistency at scale.
          </p>
        </div>
      </section>

      {/* Agents */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {AGENTS.map((agent, index) => (
              <div
                key={agent.name}
                className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.06]"
              >
                <div className="p-8 sm:p-10">
                  {/* Header */}
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-xl"
                      style={{ background: `${agent.color}15` }}
                    >
                      <agent.icon className="h-7 w-7" style={{ color: agent.color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-white">{agent.name}</h3>
                        <span
                          className="inline-flex rounded-full px-3 py-0.5 text-[11px] font-medium"
                          style={{ background: `${agent.color}15`, color: agent.color }}
                        >
                          Agent {index + 1}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">{agent.tagline}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-6 space-y-4">
                    <p className="text-sm leading-relaxed text-gray-400">{agent.description}</p>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: agent.color }}>
                        Why It Matters
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-gray-400">{agent.whyItMatters}</p>
                    </div>
                  </div>
                </div>
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
              Request a Demo
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
              See how our AI agents work together to deliver faster, more accurate recruitment for automation and AI roles.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-[#4540DB] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-[#4540DB]/25 transition-all hover:bg-[#4540DB]/90 hover:scale-105"
              >
                Request a Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/remote-engineers"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
              >
                Explore Remote Engineers
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
