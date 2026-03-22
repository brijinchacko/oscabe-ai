"use client";

import { useState, useEffect, useRef, type RefObject } from "react";
import Link from "next/link";
import {
  Cpu,
  Cog,
  Rocket,
  SlidersHorizontal,
  Monitor,
  Wrench,
  ClipboardList,
  Zap,
  Bot,
  Settings,
  Users,
  Target,
  Building2,
  Handshake,
  Star,
  Shield,
  Award,
  BadgeCheck,
  BrainCircuit,
  ArrowRight,
  FileText,
  Search,
  UserCheck,
  Briefcase,
  TrendingUp,
  Globe,
  DollarSign,
  Layers,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";
import {
  APP_NAME,
  ROLES_WE_RECRUIT,
  PLATFORMS,
} from "@/lib/constants";
import { useSiteMode, type SiteMode } from "@/components/providers/site-mode-provider";
import { AwardsBanner } from "@/components/shared/awards-banner";
import { AbstractBg } from "@/components/shared/abstract-bg";

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

function AnimatedCounter({ end, suffix = "", duration = 2000, start }: { end: number; suffix?: string; duration?: number; start: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [start, end, duration]);
  return <span>{count}{suffix}</span>;
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
/*  Mode accent colors                                                 */
/* ------------------------------------------------------------------ */
const MODE_COLORS: Record<SiteMode, { primary: string; glow: string; gradient: string; bgGlow: string }> = {
  employers: {
    primary: "#4540DB",
    glow: "shadow-[#4540DB]/30",
    gradient: "from-[#4540DB] to-[#6366F1]",
    bgGlow: "bg-[#4540DB]",
  },
  candidates: {
    primary: "#00D4FF",
    glow: "shadow-[#00D4FF]/30",
    gradient: "from-[#00D4FF] to-[#06B6D4]",
    bgGlow: "bg-[#00D4FF]",
  },
  agencies: {
    primary: "#8B5CF6",
    glow: "shadow-[#8B5CF6]/30",
    gradient: "from-[#8B5CF6] to-[#A78BFA]",
    bgGlow: "bg-[#8B5CF6]",
  },
};

/* ------------------------------------------------------------------ */
/*  Role icons                                                         */
/* ------------------------------------------------------------------ */
const ROLE_ICONS: LucideIcon[] = [
  Cpu, Cog, Monitor, Rocket, SlidersHorizontal, Bot, Zap,
  ClipboardList, Wrench, Settings, Shield, Target, Monitor,
  SlidersHorizontal, Shield, Settings, ClipboardList, Wrench,
];

/* ================================================================== */
/*  MODE-SPECIFIC CONTENT                                              */
/* ================================================================== */

interface HeroContent {
  badge: string;
  badgeIcon: LucideIcon;
  headline: string;
  highlight: string;
  subtitle: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  stats: Array<{ end?: number; suffix?: string; value?: string; label: string }>;
}

const HERO_CONTENT: Record<SiteMode, HeroContent> = {
  employers: {
    badge: "Powered by 3BOX AI",
    badgeIcon: BrainCircuit,
    headline: "Hire Verified Automation Engineers",
    highlight: "Within 48 Hours",
    subtitle: "PLC \u00B7 SCADA \u00B7 Controls \u00B7 Robotics \u00B7 EC&I \u00B7 Commissioning",
    description: `${APP_NAME} uses AI to match your roles with technically verified automation engineers. No more sifting through unqualified CVs \u2014 every candidate is skill-tested before you see them.`,
    primaryCta: { label: "Post a Role", href: "/post-a-role" },
    secondaryCta: { label: "How It Works", href: "/employers" },
    stats: [
      { end: 500, suffix: "+", label: "Verified Engineers" },
      { end: 13, suffix: "+", label: "Years in Automation" },
      { value: "48hr", label: "Average Shortlist" },
    ],
  },
  candidates: {
    badge: "Career Accelerator",
    badgeIcon: Rocket,
    headline: "Your Skills, Verified.",
    highlight: "Your Career, Accelerated",
    subtitle: "PLC \u00B7 SCADA \u00B7 Controls \u00B7 Robotics \u00B7 EC&I \u00B7 Commissioning",
    description: `Showcase your verified automation skills to top employers. ${APP_NAME} matches you with premium roles that fit your expertise \u2014 no more generic job boards.`,
    primaryCta: { label: "Browse Jobs", href: "/jobs" },
    secondaryCta: { label: "Why OSCABE", href: "/candidates" },
    stats: [
      { end: 200, suffix: "+", label: "Active Roles" },
      { end: 95, suffix: "%", label: "Placement Rate" },
      { value: "\u00A340k+", label: "Avg. Starting Salary" },
    ],
  },
  agencies: {
    badge: "Partner Network",
    badgeIcon: Handshake,
    headline: "Expand Your Reach in",
    highlight: "Industrial Automation",
    subtitle: "Split Fees \u00B7 Verified Talent Pool \u00B7 White-Label Tools \u00B7 AI Matching",
    description: `Partner with ${APP_NAME} to access our verified talent pool, collaborate on roles, and earn split fees. Bigger reach, better placements, smarter tools.`,
    primaryCta: { label: "Partner With Us", href: "/contact" },
    secondaryCta: { label: "Our Products", href: "/agencies" },
    stats: [
      { end: 50, suffix: "+", label: "Agency Partners" },
      { end: 500, suffix: "+", label: "Verified Engineers" },
      { value: "20+", label: "Platforms Covered" },
    ],
  },
};

interface FeatureContent { icon: LucideIcon; title: string; description: string }
interface StepContent { step: number; title: string; description: string; icon: LucideIcon }
interface TestimonialContent { quote: string; name: string; title: string }
interface CtaContent { headline: string; description: string; primaryCta: { label: string; href: string }; secondaryCta: { label: string; href: string } }

const FEATURES_CONTENT: Record<SiteMode, FeatureContent[]> = {
  employers: [
    { icon: BrainCircuit, title: "AI-Powered Matching", description: "True skill understanding \u2014 not keyword matching. Our AI analyses your role requirements against verified candidate profiles." },
    { icon: BadgeCheck, title: "Technical Verification", description: "Every candidate is skill-tested on the platforms you use \u2014 Siemens, Allen-Bradley, Schneider, and 20+ more." },
    { icon: Zap, title: "48-Hour Shortlists", description: "Receive a curated shortlist of pre-verified engineers within 48 hours of posting your role." },
    { icon: Shield, title: "Quality Guarantee", description: "Chartered Engineer-led verification. If a candidate doesn\u2019t meet your standards, we replace them free." },
    { icon: DollarSign, title: "No Upfront Costs", description: "Pay only when you hire. Competitive percentage-based fees with no retainer or subscription." },
    { icon: Target, title: "Niche Expertise", description: "13+ years specialising exclusively in industrial automation. We speak your language." },
  ],
  candidates: [
    { icon: BadgeCheck, title: "Get Skill-Verified", description: "Prove your expertise with our assessments. Verified candidates get 3x more interview invitations." },
    { icon: Briefcase, title: "Premium Roles Only", description: "Exclusive positions with top automation employers \u2014 roles you won\u2019t find on generic boards." },
    { icon: TrendingUp, title: "Career Growth", description: "Career guidance, salary benchmarking, and skill gap analysis to accelerate your progression." },
    { icon: FileText, title: "AI CV Enhancement", description: "Our AI analyses your CV and suggests improvements to highlight your automation expertise." },
    { icon: UserCheck, title: "Personal Consultant", description: "A dedicated automation recruitment specialist who understands your skills and career goals." },
    { icon: Globe, title: "UK & Europe", description: "Access roles across the UK and Europe. Remote, hybrid, and on-site opportunities." },
  ],
  agencies: [
    { icon: Users, title: "Verified Talent Pool", description: "500+ pre-verified automation engineers. Every candidate skill-tested and ready to place." },
    { icon: DollarSign, title: "Split-Fee Network", description: "Transparent split-fee arrangements with no hidden costs. Collaborate and earn." },
    { icon: BrainCircuit, title: "White-Label AI Tools", description: "Our AI matching and verification tools under your own brand." },
    { icon: Layers, title: "OSCABE Verify", description: "Offer technical verification as a service. Skill-test candidates on 20+ platforms." },
    { icon: Search, title: "Marketplace Access", description: "List and discover roles across the partner network. Fill more, earn more." },
    { icon: Shield, title: "Chartered Engineer QA", description: "All verifications overseen by chartered engineers. Credibility in every placement." },
  ],
};

const STEPS_CONTENT: Record<SiteMode, StepContent[]> = {
  employers: [
    { step: 1, icon: FileText, title: "Post Your Role", description: "Tell us what you need \u2014 skills, platforms, experience. Takes under 5 minutes." },
    { step: 2, icon: BrainCircuit, title: "AI Matches & Verifies", description: "Our AI finds and skill-tests candidates against your specific requirements." },
    { step: 3, icon: UserCheck, title: "Hire With Confidence", description: "Interview pre-verified engineers. Average shortlist time: 48 hours." },
  ],
  candidates: [
    { step: 1, icon: FileText, title: "Upload Your CV", description: "Create your profile. Our AI parses your skills and experience automatically." },
    { step: 2, icon: BadgeCheck, title: "Get Verified", description: "Complete our technical assessment on the platforms you know." },
    { step: 3, icon: Briefcase, title: "Get Matched", description: "Receive personalised job matches. Apply with one click." },
  ],
  agencies: [
    { step: 1, icon: Handshake, title: "Join the Network", description: "Apply as an OSCABE partner. Get your agency dashboard and API access." },
    { step: 2, icon: Search, title: "Access & Collaborate", description: "Browse verified candidates, list roles, collaborate with partners." },
    { step: 3, icon: DollarSign, title: "Place & Earn", description: "Make placements. Transparent split-fee payments within 30 days." },
  ],
};

const TESTIMONIALS_CONTENT: Record<SiteMode, TestimonialContent[]> = {
  employers: [
    { quote: "OSCABE\u2019s AI matching saved us weeks. We hired two PLC engineers within 10 days.", name: "Meredith Decker", title: "Engineering Director" },
    { quote: "Every candidate genuinely knew their way around TIA Portal. The verification works.", name: "Ezekiel Palmer", title: "Operations Manager" },
    { quote: "Finally, a recruiter who understands automation. No more explaining what SCADA is.", name: "Tiffany Cameron", title: "HR Manager" },
    { quote: "48-hour shortlists with candidates who actually matched. Incredible speed.", name: "Adam Lamp", title: "CTO" },
  ],
  candidates: [
    { quote: "Getting verified opened doors I didn\u2019t know existed. Three interviews in a week.", name: "Ravi Mehta", title: "Senior PLC Engineer" },
    { quote: "OSCABE understood my SCADA experience like no other recruiter. Spot-on matches.", name: "Sophie Lawrence", title: "SCADA Specialist" },
    { quote: "They negotiated 15% above what I expected. They genuinely advocate for candidates.", name: "James Okonkwo", title: "Controls Engineer" },
    { quote: "No spam, no irrelevant roles. Every match was a genuine fit for my background.", name: "Elena Vasquez", title: "Robotics Engineer" },
  ],
  agencies: [
    { quote: "Verified talent pool saved us months of sourcing. Three placements in Q1.", name: "David Chen", title: "MD, TechStaff" },
    { quote: "OSCABE Verify adds real credibility. Clients trust technically assessed candidates.", name: "Sarah Mitchell", title: "Ops Lead, EngRecruit" },
    { quote: "Transparent split-fee model. We\u2019ve expanded our automation desk significantly.", name: "Mark Thompson", title: "Director, IndustrialTalent" },
    { quote: "White-label AI tools under our brand \u2014 clients think we built it.", name: "Lisa Park", title: "CEO, AutomateHR" },
  ],
};

const CTA_CONTENT: Record<SiteMode, CtaContent> = {
  employers: {
    headline: "Ready to Hire Automation Engineers?",
    description: "Post a role and get AI-matched, verified candidates within 48 hours.",
    primaryCta: { label: "Post a Role", href: "/post-a-role" },
    secondaryCta: { label: "Talk to Our Team", href: "/contact" },
  },
  candidates: {
    headline: "Ready to Accelerate Your Career?",
    description: "Get verified and access premium automation roles across the UK and Europe.",
    primaryCta: { label: "Browse Jobs", href: "/jobs" },
    secondaryCta: { label: "Register Your Interest", href: "/contact" },
  },
  agencies: {
    headline: "Ready to Partner With OSCABE?",
    description: "Join our network for verified talent, AI tools, and split-fee opportunities.",
    primaryCta: { label: "Partner With Us", href: "/contact" },
    secondaryCta: { label: "View Products", href: "/agencies" },
  },
};

/* ================================================================== */
/*  PAGE                                                               */
/* ================================================================== */
export default function HomePage() {
  const [heroRef, heroVisible] = useInView(0.05);
  const { mode } = useSiteMode();

  const hero = HERO_CONTENT[mode];
  const features = FEATURES_CONTENT[mode];
  const steps = STEPS_CONTENT[mode];
  const testimonials = TESTIMONIALS_CONTENT[mode];
  const cta = CTA_CONTENT[mode];
  const colors = MODE_COLORS[mode];

  return (
    <div className="overflow-x-hidden bg-[#02012B]">
      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section ref={heroRef} className="relative overflow-hidden">
        {/* Abstract SVG background */}
        <AbstractBg accentColor={colors.primary} variant="hero" />

        {/* Animated grid background */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        {/* Gradient orbs */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full blur-[120px]" style={{ background: `${colors.primary}15` }} />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full blur-[120px]" style={{ background: `${colors.primary}10` }} />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]" style={{ background: `${colors.primary}08` }} />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8 lg:pb-32 lg:pt-24">
          {/* Centered hero content */}
          <div className="mx-auto max-w-4xl text-center">
            <div className={`transition-all duration-700 ease-out ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              {/* Badge */}
              <span
                className="mb-8 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-wider"
                style={{ borderColor: `${colors.primary}40`, background: `${colors.primary}10`, color: colors.primary }}
              >
                <hero.badgeIcon className="h-3.5 w-3.5" />
                {hero.badge}
              </span>

              {/* Headline */}
              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                {hero.headline}
                <br />
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${colors.primary}, ${colors.primary}99)` }}>
                  {hero.highlight}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-6 text-base font-medium tracking-wide sm:text-lg" style={{ color: `${colors.primary}CC` }}>
                {hero.subtitle}
              </p>

              {/* Description */}
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg">
                {hero.description}
              </p>

              {/* CTAs */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href={hero.primaryCta.href}
                  className="group inline-flex items-center gap-2 rounded-xl px-8 py-4 text-sm font-bold text-white shadow-xl transition-all hover:scale-105"
                  style={{ background: colors.primary, boxShadow: `0 8px 30px ${colors.primary}40` }}
                >
                  {hero.primaryCta.label}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href={hero.secondaryCta.href}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  {hero.secondaryCta.label}
                </Link>
              </div>
            </div>
          </div>

          {/* Stats row - below hero, full width */}
          <div className={`mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 lg:mt-20 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} transition-all delay-300 duration-700 ease-out`}>
            {hero.stats.map((stat) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-center backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.06] sm:p-8"
              >
                {/* Subtle glow on hover */}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ background: `radial-gradient(circle at center, ${colors.primary}08, transparent 70%)` }} />
                <p className="relative text-3xl font-extrabold sm:text-4xl lg:text-5xl" style={{ color: colors.primary }}>
                  {stat.value ? stat.value : <AnimatedCounter end={stat.end!} suffix={stat.suffix} start={heroVisible} />}
                </p>
                <p className="relative mt-2 text-sm font-medium text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TRUST BAR                                                   */}
      {/* ============================================================ */}
      <Section className="border-y border-white/[0.06] bg-white/[0.02] py-8 sm:py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-4 sm:gap-12 sm:px-6 lg:px-8">
          {[
            { icon: Shield, text: "Chartered Engineer Led" },
            { icon: Award, text: "Startup of the Year 2025" },
            { icon: BadgeCheck, text: "ISO 9001:2015" },
            { icon: BrainCircuit, text: "Powered by 3BOX AI" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <item.icon className="h-5 w-5" style={{ color: colors.primary }} />
              <span className="text-sm font-medium text-gray-500">{item.text}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  FEATURES                                                    */}
      {/* ============================================================ */}
      <Section className="relative overflow-hidden py-24">
        {/* Abstract SVG background */}
        <AbstractBg accentColor={colors.primary} variant="section" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {mode === "employers" && "Why Employers Choose OSCABE"}
              {mode === "candidates" && "Why Engineers Trust OSCABE"}
              {mode === "agencies" && "Why Agencies Partner With OSCABE"}
            </h2>
            <p className="mt-4 text-base text-gray-400 sm:text-lg">
              {mode === "employers" && "Everything you need to hire verified automation engineers, fast."}
              {mode === "candidates" && "The smarter way to find your next automation role."}
              {mode === "agencies" && "Tools, talent, and technology to scale your automation desk."}
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm transition-all duration-500 hover:border-white/[0.15] hover:bg-white/[0.06] ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Icon */}
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: `${colors.primary}15` }}
                >
                  <feature.icon className="h-6 w-6" style={{ color: colors.primary }} />
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">{feature.description}</p>

                {/* Hover glow */}
                <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-100" style={{ background: `${colors.primary}10` }} />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  BUSINESS MODEL HIGHLIGHTS                                   */}
      {/* ============================================================ */}
      <Section className="border-y border-white/[0.06] bg-white/[0.02] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {mode === "employers" && "Flexible Hiring Models"}
              {mode === "candidates" && "Your Career, Your Way"}
              {mode === "agencies" && "Partnership Revenue Streams"}
            </h2>
            <p className="mt-3 text-base text-gray-400">
              {mode === "employers" && "Choose the pricing model that works for your business."}
              {mode === "candidates" && "Free to join, with premium options to accelerate your career."}
              {mode === "agencies" && "Multiple ways to grow your revenue with OSCABE."}
            </p>
          </div>

          {mode === "employers" && (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "Flat-Fee Shortlists", price: "From \u00A31,500", desc: "One-off shortlist of verified candidates" },
                { title: "Subscriptions", price: "From \u00A3999/mo", desc: "Ongoing access to verified talent" },
                { title: "Hybrid Retainer", price: "\u00A3999/mo + 8%", desc: "Retained search with reduced fee" },
                { title: "Contingency", price: "12\u201318% on hire", desc: "Pay only when you hire" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-5 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]"
                >
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <p className="mt-1 text-lg font-extrabold" style={{ color: colors.primary }}>{item.price}</p>
                  <p className="mt-1 text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          )}

          {mode === "candidates" && (
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { title: "Free Registration", price: "Free", desc: "Get verified, access premium roles" },
                { title: "Premium Membership", price: "\u00A39.99/month", desc: "Priority access + career intelligence" },
                { title: "Refer & Earn", price: "\u00A3200", desc: "Per successful referral placement" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-5 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]"
                >
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <p className="mt-1 text-lg font-extrabold" style={{ color: colors.primary }}>{item.price}</p>
                  <p className="mt-1 text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          )}

          {mode === "agencies" && (
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { title: "OSCABE Verify", price: "From \u00A330/assessment", desc: "White-label skill verification" },
                { title: "Split-Fee Network", price: "Collaborate & earn", desc: "Transparent split-fee placements" },
                { title: "Talent Radar", price: "\u00A3499/month", desc: "Market intel and first-look access" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-5 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]"
                >
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <p className="mt-1 text-lg font-extrabold" style={{ color: colors.primary }}>{item.price}</p>
                  <p className="mt-1 text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href={mode === "employers" ? "/pricing" : mode === "candidates" ? "/candidates" : "/agencies"}
              className="inline-flex items-center gap-1 text-sm font-semibold transition-colors hover:underline"
              style={{ color: colors.primary }}
            >
              {mode === "employers" && "View All Pricing"}
              {mode === "candidates" && "Learn More"}
              {mode === "agencies" && "View Partnership Options"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  ROLES WE RECRUIT                                            */}
      {/* ============================================================ */}
      <Section className="border-y border-white/[0.06] bg-white/[0.02] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {mode === "candidates" ? "Roles You Can Apply For" : "Roles We Recruit"}
            </h2>
            <p className="mt-4 text-base text-gray-400">
              Specialist automation recruitment across every discipline.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {ROLES_WE_RECRUIT.map((role, i) => {
              const Icon = ROLE_ICONS[i % ROLE_ICONS.length];
              return (
                <div
                  key={role}
                  className="group flex flex-col items-center rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center transition-all hover:border-white/[0.15] hover:bg-white/[0.06]"
                >
                  <Icon className="h-5 w-5 text-gray-500 transition-colors group-hover:text-white" style={{ color: undefined }} />
                  <span className="mt-2 text-xs font-semibold leading-tight text-gray-400 transition-colors group-hover:text-white sm:text-sm">
                    {role}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm font-semibold text-gray-500">Platforms we cover:</p>
            <p className="mx-auto mt-2 max-w-4xl text-xs leading-relaxed text-gray-600 sm:text-sm">
              {PLATFORMS.join(" \u00B7 ")}
            </p>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  HOW IT WORKS                                                */}
      {/* ============================================================ */}
      <Section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-base text-gray-400">
              {mode === "employers" && "Three simple steps to your next great hire."}
              {mode === "candidates" && "Three steps to your next automation role."}
              {mode === "agencies" && "Three steps to start earning with OSCABE."}
            </p>
          </div>

          <div className="relative mt-16">
            {/* Connecting line */}
            <div
              className="absolute top-16 left-[16.67%] right-[16.67%] hidden h-[2px] lg:block"
              style={{ background: `linear-gradient(90deg, transparent, ${colors.primary}30, transparent)` }}
            />

            <div className="grid gap-10 sm:grid-cols-3">
              {steps.map((item) => (
                <div key={item.step} className="relative flex flex-col items-center text-center">
                  <div
                    className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-extrabold text-white shadow-xl sm:h-20 sm:w-20 sm:text-2xl"
                    style={{ background: colors.primary, boxShadow: `0 8px 30px ${colors.primary}30` }}
                  >
                    {item.step}
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  TESTIMONIALS                                                */}
      {/* ============================================================ */}
      <Section className="border-y border-white/[0.06] bg-white/[0.02] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {mode === "employers" && "What Our Clients Say"}
              {mode === "candidates" && "What Engineers Say"}
              {mode === "agencies" && "What Partners Say"}
            </h2>
            <p className="mt-4 text-base text-gray-400">
              {mode === "employers" && "Trusted by engineering teams across the UK and Europe."}
              {mode === "candidates" && "Engineers who found their next role through OSCABE."}
              {mode === "agencies" && "Agencies who\u2019ve grown with OSCABE."}
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm"
              >
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="mt-5 text-base leading-relaxed text-gray-300">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: `${colors.primary}30` }}>
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  AWARDS                                                      */}
      {/* ============================================================ */}
      <Section>
        <AwardsBanner accentColor={colors.primary} />
      </Section>

      {/* ============================================================ */}
      {/*  CTA                                                         */}
      {/* ============================================================ */}
      <Section className="relative py-24">
        {/* Large glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[400px] w-[600px] rounded-full blur-[150px]" style={{ background: `${colors.primary}12` }} />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {cta.headline}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base text-gray-400 sm:text-lg">
            {cta.description}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={cta.primaryCta.href}
              className="group inline-flex items-center gap-2 rounded-xl px-8 py-4 text-sm font-bold text-white shadow-xl transition-all hover:scale-105"
              style={{ background: colors.primary, boxShadow: `0 8px 30px ${colors.primary}40` }}
            >
              {cta.primaryCta.label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href={cta.secondaryCta.href}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              {cta.secondaryCta.label}
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
