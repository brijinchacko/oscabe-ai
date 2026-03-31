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
  Building2,
  Monitor,
  Cpu,
  Briefcase,
  ClipboardList,
  Star,
  ChevronRight,
  Phone,
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

/* ================================================================== */
/*  PAGE                                                               */
/* ================================================================== */
export default function HomePage() {
  const [heroRef, heroVisible] = useInView(0.05);

  return (
    <div className="overflow-x-hidden bg-[#010118]">
      {/* ============================================================ */}
      {/*  SECTION 1 - HERO                                            */}
      {/* ============================================================ */}
      <section
        ref={heroRef}
        className="relative overflow-hidden"
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
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Hire top talent across<br />
                <span className="bg-gradient-to-r from-[#4540DB] to-[#00D4FF] bg-clip-text text-transparent">
                  operations, technology,
                </span><br />
                <span className="bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] bg-clip-text text-transparent">
                  and engineering.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-gray-400 sm:text-lg">
                Fast, cost-effective recruitment with pre-qualified candidates - without traditional agency overhead.
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
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  Submit a Role
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#22C55E]" />72hr shortlists</span>
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#22C55E]" />No upfront fees</span>
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#22C55E]" />Pre-screened candidates</span>
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
                    src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop"
                    alt="Business operations team meeting"
                    width={400}
                    height={300}
                    className="h-48 w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
                  <Image
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop"
                    alt="Engineering and technology"
                    width={400}
                    height={400}
                    className="h-56 w-full object-cover"
                  />
                </div>
              </div>
              <div className="mt-8 space-y-4">
                <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
                  <Image
                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=400&fit=crop"
                    alt="Team collaboration"
                    width={400}
                    height={400}
                    className="h-56 w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
                  <Image
                    src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop"
                    alt="Industrial automation engineer"
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
      {/*  IMAGE STRIP - Industry sectors                               */}
      {/* ============================================================ */}
      <Section className="border-y border-white/[0.04] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop", label: "Business & Operations" },
              { src: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&h=400&fit=crop", label: "Technology & Digital" },
              { src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop", label: "Engineering" },
              { src: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop", label: "Professional Services" },
            ].map((item) => (
              <div key={item.label} className="group relative overflow-hidden rounded-xl">
                <Image
                  src={item.src}
                  alt={item.label}
                  width={600}
                  height={400}
                  className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-110 sm:h-48"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <p className="absolute bottom-3 left-3 text-xs font-semibold text-white sm:text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  SECTION 2 - ROLES WE SUPPORT                                */}
      {/* ============================================================ */}
      <Section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Roles We Support
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-400">
              From front office to factory floor, we source talent across every function.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Business & Operations */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 backdrop-blur-sm transition-all hover:border-[#4540DB]/30 hover:bg-white/[0.04]">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#4540DB]/15">
                <Briefcase className="h-7 w-7 text-[#4540DB]" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">Business & Operations</h3>
              <ul className="mt-4 space-y-2.5">
                {["Admin & Office Support", "Business Analyst", "Project Manager", "HR & People Operations", "Operations Manager", "Procurement & Supply Chain"].map((role) => (
                  <li key={role} className="flex items-center gap-2 text-sm text-gray-400">
                    <ChevronRight className="h-3.5 w-3.5 text-[#4540DB]" />
                    {role}
                  </li>
                ))}
              </ul>
            </div>

            {/* Technology & Digital */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 backdrop-blur-sm transition-all hover:border-[#00D4FF]/30 hover:bg-white/[0.04]">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#00D4FF]/15">
                <Monitor className="h-7 w-7 text-[#00D4FF]" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">Technology & Digital</h3>
              <ul className="mt-4 space-y-2.5">
                {["Software Developers", "QA & Testing Engineers", "Data & AI Specialists", "DevOps & Cloud Engineers", "IT Support & Infrastructure", "Cybersecurity Analysts"].map((role) => (
                  <li key={role} className="flex items-center gap-2 text-sm text-gray-400">
                    <ChevronRight className="h-3.5 w-3.5 text-[#00D4FF]" />
                    {role}
                  </li>
                ))}
              </ul>
            </div>

            {/* Engineering */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 backdrop-blur-sm transition-all hover:border-[#8B5CF6]/30 hover:bg-white/[0.04]">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#8B5CF6]/15">
                <Cpu className="h-7 w-7 text-[#8B5CF6]" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">Engineering</h3>
              <ul className="mt-4 space-y-2.5">
                {["Industrial Automation", "PLC & SCADA Engineers", "Controls Engineers", "Commissioning Engineers", "Robotics Engineers", "EC&I / Electrical Engineers"].map((role) => (
                  <li key={role} className="flex items-center gap-2 text-sm text-gray-400">
                    <ChevronRight className="h-3.5 w-3.5 text-[#8B5CF6]" />
                    {role}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/industries"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#00D4FF] transition-colors hover:text-white"
            >
              View all industries we support
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  SECTION 3 - WHY OSCABE                                      */}
      {/* ============================================================ */}
      <Section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Why Companies Choose Oscabe
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { icon: Clock, text: "Shortlists delivered within 72 hours", color: "#4540DB" },
              { icon: Shield, text: "Pre-qualified candidates (not just CVs)", color: "#00D4FF" },
              { icon: Zap, text: "No upfront recruitment fees", color: "#22C55E" },
              { icon: Users, text: "Flexible hiring support", color: "#8B5CF6" },
              { icon: ClipboardList, text: "Technical screening expertise", color: "#F59E0B" },
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
              Oscabe vs Traditional Recruitment Agencies
            </h2>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2">
            <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.02] p-8">
              <h3 className="text-lg font-bold text-red-400">Traditional Agencies</h3>
              <ul className="mt-6 space-y-4">
                {[
                  "High retainers and upfront fees",
                  "Slow delivery timelines",
                  "CV forwarding without validation",
                  "Generic, one-size-fits-all approach",
                  "Limited accountability on quality",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-400">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400 text-xs">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-[#22C55E]/25 bg-[#22C55E]/[0.02] p-8">
              <h3 className="text-lg font-bold text-[#22C55E]">Oscabe</h3>
              <ul className="mt-6 space-y-4">
                {[
                  "No upfront cost",
                  "Shortlist in 72 hours",
                  "Pre-screened, qualified candidates",
                  "Flexible pricing to suit your needs",
                  "Technical screening by domain experts",
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
      {/*  SECTION 4 - HOW IT WORKS                                    */}
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
                { step: 1, title: "Understand Your Requirement", description: "We take the time to understand your role, team, and culture.", color: "#4540DB" },
                { step: 2, title: "Source & Pre-Screen", description: "We identify, assess, and pre-qualify candidates before you see them.", color: "#00D4FF" },
                { step: 3, title: "Deliver Shortlist in 72 Hours", description: "You receive a curated shortlist of ready-to-interview candidates.", color: "#8B5CF6" },
                { step: 4, title: "Support Through Hiring", description: "We manage interviews, offers, and onboarding support.", color: "#22C55E" },
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
      {/*  CASE STUDY                                                   */}
      {/* ============================================================ */}
      <Section className="py-20 sm:py-24 border-y border-white/[0.04]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#4540DB]/40 bg-[#4540DB]/10 px-4 py-1.5 text-xs font-medium tracking-wide text-[#4540DB]">
              Case Study
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Engineering / Technical Hiring
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-red-400">Challenge</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Client needed urgent hiring support with limited time and budget constraints for critical technical positions.
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#00D4FF]">Solution</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#00D4FF]" />Rapid sourcing</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#00D4FF]" />Pre-screening & validation</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#00D4FF]" />Delivered shortlist in 3 days</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">Result</h3>
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-2xl font-bold text-[#22C55E]">2 positions</p>
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
              href="/pricing"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#00D4FF] transition-colors hover:text-white"
            >
              View all case studies
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  TESTIMONIALS                                                 */}
      {/* ============================================================ */}
      <Section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              What Our Clients Say
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {[
              { quote: "OSCABE delivered a shortlist of pre-qualified candidates within 48 hours. The quality was exceptional.", name: "Meredith Decker", title: "Engineering Director" },
              { quote: "No upfront fees, fast turnaround, and candidates who actually matched our requirements. Refreshing.", name: "Ezekiel Palmer", title: "Operations Manager" },
              { quote: "Finally, a recruitment partner who understands technical roles. No more explaining what we need.", name: "Tiffany Cameron", title: "HR Manager" },
              { quote: "The speed was incredible. Pre-screened candidates ready to interview, not just CVs to sift through.", name: "Adam Lamp", title: "CTO" },
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
      {/*  SECTION 5 - CTA                                             */}
      {/* ============================================================ */}
      <Section className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] px-8 py-16 backdrop-blur-sm sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Struggling with slow or expensive recruitment?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
              Let&apos;s fix that. Get pre-qualified candidates, fast.
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
