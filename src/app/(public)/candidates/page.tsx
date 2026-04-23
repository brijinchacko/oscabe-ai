"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle,
  Gift,
  Cpu,
  Brain,
  Wrench,
  GraduationCap,
  UserPlus,
  Search,
  MessageSquare,
  BadgeCheck,
  Bot,
  Eye,
  Network,
  Cog,
  Shield,
  BarChart3,
} from "lucide-react";
import { AwardsBanner } from "@/components/shared/awards-banner";

const WHY_POINTS = [
  "Access exclusive automation and AI roles not advertised elsewhere",
  "Get matched to positions that genuinely fit your technical skills and platform expertise",
  "Chartered Engineer-led skill verification that sets you apart from other candidates",
  "Free registration and job matching — no fees, ever",
  "Career guidance from professionals who understand your industry",
];

const AUTOMATION_CAREER_PATHS = [
  { title: "Controls & PLC", roles: ["PLC Programmer", "Controls Engineer", "SCADA Engineer", "DCS Engineer", "Safety Engineer"] },
  { title: "Robotics & Integration", roles: ["Robotics Engineer", "Systems Integrator", "Commissioning Engineer", "Field Service Engineer"] },
  { title: "Electrical & Design", roles: ["EC&I Engineer", "Panel Design Engineer", "Electrical Design Engineer", "BMS Engineer"] },
];

const AI_CAREER_PATHS = [
  { title: "Machine Learning", roles: ["ML Engineer", "Data Scientist", "MLOps Engineer", "AI Research Scientist"] },
  { title: "Computer Vision & NLP", roles: ["Computer Vision Engineer", "NLP Engineer", "AI Engineer", "Robotics AI Engineer"] },
  { title: "Data & Infrastructure", roles: ["Data Engineer", "IoT Engineer", "Digital Twin Engineer", "Automation Architect"] },
];

const STEPS = [
  {
    icon: UserPlus,
    step: "01",
    title: "Register",
    description:
      "Create your free profile and tell us about your automation or AI skills, platform expertise, and career goals.",
  },
  {
    icon: Search,
    step: "02",
    title: "Get Matched",
    description:
      "Our Chartered Engineers review your profile and match you with roles that fit your technical expertise.",
  },
  {
    icon: MessageSquare,
    step: "03",
    title: "Interview",
    description:
      "We prepare you with technical interview support and guide you through the entire hiring process.",
  },
  {
    icon: BadgeCheck,
    step: "04",
    title: "Get Hired",
    description:
      "Land your next automation or AI role with confidence. We stay in touch to ensure you are settled and thriving.",
  },
];

const CAREER_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
    alt: "Industrial automation engineering",
  },
  {
    src: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=600&h=400&fit=crop",
    alt: "AI and machine learning workspace",
  },
  {
    src: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&h=400&fit=crop",
    alt: "Robotics programming",
  },
  {
    src: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
    alt: "Control systems engineering",
  },
  {
    src: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=600&h=400&fit=crop",
    alt: "Factory automation",
  },
  {
    src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop",
    alt: "Engineering professional",
  },
];

