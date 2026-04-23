"use client";

import { useState, useEffect, useRef, type RefObject } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
  Shield,
  Zap,
  Cpu,
  Briefcase,
  ClipboardList,
  Star,
  ChevronRight,
  Phone,
  Bot,
  Brain,
  Eye,
  Network,
  Cog,
  Wrench,
  Factory,
  CircuitBoard,
  Gauge,
  Settings,
  Workflow,
  Cable,
  MonitorCog,
  Layers,
  BarChart3,
  Database,
  Server,
  Globe,
  Award,
} from "lucide-react";
import { AwardsBanner } from "@/components/shared/awards-banner";

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
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [ref, visible] = useInView(0.1);
  return (
    <section ref={ref} className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const AUTOMATION_SPECIALISMS = [
  "PLC Programming (Siemens, Allen-Bradley, Schneider, Beckhoff, Mitsubishi)",
  "SCADA & HMI (WinCC, FactoryTalk, Ignition, AVEVA)",
  "Robotics (FANUC, ABB, KUKA, Universal Robots)",
  "Controls & Instrumentation (EC&I, DCS, Safety PLC, SIL)",
  "Commissioning & Field Service",
  "Panel Design & Electrical Engineering",
];

const AI_SPECIALISMS = [
  "Machine Learning Engineering",
  "Computer Vision & Image Processing",
  "Data Science & Analytics",
  "AI/ML for Manufacturing (Predictive Maintenance, Quality Control)",
  "Industrial IoT (IIoT) & Edge Computing",
  "Digital Twin & Simulation",
  "Autonomous Systems & Robotics AI",
  "Natural Language Processing",
];

const ROLES_ROW_1 = [
  { title: "PLC Programmer", icon: Cpu, href: "/blog/top-10-plc-programming-skills-employers-want-2026" },
  { title: "SCADA Engineer", icon: MonitorCog, href: "/blog/scada-engineer-career-guide-uk" },
  { title: "Controls Engineer", icon: Settings, href: "/blog/controls-engineer-vs-automation-engineer" },
  { title: "Automation Engineer", icon: Cog },
  { title: "Robotics Engineer", icon: Bot, href: "/blog/rise-of-robotics-engineers-fanuc-abb-kuka" },
  { title: "Commissioning Engineer", icon: Wrench },
];
const ROLES_ROW_2 = [
  { title: "EC&I Engineer", icon: Cable },
  { title: "DCS Engineer", icon: CircuitBoard },
  { title: "Safety Engineer (SIL)", icon: Shield },
  { title: "Panel Design Engineer", icon: Layers },
  { title: "Field Service Engineer", icon: Wrench },
  { title: "BMS Engineer", icon: Gauge },
];
const ROLES_ROW_3 = [
  { title: "ML Engineer", icon: Brain, href: "/blog/machine-learning-manufacturing-roles-career-paths" },
  { title: "AI Engineer", icon: Bot, href: "/blog/plc-programmer-to-ai-engineer-career-transition" },
  { title: "Data Scientist", icon: BarChart3 },
  { title: "Computer Vision Engineer", icon: Eye, href: "/blog/computer-vision-industry-quality-control-autonomous" },
  { title: "NLP Engineer", icon: Globe },
  { title: "MLOps Engineer", icon: Server },
];
const ROLES_ROW_4 = [
  { title: "AI Research Scientist", icon: Brain },
  { title: "Robotics AI Engineer", icon: Bot },
  { title: "IoT Engineer", icon: Network },
  { title: "Digital Twin Engineer", icon: Workflow, href: "/blog/digital-twin-engineers-most-in-demand-industry-4" },
  { title: "Data Engineer", icon: Database },
  { title: "Automation Architect", icon: Factory },
];

const ALL_ROLES = [ROLES_ROW_1, ROLES_ROW_2, ROLES_ROW_3, ROLES_ROW_4];

const AUTOMATION_PLATFORMS = [
  "Siemens TIA Portal", "Allen-Bradley Studio 5000", "Rockwell", "Schneider EcoStruxure",
  "Beckhoff TwinCAT", "ABB", "Mitsubishi", "Omron", "CODESYS", "Ignition",
  "AVEVA", "WinCC", "FactoryTalk",
];

const AI_PLATFORMS = [
  "Python", "TensorFlow", "PyTorch", "scikit-learn", "OpenCV", "Hugging Face",
  "AWS SageMaker", "Azure ML", "Databricks", "MLflow", "Kubernetes", "Docker",
];

/* ================================================================== */
/*  PAGE                                                               */
/* ================================================================== */
export default function HomePage() {
  const [heroRef, heroVisible] = useInView(0.05);

  return (
    <div className="bg-[#010118]">
      {/* ============================================================ */}
      {/*  SECTION 1 - HERO                                            */}
      {/* ============================================================ */}
      <section
        ref={heroRef}
        className="relative overflow-x-clip"
      >
        {/* Background effects */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#4540DB]/10 blur-[150px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#00D4FF]/8 blur-[150px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left - Text */}
            <div
              className={`transition-all duration-700 ease-out ${
                heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#4540DB]/40 bg-[#4540DB]/10 px-4 py-1.5 text-xs font-medium tracking-wide text-[#4540DB]">
                <Award className="h-3.5 w-3.5" />
                National Manufacturing & Engineering Startup of the Year 2025
              </span>

              <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                The Specialist Recruiter for{" "}
                <span className="bg-gradient-to-r from-[#4540DB] to-[#00D4FF] bg-clip-text text-transparent">
                  Industrial Automation
                </span>{" "}
                &{" "}
                <span className="bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] bg-clip-text text-transparent">
                  AI
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-gray-400 sm:text-lg">
                We place engineers who build, program, and optimise the systems that power modern industry — from PLC and SCADA to Machine Learning and Computer Vision.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/post-a-role"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#4540DB] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#4540DB]/25 transition-all hover:bg-[#4540DB]/90 hover:scale-105"
                >
                  Hire Talent
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  Browse Jobs
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#22C55E]" />72hr shortlists</span>
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#22C55E]" />Chartered Engineer-led screening</span>
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#22C55E]" />6,000+ pre-screened engineers</span>
              </div>
            </div>

            {/* Right - Image grid */}
            <div
              className={`hidden lg:grid grid-cols-2 gap-4 transition-all delay-200 duration-700 ease-out ${
                heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
                  <Image
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop"
                    alt="Industrial automation factory floor"
                    width={400}
                    height={300}
                    className="h-48 w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
                  <Image
                    src="https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&h=400&fit=crop"
                    alt="AI and machine learning workspace"
                    width={400}
                    height={400}
                    className="h-56 w-full object-cover"
                  />
                </div>
              </div>
              <div className="mt-8 space-y-4">
                <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
                  <Image
                    src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=400&fit=crop"
                    alt="Robotics and automation engineering"
                    width={400}
                    height={400}
                    className="h-56 w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
                  <Image
                    src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop"
                    alt="Control room and SCADA systems"
                    width={400}
                    height={300}
                    className="h-48 w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  AWARDS BANNER                                                */}
      {/* ============================================================ */}
      <AwardsBanner />

      {/* ============================================================ */}
      {/*  OUR SPECIALISMS                                              */}
      {/* ============================================================ */}
      <Section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Our Specialisms
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-400">
              Deep expertise across both industrial automation and artificial intelligence.
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            {/* Industrial Automation */}
            <div className="rounded-2xl border border-[#4540DB]/20 bg-white/[0.02] p-8 backdrop-blur-sm transition-all hover:border-[#4540DB]/40 hover:bg-white/[0.04]">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#4540DB]/15">
                  <Cpu className="h-7 w-7 text-[#4540DB]" />
                </div>
                <h3 className="text-xl font-bold text-white">Industrial Automation</h3>
              </div>
              <ul className="mt-6 space-y-3">
                {AUTOMATION_SPECIALISMS.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-400">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#4540DB]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* AI & Intelligent Systems */}
            <div className="rounded-2xl border border-[#00D4FF]/20 bg-white/[0.02] p-8 backdrop-blur-sm transition-all hover:border-[#00D4FF]/40 hover:bg-white/[0.04]">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#00D4FF]/15">
                  <Brain className="h-7 w-7 text-[#00D4FF]" />
                </div>
                <h3 className="text-xl font-bold text-white">AI & Intelligent Systems</h3>
              </div>
              <ul className="mt-6 space-y-3">
                {AI_SPECIALISMS.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-400">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#00D4FF]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  ROLES WE PLACE                                               */}
      {/* ============================================================ */}
      <Section className="py-20 sm:py-24 border-y border-white/[0.04]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Roles We Place
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-400">
              From PLC programmers to AI research scientists, we recruit across the full spectrum of automation and intelligent systems.
            </p>
          </div>

          <div className="mt-14 space-y-4">
            {ALL_ROLES.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {row.map((role) => {
                  const iconColorClass = rowIndex < 2 ? "text-[#4540DB]" : "text-[#00D4FF]";
                  const cardClasses = "flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.05]";
                  const inner = (
                    <>
                      <role.icon className={`h-4 w-4 shrink-0 ${iconColorClass}`} />
                      <span className="text-xs font-medium text-gray-300">{role.title}</span>
                    </>
                  );

                  if ("href" in role && role.href) {
                    return (
                      <Link key={role.title} href={role.href} className={cardClasses}>
                        {inner}
                      </Link>
                    );
                  }

                  return (
                    <div key={role.title} className={cardClasses}>
                      {inner}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/industries"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#00D4FF] transition-colors hover:text-white"
            >
              View all specialisms by industry
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  WHY OSCABE                                                   */}
      {/* ============================================================ */}
      <Section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Why Companies Choose OSCABE
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { icon: Shield, text: "Chartered Engineer-led technical screening", color: "#4540DB" },
              { icon: Clock, text: "72-hour shortlists, guaranteed", color: "#00D4FF" },
              { icon: Users, text: "6,000+ pre-screened automation & AI engineers", color: "#22C55E" },
              { icon: Zap, text: "No upfront recruitment fees", color: "#8B5CF6" },
              { icon: ClipboardList, text: "13+ years deep automation & AI expertise", color: "#F59E0B" },
            ].map((item) => (
              <div
                key={item.text}
                className="flex flex-col items-center rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center backdrop-blur-sm transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{ background: `${item.color}18` }}
                >
                  <item.icon className="h-7 w-7" style={{ color: item.color }} />
                </div>
                <p className="mt-4 text-sm font-medium leading-relaxed text-gray-300">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  OSCABE vs TRADITIONAL AGENCIES                               */}
      {/* ============================================================ */}
      <Section className="py-20 sm:py-24 border-y border-white/[0.04]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              OSCABE vs Traditional Recruitment Agencies
            </h2>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2">
            <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.02] p-8">
              <h3 className="text-lg font-bold text-red-400">Traditional Agencies</h3>
              <ul className="mt-6 space-y-4">
                {[
                  "High retainers and upfront fees",
                  "Slow delivery timelines (weeks, not days)",
                  "CV forwarding without technical validation",
                  "No understanding of PLC, SCADA, or AI tech stacks",
                  "Limited accountability on candidate quality",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-400">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400 text-xs">&#10005;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-[#22C55E]/25 bg-[#22C55E]/[0.02] p-8">
              <h3 className="text-lg font-bold text-[#22C55E]">OSCABE</h3>
              <ul className="mt-6 space-y-4">
                {[
                  "No upfront cost — pay on results",
                  "Shortlist in 72 hours, guaranteed",
                  "Chartered Engineer-verified candidates",
                  "Deep expertise in automation AND AI domains",
                  "6,000+ pre-screened engineers in our talent pool",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-300">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  HOW IT WORKS                                                 */}
      {/* ============================================================ */}
      <Section className="py-20 sm:py-24">
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
              {[
                { step: 1, title: "Understand Your Requirement", description: "We learn your role, tech stack, team, and timeline — whether it is PLC, SCADA, ML, or AI.", color: "#4540DB" },
                { step: 2, title: "Source & Pre-Screen", description: "We search our 6,000+ talent pool and technically verify candidates before you see them.", color: "#00D4FF" },
                { step: 3, title: "Deliver Shortlist in 72 Hours", description: "You receive a curated shortlist of Chartered Engineer-verified, ready-to-interview candidates.", color: "#8B5CF6" },
                { step: 4, title: "Support Through Hiring", description: "We manage interviews, offers, and onboarding support to get your engineer started.", color: "#22C55E" },
              ].map((item) => (
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
      </Section>

      {/* ============================================================ */}
      {/*  PLATFORMS & TECHNOLOGIES WE COVER                            */}
      {/* ============================================================ */}
      <Section className="py-20 sm:py-24 border-y border-white/[0.04]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Platforms & Technologies We Cover
            </h2>
          </div>

          <div className="mt-14 space-y-10">
            {/* Automation Platforms */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#4540DB]">Automation Platforms</h3>
              <div className="flex flex-wrap gap-3">
                {AUTOMATION_PLATFORMS.map((platform) => (
                  <span
                    key={platform}
                    className="rounded-lg border border-[#4540DB]/20 bg-[#4540DB]/[0.06] px-4 py-2 text-xs font-medium text-gray-300 transition-all hover:border-[#4540DB]/40 hover:text-white"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>

            {/* AI/ML Technologies */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#00D4FF]">AI / ML Technologies</h3>
              <div className="flex flex-wrap gap-3">
                {AI_PLATFORMS.map((platform) => (
                  <span
                    key={platform}
                    className="rounded-lg border border-[#00D4FF]/20 bg-[#00D4FF]/[0.06] px-4 py-2 text-xs font-medium text-gray-300 transition-all hover:border-[#00D4FF]/40 hover:text-white"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  CASE STUDY                                                   */}
      {/* ============================================================ */}
      <Section className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#4540DB]/40 bg-[#4540DB]/10 px-4 py-1.5 text-xs font-medium tracking-wide text-[#4540DB]">
              Case Study
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Automation & AI Hiring
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-red-400">Challenge</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Manufacturing client needed 3 PLC programmers and 1 ML engineer for a predictive maintenance project, with a 2-week deadline.
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#00D4FF]">Solution</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#00D4FF]" />Chartered Engineer-led screening</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#00D4FF]" />AI-matched candidate sourcing</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#00D4FF]" />Shortlist delivered in 48 hours</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">Result</h3>
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-2xl font-bold text-[#22C55E]">4 positions</p>
                  <p className="text-sm text-gray-400">Filled within 10 days</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#22C55E]">40%</p>
                  <p className="text-sm text-gray-400">Reduction in hiring time</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/employers"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#00D4FF] transition-colors hover:text-white"
            >
              See how we help employers
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  TESTIMONIALS                                                 */}
      {/* ============================================================ */}
      <Section className="py-20 sm:py-24 border-y border-white/[0.04]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              What Our Clients Say
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {[
              { quote: "OSCABE understood our Siemens TIA Portal requirements instantly. No hand-holding needed. The shortlist was technically spot-on.", name: "Meredith Decker", title: "Engineering Director, Manufacturing" },
              { quote: "We needed an ML engineer who also understood industrial data pipelines. OSCABE found us the perfect candidate in 3 days.", name: "Ezekiel Palmer", title: "Head of AI, Industry 4.0 Firm" },
              { quote: "Finally, a recruiter who knows the difference between a PLC and a PID loop. The candidates were pre-screened to a level I have never seen.", name: "Tiffany Cameron", title: "Controls Manager, Pharma" },
              { quote: "No upfront fees, 48-hour turnaround, and candidates who could actually discuss Allen-Bradley architecture. Exceptional service.", name: "Adam Lamp", title: "CTO, Automation Integrator" },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-gray-300 sm:text-base">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="mt-5">
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  REMOTE ENGINEERS PROMO                                       */}
      {/* ============================================================ */}
      <Section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[#00D4FF]/20 bg-[#00D4FF]/[0.03] p-8 sm:p-12">
            <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
              <div className="text-center lg:text-left">
                <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/40 bg-[#00D4FF]/10 px-4 py-1.5 text-xs font-medium tracking-wide text-[#00D4FF]">
                  <Globe className="h-3.5 w-3.5" />
                  New Service
                </span>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Remote Engineers from{" "}
                  <span className="text-[#22C55E]">{"\u00A3"}22,000/year</span>
                </h2>
                <p className="mt-3 max-w-lg text-sm text-gray-400">
                  Pre-screened Indian automation and AI engineers working remotely for your UK team. Same Chartered Engineer verification, 50-65% lower cost.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {[
                  { role: "PLC Engineer", saving: "\u00A326,000" },
                  { role: "ML Engineer", saving: "\u00A340,000" },
                  { role: "SCADA Engineer", saving: "\u00A333,000" },
                ].map((card) => (
                  <div
                    key={card.role}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-3 text-center"
                  >
                    <p className="text-xs text-gray-400">{card.role}</p>
                    <p className="mt-1 text-lg font-bold text-[#22C55E]">
                      Save {card.saving}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8 text-center lg:text-left">
              <Link
                href="/remote-engineers"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#00D4FF] transition-colors hover:text-white"
              >
                Explore Remote Engineers
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  CTA                                                          */}
      {/* ============================================================ */}
      <Section className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] px-8 py-16 backdrop-blur-sm sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to hire automation & AI talent?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
              Get Chartered Engineer-verified shortlists in 72 hours. No upfront fees.
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
      </Section>
    </div>
  );
}
