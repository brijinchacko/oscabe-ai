"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChevronRight,
  Building2,
  Landmark,
  Briefcase,
  Monitor,
  Cpu,
  HeartPulse,
  GraduationCap,
  Factory,
  Truck,
  ShieldCheck,
  Phone,
} from "lucide-react";

const INDUSTRIES = [
  {
    title: "Insurance & Financial Services",
    icon: Landmark,
    color: "#4540DB",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=400&fit=crop",
    roles: ["Business Analysts", "Project Managers", "Operations Managers", "Claims Handlers", "Underwriters", "Compliance Officers", "Risk Analysts"],
  },
  {
    title: "Professional Services",
    icon: Briefcase,
    color: "#00D4FF",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
    roles: ["Admin & Office Support", "HR & People Operations", "Executive Assistants", "Office Managers", "Receptionists", "Facilities Managers"],
  },
  {
    title: "Technology & Digital",
    icon: Monitor,
    color: "#8B5CF6",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
    roles: ["Software Developers", "QA & Testing Engineers", "Data & AI Specialists", "DevOps & Cloud Engineers", "IT Support", "Cybersecurity Analysts", "UX/UI Designers"],
  },
  {
    title: "Engineering & Manufacturing",
    icon: Cpu,
    color: "#22C55E",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
    roles: ["Industrial Automation Engineers", "PLC & SCADA Engineers", "Controls Engineers", "Commissioning Engineers", "Robotics Engineers", "EC&I Engineers", "Maintenance Engineers"],
  },
  {
    title: "Healthcare & Life Sciences",
    icon: HeartPulse,
    color: "#F59E0B",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop",
    roles: ["Clinical Project Managers", "Regulatory Affairs", "Quality Assurance", "Lab Technicians", "Pharmaceutical Engineers", "Medical Device Engineers"],
  },
  {
    title: "Education & Training",
    icon: GraduationCap,
    color: "#EC4899",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c5a1?w=600&h=400&fit=crop",
    roles: ["Training Managers", "Instructional Designers", "E-Learning Developers", "Technical Trainers", "Assessment Specialists"],
  },
  {
    title: "Logistics & Supply Chain",
    icon: Truck,
    color: "#06B6D4",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop",
    roles: ["Supply Chain Managers", "Procurement Specialists", "Warehouse Managers", "Logistics Coordinators", "Transport Planners"],
  },
  {
    title: "Energy & Utilities",
    icon: Factory,
    color: "#F97316",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&h=400&fit=crop",
    roles: ["Power Generation Engineers", "Water & Wastewater Engineers", "Renewable Energy Specialists", "Grid Engineers", "BEMS Engineers", "Telemetry Engineers"],
  },
];

export default function IndustriesPage() {
  return (
    <div className="bg-[#010118]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#4540DB]/15 blur-[120px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Industries We Support
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
            From financial services to factory floors, we source talent across every sector.
          </p>
        </div>
      </section>

      {/* Industry Grid */}
      <section className="pb-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {INDUSTRIES.map((industry) => (
              <div
                key={industry.title}
                className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.06]"
              >
                {/* Industry image */}
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={industry.image}
                    alt={industry.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#010118] via-[#010118]/60 to-transparent" />
                  <div
                    className="absolute bottom-3 left-4 flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ background: `${industry.color}30` }}
                  >
                    <industry.icon className="h-5 w-5" style={{ color: industry.color }} />
                  </div>
                </div>

                <div className="p-6 pt-3">
                  <h3 className="text-lg font-bold text-white">{industry.title}</h3>
                  <ul className="mt-3 space-y-1.5">
                    {industry.roles.map((role) => (
                      <li key={role} className="flex items-center gap-2 text-sm text-gray-400">
                        <ChevronRight className="h-3 w-3" style={{ color: industry.color }} />
                        {role}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-white/[0.06]">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Don&apos;t see your industry?
          </h2>
          <p className="mt-3 text-gray-400">
            We work across all sectors. Get in touch and we&apos;ll find the right talent for your team.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-[#4540DB] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-[#4540DB]/25 transition-all hover:bg-[#4540DB]/90"
            >
              Talk to Us
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/post-a-role"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              Submit a Role
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