export default function CandidatesPage() {
  return (
    <div className="bg-[#010118]">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#00D4FF]/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-[#00D4FF]/15 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Build Your Career in{" "}
                <span className="bg-gradient-to-r from-[#4540DB] to-[#00D4FF] bg-clip-text text-transparent">
                  Automation & AI
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 lg:mx-0">
                Whether you programme PLCs or train neural networks, OSCABE connects you with employers who value your specialist expertise. Access premium automation and AI roles across the UK.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#00D4FF] px-8 py-3.5 text-sm font-semibold text-[#010118] shadow-lg shadow-[#00D4FF]/25 transition-all hover:bg-[#00D4FF]/90 hover:scale-105"
                >
                  Browse Jobs
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  Register Now
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.08]">
                <Image
                  src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&h=700&fit=crop"
                  alt="Automation engineer at work"
                  width={600}
                  height={700}
                  className="h-auto w-full object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#010118]/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
                    <p className="text-sm font-medium text-white">
                      6,000+ engineers in our talent pool
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Across Industrial Automation and AI
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Career Paths Image Strip */}
      <section className="border-y border-white/[0.06] bg-white/[0.01] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-6 text-center text-sm font-medium uppercase tracking-widest text-gray-500">
            Automation & AI career paths we support
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {CAREER_IMAGES.map((img) => (
              <div
                key={img.src}
                className="group relative aspect-square overflow-hidden rounded-xl border border-white/[0.06]"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 33vw, 16vw"
                />
                <div className="absolute inset-0 bg-[#010118]/40 transition-opacity duration-300 group-hover:opacity-20" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Join OSCABE */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative hidden lg:block">
              <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
                <Image
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=500&fit=crop"
                  alt="Automation engineer working with control systems"
                  width={600}
                  height={500}
                  className="h-auto w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 rounded-xl border border-[#00D4FF]/20 bg-[#010118] p-4" style={{ boxShadow: "0 0 30px rgba(0,212,255,0.1)" }}>
                <p className="text-2xl font-bold text-[#00D4FF]">100%</p>
                <p className="text-xs text-gray-400">Free for candidates</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Why Join OSCABE
              </h2>
              <p className="mt-3 max-w-2xl text-gray-400">
                We specialise in placing automation and AI engineers. Here is what you get when you register.
              </p>
              <div className="mt-8 space-y-4">
                {WHY_POINTS.map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#00D4FF]" />
                    <p className="text-gray-400">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Career Paths */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Career Paths We Support
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-400">
              Whether you are on the factory floor or in the data lab, we have roles that match your expertise.
            </p>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {/* Automation Paths */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4540DB]/15">
                  <Cpu className="h-5 w-5 text-[#4540DB]" />
                </div>
                <h3 className="text-lg font-semibold text-white">Industrial Automation</h3>
              </div>
              <div className="space-y-4">
                {AUTOMATION_CAREER_PATHS.map((path) => (
                  <div
                    key={path.title}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm transition-all hover:border-[#4540DB]/30 hover:bg-white/[0.05]"
                  >
                    <h4 className="text-sm font-semibold text-[#4540DB]">{path.title}</h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {path.roles.map((role) => (
                        <span
                          key={role}
                          className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-gray-400"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Paths */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00D4FF]/15">
                  <Brain className="h-5 w-5 text-[#00D4FF]" />
                </div>
                <h3 className="text-lg font-semibold text-white">AI & Intelligent Systems</h3>
              </div>
              <div className="space-y-4">
                {AI_CAREER_PATHS.map((path) => (
                  <div
                    key={path.title}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm transition-all hover:border-[#00D4FF]/30 hover:bg-white/[0.05]"
                  >
                    <h4 className="text-sm font-semibold text-[#00D4FF]">{path.title}</h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {path.roles.map((role) => (
                        <span
                          key={role}
                          className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-gray-400"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              How It Works
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-400">
              From registration to your first day, we guide you through every step.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((item) => (
              <div
                key={item.title}
                className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]"
              >
                <span className="text-3xl font-bold text-[#00D4FF]/20">
                  {item.step}
                </span>
                <div className="mt-3 mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-[#00D4FF]/15">
                  <item.icon className="h-5 w-5 text-[#00D4FF]" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Refer & Earn */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-2xl border border-[#22C55E]/20 bg-white/[0.03] backdrop-blur-sm p-8 sm:p-10"
            style={{ boxShadow: "0 0 40px rgba(34,197,94,0.08)" }}
          >
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#22C55E]/15">
                <Gift className="h-8 w-8 text-[#22C55E]" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  Refer &amp; Earn &pound;200
                </h2>
                <p className="mt-2 text-gray-400">
                  Know an automation or AI engineer looking for their next role? Refer them to OSCABE and earn &pound;200 for every successful placement. It is that simple.
                </p>
              </div>
              <Link href="/refer">
                <button
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#22C55E] px-8 py-3 text-sm font-bold text-white shadow-xl transition-all hover:scale-105"
                  style={{ boxShadow: "0 0 30px rgba(34,197,94,0.4)" }}
                >
                  <Gift className="h-4 w-4" />
                  Start Referring
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Upskill */}
      <section className="overflow-hidden">
        <div
          className="py-16 sm:py-20"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(139,92,246,0.08) 50%, rgba(0,212,255,0.04) 100%)",
          }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-white sm:text-3xl">
                    Upskill Your Career
                  </h2>
                  <span className="rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3 py-1 text-xs font-semibold text-[#8B5CF6]">
                    Powered by Wartens
                  </span>
                </div>
                <p className="mt-3 max-w-2xl text-gray-400">
                  Take your automation or AI career further with expert-led training programmes. Whether you want to master Siemens TIA Portal, learn Python for ML, or sharpen your controls engineering skills, we have you covered.
                </p>
                <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-lg bg-[#8B5CF6]/15">
                  <GraduationCap className="h-6 w-6 text-[#8B5CF6]" />
                </div>
                <Link
                  href="/upskill"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-6 py-3 text-sm font-semibold text-[#8B5CF6] transition-all hover:bg-[#8B5CF6]/20"
                >
                  Explore Training Programmes
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="relative hidden lg:block">
                <div className="overflow-hidden rounded-2xl border border-[#8B5CF6]/20">
                  <Image
                    src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=450&fit=crop"
                    alt="Learning and professional development"
                    width={600}
                    height={450}
                    className="h-auto w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/20 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Awards */}
      <AwardsBanner compact accentColor="#00D4FF" />

      {/* CTA */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[#00D4FF]/20 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-5">
            <div className="relative hidden lg:col-span-2 lg:block">
              <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
                <Image
                  src="https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=600&h=500&fit=crop"
                  alt="Automation and AI career opportunities"
                  width={600}
                  height={500}
                  className="h-auto w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#010118]/60" />
              </div>
            </div>

            <div className="text-center lg:col-span-3 lg:text-left">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Ready for Your Next Automation or AI Role?
              </h2>
              <p className="mt-4 max-w-xl text-lg text-gray-400 lg:mx-0 mx-auto">
                Browse live roles or register today and let us match you with opportunities that fit your technical skills and career ambitions.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#00D4FF] px-8 py-4 text-sm font-semibold text-[#010118] shadow-lg shadow-[#00D4FF]/25 transition-all hover:bg-[#00D4FF]/90 hover:scale-105"
                >
                  Browse Jobs
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
