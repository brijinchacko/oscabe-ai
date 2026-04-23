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
  ClipboardList,
  Phone,
  Globe,
  Award,
  Brain,
  Bot,
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
const SPECIALISMS_PREVIEW = [
  {
    title: "Industrial Automation",
    description: "PLC, SCADA, DCS, controls, commissioning, panel design, safety systems",
    icon: Cpu,
    color: "#4540DB",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
  },
  {
    title: "AI / ML",
    description: "Machine learning, computer vision, NLP, MLOps, data science, predictive maintenance",
    icon: Brain,
    color: "#00D4FF",
    image: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&h=300&fit=crop",
  },
  {
    title: "Robotics",
    description: "FANUC, ABB, KUKA, Universal Robots, autonomous systems, robotics AI",
    icon: Bot,
    color: "#8B5CF6",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop",
  },
  {
    title: "Digital Twin",
    description: "Simulation, digital twin engineering, IoT platforms, edge computing",
    icon: Globe,
    color: "#22C55E",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
  },
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
                Remote automation and AI engineers -{" "}
                <span className="bg-gradient-to-r from-[#4540DB] to-[#00D4FF] bg-clip-text text-transparent">
                  Engineer-verified
                </span>
                , billed monthly
              </h1>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-gray-400 sm:text-lg">
                UK engineering teams hire senior PLC, SCADA, AI/ML and robotics engineers from India through OSCABE. Tested on the exact platforms you use. Managed by Wartens UK. 40-60% of UK salary cost.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#4540DB] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#4540DB]/25 transition-all hover:bg-[#4540DB]/90 hover:scale-105"
                >
                  Book a Call
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/remote-engineers"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  Browse Engineers
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#22C55E]" />Expert Led</span>
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#22C55E]" />ISO 9001:2015</span>
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#22C55E]" />GDPR Compliant</span>
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#22C55E]" />UK Startup National Winner 2025</span>
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
      {/*  TWO WAYS WE HELP                                            */}
      {/* ============================================================ */}
      <Section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Two Ways We Help
            </h2>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-5">
            {/* Card 1 - Remote Engineers (primary, larger) */}
            <div className="lg:col-span-3 rounded-2xl border border-[#4540DB]/30 bg-[#4540DB]/[0.04] p-8 sm:p-10 backdrop-blur-sm transition-all hover:border-[#4540DB]/50 hover:bg-[#4540DB]/[0.07]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4540DB]/15">
                  <Globe className="h-6 w-6 text-[#4540DB]" />
                </div>
                <span className="inline-flex rounded-full border border-[#4540DB]/40 bg-[#4540DB]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#4540DB]">
                  Primary Service
                </span>
              </div>
              <h3 className="mt-6 text-2xl font-bold text-white">Remote Engineers</h3>
              <p className="mt-2 text-lg font-semibold text-[#22C55E]">Save 40-60% on UK engineering costs</p>
              <p className="mt-4 text-sm leading-relaxed text-gray-400">
                Pre-screened Indian automation and AI engineers working remotely for your UK team. Senior Engineer verified. Managed from our Bangalore office. Monthly billing, no lock-in.
              </p>
              <Link
                href="/remote-engineers"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#4540DB] transition-colors hover:text-white"
              >
                Learn more
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Card 2 - UK Recruitment (secondary) */}
            <div className="lg:col-span-2 rounded-2xl border border-[#00D4FF]/20 bg-[#00D4FF]/[0.03] p-8 sm:p-10 backdrop-blur-sm transition-all hover:border-[#00D4FF]/40 hover:bg-[#00D4FF]/[0.06]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00D4FF]/15">
                  <Users className="h-6 w-6 text-[#00D4FF]" />
                </div>
                <span className="inline-flex rounded-full border border-[#00D4FF]/40 bg-[#00D4FF]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#00D4FF]">
                  UK Service
                </span>
              </div>
              <h3 className="mt-6 text-2xl font-bold text-white">UK Recruitment</h3>
              <p className="mt-2 text-lg font-semibold text-[#00D4FF]">72-hour shortlists, no upfront fees</p>
              <p className="mt-4 text-sm leading-relaxed text-gray-400">
                For roles that cannot go remote: commissioning, field service, panel wiring, on-site project leads. Pre-qualified UK candidates delivered fast.
              </p>
              <Link
                href="/uk-recruitment"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#00D4FF] transition-colors hover:text-white"
              >
                Learn more
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  WHY OSCABE                                                   */}
      {/* ============================================================ */}
      <Section className="py-20 sm:py-24 border-y border-white/[0.04]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Why Companies Choose OSCABE
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { icon: Shield, text: "Engineer-led technical screening", color: "#4540DB" },
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
      {/*  SPECIALISMS PREVIEW                                         */}
      {/* ============================================================ */}
      <Section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Our Specialisms
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-400">
              Deep expertise across industrial automation and artificial intelligence.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SPECIALISMS_PREVIEW.map((spec) => (
              <div
                key={spec.title}
                className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.06]"
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={spec.image}
                    alt={spec.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#010118] via-[#010118]/60 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ background: `${spec.color}30` }}
                    >
                      <spec.icon className="h-5 w-5" style={{ color: spec.color }} />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white">{spec.title}</h3>
                  <p className="mt-2 text-sm text-gray-400">{spec.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/specialisms"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#00D4FF] transition-colors hover:text-white"
            >
              View all specialisms by industry
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  TRUSTED BY                                                  */}
      {/* ============================================================ */}
      <Section className="py-16 sm:py-20 border-y border-white/[0.04]">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Trusted by Engineering Teams Across the UK
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            We work with manufacturers, system integrators, utilities, and technology companies across every sector. Our engineers are placed in teams that build and maintain the systems that power modern industry.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { metric: "6,000+", label: "Pre-Screened Engineers" },
              { metric: "72hrs", label: "Average Shortlist Delivery" },
              { metric: "97+", label: "Skills in Our Ontology" },
              { metric: "30%", label: "Average Cost Savings" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
                <p className="text-2xl font-bold text-[#00D4FF]">{item.metric}</p>
                <p className="mt-1 text-xs text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  AWARDS BANNER (compact)                                     */}
      {/* ============================================================ */}
      <AwardsBanner compact />

      {/* ============================================================ */}
      {/*  CTA                                                          */}
      {/* ============================================================ */}
      <Section className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] px-8 py-16 backdrop-blur-sm sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Start with a 20-minute conversation
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
              Tell us your engineering challenge. We will tell you whether remote, UK, or a blend is the right fit - no obligation.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-[#4540DB] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-[#4540DB]/25 transition-all hover:bg-[#4540DB]/90 hover:scale-105"
              >
                <Phone className="h-4 w-4" />
                Book a Call
              </Link>
              <Link
                href="/post-a-role"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
              >
                Submit a Requirement
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
