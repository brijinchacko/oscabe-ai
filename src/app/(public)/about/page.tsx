import Link from "next/link";
import Image from "next/image";
import {
  Wrench,
  Award,
  Building2,
  ArrowRight,
  Users,
  Cpu,
  Globe,
  GraduationCap,
  Bot,
  Layers,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  COMPANY_NAME,
  COMPANY_NUMBER,
  COMPANY_ADDRESS,
  AWARDS,
} from "@/lib/constants";

const WARTENS_BRANDS = [
  { name: "OSCABE", description: "AI-powered recruitment for automation engineers", icon: Users },
  { name: "TraininginPLC.com", description: "Online PLC and SCADA training platform", icon: GraduationCap },
  { name: "edWartens", description: "Structured industrial training and certifications", icon: Layers },
  { name: "roboTED", description: "Subscription-based robotics services", icon: Bot },
  { name: "IUNI", description: "AI, VR/AR, and digital platform development", icon: Cpu },
  { name: "Wemelt", description: "Additive manufacturing and 3D printing", icon: Building2 },
];

export default function AboutPage() {
  return (
    <div className="bg-[#02012B]">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#4540DB]/20 blur-[120px]" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-[#00D4FF]/15 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#4540DB]/40 bg-[#4540DB]/10 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#4540DB]">
            <Globe className="h-3.5 w-3.5" />
            Part of the Wartens Ecosystem
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            About OSCABE
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            The AI recruiter built for industrial automation. Part of Wartens, a global automation ecosystem serving 30,000+ companies across the UK, USA, UAE, and India.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                Our Story
              </h2>
              <div className="mt-6 space-y-4 text-gray-400 leading-relaxed">
                <p>
                  OSCABE was born from a simple observation: recruitment in industrial automation was fundamentally broken. Too many generic recruiters who could not tell a PLC from a PID loop, and too many talented engineers slipping through the cracks.
                </p>
                <p>
                  Founded as part of Wartens, a global automation ecosystem that brings together training, recruitment, robotics, and next-generation technology solutions, OSCABE was built with an unfair advantage. We are not just recruiters who learned automation. We are automation specialists who built a recruitment platform.
                </p>
                <p>
                  With 13+ years of sector expertise and the power of 3BOX AI, we created the first AI-driven recruitment platform purpose-built for PLC, SCADA, controls, robotics, and EC&I engineers. Every candidate is technically verified. Every match is AI-powered. Every placement is engineer-reviewed.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Cpu, value: "13+", label: "Years of sector expertise", color: "#4540DB" },
                { icon: Users, value: "30k+", label: "Companies served globally", color: "#00D4FF" },
                { icon: Building2, value: "20+", label: "PLC platforms covered", color: "#4540DB" },
                { icon: Award, value: "48hr", label: "Average time to shortlist", color: "#00D4FF" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-center backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.06]">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `${stat.color}15` }}>
                    <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
                  </div>
                  <p className="mt-3 text-2xl font-extrabold text-white">{stat.value}</p>
                  <p className="mt-1 text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Engineer-Led */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#4540DB]/15">
              <Wrench className="h-6 w-6 text-[#4540DB]" />
            </div>
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
              Engineer-Led, AI-Powered
            </h2>
            <p className="mt-4 text-gray-400 leading-relaxed">
              Our team includes chartered engineers who speak the language of PLC, SCADA, and controls. When we assess a candidate or discuss a role, we understand the technical nuances that generic recruiters miss. This engineering DNA runs through everything we do, from our AI matching algorithms to our candidate verification process.
            </p>
          </div>
        </div>
      </section>

      {/* Wartens Ecosystem */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/40 bg-[#8B5CF6]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#8B5CF6]">
              <Layers className="h-3.5 w-3.5" />
              Ecosystem
            </span>
            <h2 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">
              The Wartens Group
            </h2>
            <p className="mt-4 text-gray-400 leading-relaxed">
              Wartens is a global automation ecosystem operating under the philosophy of Innovate, Educate, Automate. With operations in the UK, USA, UAE, and India, Wartens brings together training, recruitment, robotics, and next-generation solutions to prepare industries for Industry 4.0 and beyond.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WARTENS_BRANDS.map((brand) => (
              <div
                key={brand.name}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8B5CF6]/15">
                    <brand.icon className="h-5 w-5 text-[#8B5CF6]" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{brand.name}</p>
                    <p className="text-xs text-gray-500">{brand.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-yellow-400">
              <Trophy className="h-3.5 w-3.5" />
              Award-Winning
            </div>
            <h2 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">
              Recognised for Excellence
            </h2>
            <p className="mt-4 text-gray-400 leading-relaxed">
              Our parent company Wartens has been recognised nationally and internationally for innovation, entrepreneurship, and excellence in industrial automation.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {AWARDS.map((award) => (
              <div
                key={award.name}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-center backdrop-blur-sm transition-all duration-300 hover:border-yellow-500/20 hover:bg-white/[0.06]"
              >
                <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.05] p-2 sm:h-24 sm:w-24">
                  <Image
                    src={award.image}
                    alt={award.name}
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <p className="text-[11px] font-semibold leading-tight text-gray-400 transition-colors group-hover:text-white sm:text-xs">
                  {award.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Details */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
              Company Details
            </h2>
            <div className="my-6 h-[1px] bg-white/[0.08]" />
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex gap-4">
                <span className="w-40 shrink-0 font-medium text-white">Registered Name</span>
                <span>{COMPANY_NAME}</span>
              </div>
              <div className="flex gap-4">
                <span className="w-40 shrink-0 font-medium text-white">Company Number</span>
                <span>{COMPANY_NUMBER}</span>
              </div>
              <div className="flex gap-4">
                <span className="w-40 shrink-0 font-medium text-white">Registered Address</span>
                <span>{COMPANY_ADDRESS}</span>
              </div>
              <div className="flex gap-4">
                <span className="w-40 shrink-0 font-medium text-white">Parent Company</span>
                <span>Wartens Ltd (wartens.com)</span>
              </div>
              <div className="flex gap-4">
                <span className="w-40 shrink-0 font-medium text-white">Global Presence</span>
                <span>UK, USA, UAE, India</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[#4540DB]/10" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4540DB]/20 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            Want to Work With Us?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
            Whether you are hiring automation engineers or looking for your next role, we would love to hear from you.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/employers">
              <Button size="lg" className="bg-[#4540DB] text-white hover:bg-[#4540DB]/80 px-8 shadow-lg shadow-[#4540DB]/25">
                For Employers
              </Button>
            </Link>
            <Link href="/candidates">
              <Button variant="outline" size="lg" className="border-white/[0.15] text-white hover:bg-white/[0.06] hover:text-white">
                For Candidates
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
