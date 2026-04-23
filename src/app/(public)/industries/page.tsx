"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChevronRight,
  Factory,
  Car,
  Zap,
  FlaskConical,
  UtensilsCrossed,
  Fuel,
  Truck,
  Shield,
  Cpu,
  Bot,
  Phone,
} from "lucide-react";

const INDUSTRIES = [
  {
    title: "Manufacturing & Industry 4.0",
    icon: Factory,
    color: "#4540DB",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
    automationRoles: ["PLC Programmer", "SCADA Engineer", "Controls Engineer", "Commissioning Engineer", "MES Engineer"],
    aiRoles: ["ML Engineer (Predictive Maintenance)", "Computer Vision Engineer (Quality)", "Data Scientist", "Digital Twin Engineer"],
  },
  {
    title: "Automotive & EV",
    icon: Car,
    color: "#00D4FF",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&h=400&fit=crop",
    automationRoles: ["Robotics Engineer", "PLC Programmer", "Controls Engineer", "Panel Design Engineer", "Safety Engineer (SIL)"],
    aiRoles: ["Computer Vision Engineer", "AI Engineer (ADAS)", "ML Engineer", "Robotics AI Engineer"],
  },
  {
    title: "Energy & Utilities",
    icon: Zap,
    color: "#22C55E",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&h=400&fit=crop",
    automationRoles: ["SCADA Engineer", "DCS Engineer", "EC&I Engineer", "BMS Engineer", "Telemetry Engineer"],
    aiRoles: ["Data Scientist (Grid Optimisation)", "ML Engineer (Demand Forecasting)", "IoT Engineer", "AI Engineer"],
  },
  {
    title: "Pharma & Life Sciences",
    icon: FlaskConical,
    color: "#8B5CF6",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop",
    automationRoles: ["Automation Engineer", "Controls Engineer", "Commissioning Engineer", "Safety Engineer (SIL)", "DCS Engineer"],
    aiRoles: ["Data Scientist (Drug Discovery)", "ML Engineer", "Computer Vision Engineer (QC)", "NLP Engineer"],
  },
  {
    title: "Food & Beverage",
    icon: UtensilsCrossed,
    color: "#F59E0B",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
    automationRoles: ["PLC Programmer", "SCADA Engineer", "Automation Engineer", "Panel Design Engineer", "Field Service Engineer"],
    aiRoles: ["Computer Vision Engineer (Quality)", "ML Engineer (Yield Optimisation)", "IoT Engineer", "Data Engineer"],
  },
  {
    title: "Oil, Gas & Petrochemical",
    icon: Fuel,
    color: "#F97316",
    image: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=600&h=400&fit=crop",
    automationRoles: ["DCS Engineer", "EC&I Engineer", "Safety Engineer (SIL)", "SCADA Engineer", "Commissioning Engineer"],
    aiRoles: ["ML Engineer (Predictive Maintenance)", "Data Scientist", "IoT Engineer", "Digital Twin Engineer"],
  },
  {
    title: "Logistics & Warehousing",
    icon: Truck,
    color: "#06B6D4",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop",
    automationRoles: ["Automation Engineer", "Robotics Engineer", "PLC Programmer", "Controls Engineer", "Systems Integrator"],
    aiRoles: ["ML Engineer (Route Optimisation)", "Computer Vision Engineer", "Robotics AI Engineer", "Data Engineer"],
  },
  {
    title: "Defence & Aerospace",
    icon: Shield,
    color: "#64748B",
    image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=600&h=400&fit=crop",
    automationRoles: ["Controls Engineer", "EC&I Engineer", "Safety Engineer (SIL)", "Systems Integrator", "Commissioning Engineer"],
    aiRoles: ["AI Research Scientist", "Computer Vision Engineer", "NLP Engineer", "Autonomous Systems Engineer"],
  },
  {
    title: "Technology & SaaS",
    icon: Cpu,
    color: "#EC4899",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
    automationRoles: ["Automation Architect", "IoT Engineer", "Systems Integrator", "OT Cybersecurity Engineer"],
    aiRoles: ["ML Engineer", "AI Engineer", "MLOps Engineer", "NLP Engineer", "Data Scientist", "AI Research Scientist"],
  },
  {
    title: "Robotics & Autonomous Systems",
    icon: Bot,
    color: "#4540DB",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&h=400&fit=crop",
    automationRoles: ["Robotics Engineer", "PLC Programmer", "Controls Engineer", "Systems Integrator", "Field Service Engineer"],
    aiRoles: ["Robotics AI Engineer", "Computer Vision Engineer", "ML Engineer", "Autonomous Systems Engineer", "Digital Twin Engineer"],
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
            Our Specialisms by Industry
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
            We place automation and AI engineers across the industries driving the fourth industrial revolution.
          </p>
        </div>
      </section>

      {/* Industry Grid */}
      <section className="pb-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2">
            {INDUSTRIES.map((industry) => (
              <div
                key={industry.title}
                className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.06]"
              >
                {/* Industry image */}
                <div className="relative h-44 w-full overflow-hidden">
                  <Image
                    src={industry.image}
                    alt={industry.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#010118] via-[#010118]/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ background: `${industry.color}30` }}
                    >
                      <industry.icon className="h-5 w-5" style={{ color: industry.color }} />
                    </div>
                    <h3 className="text-lg font-bold text-white">{industry.title}</h3>
                  </div>
                </div>

                <div className="p-6 pt-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Automation roles */}
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#4540DB]">Automation</p>
                      <ul className="space-y-1.5">
                        {industry.automationRoles.map((role) => (
                          <li key={role} className="flex items-center gap-2 text-sm text-gray-400">
                            <ChevronRight className="h-3 w-3 text-[#4540DB]" />
                            {role}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* AI roles */}
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">AI & Data</p>
                      <ul className="space-y-1.5">
                        {industry.aiRoles.map((role) => (
                          <li key={role} className="flex items-center gap-2 text-sm text-gray-400">
                            <ChevronRight className="h-3 w-3 text-[#00D4FF]" />
                            {role}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
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
            We place automation and AI engineers across all sectors. Get in touch and we&apos;ll find the right talent for your team.
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
