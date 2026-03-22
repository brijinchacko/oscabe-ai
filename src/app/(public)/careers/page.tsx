"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  Rocket,
  Users,
  Globe,
  Heart,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AwardsBanner } from "@/components/shared/awards-banner";

interface Job {
  id: string;
  title: string;
  location: string;
  contractType: string;
  remote: boolean;
  createdAt: string;
}

const PERKS = [
  { icon: Rocket, title: "Innovation First", description: "Work with cutting-edge AI, VR, and automation technology. We are building the future of industrial recruitment." },
  { icon: Users, title: "Global Team", description: "Join a diverse team operating across the UK, USA, UAE, and India as part of the Wartens ecosystem." },
  { icon: Globe, title: "Flexible Working", description: "Remote-first culture with flexible hours. We trust our team to deliver results, not clock hours." },
  { icon: Heart, title: "Growth Focused", description: "Continuous learning, training budgets, and career progression within the Wartens group of companies." },
];

export default function CareersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch("/api/jobs/public?limit=6");
        if (res.ok) {
          const data = await res.json();
          setJobs(data.jobs || []);
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  return (
    <div className="bg-[#02012B]">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#4540DB]/20 blur-[120px]" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-[#00D4FF]/15 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#4540DB]/40 bg-[#4540DB]/10 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#4540DB]">
            <Briefcase className="h-3.5 w-3.5" />
            Join Our Team
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Build the Future of
            <br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #4540DB, #00D4FF)" }}>
              Automation Recruitment
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            OSCABE is part of the Wartens group, a global automation ecosystem. We are always looking for talented people who want to make a difference in industrial technology.
          </p>
          <div className="mt-8">
            <Link href="#openings">
              <Button
                size="lg"
                className="bg-[#4540DB] text-white hover:bg-[#4540DB]/80 px-8 shadow-lg shadow-[#4540DB]/25"
              >
                View Open Positions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why OSCABE */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
              Why Work With Us
            </h2>
            <p className="mt-4 text-gray-400">
              We are a fast-growing team at the intersection of AI, automation, and recruitment technology.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PERKS.map((perk) => (
              <div
                key={perk.title}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4540DB]/15">
                  <perk.icon className="h-5 w-5 text-[#4540DB]" />
                </div>
                <h3 className="mt-4 font-bold text-white">{perk.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{perk.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="openings" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
              Open Positions
            </h2>
            <p className="mt-4 text-gray-400">
              Check out our current openings below, or browse all roles on our jobs page.
            </p>
          </div>

          <div className="mt-12">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#4540DB]" />
              </div>
            ) : jobs.length > 0 ? (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="group flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.06]"
                  >
                    <div>
                      <p className="font-bold text-white group-hover:text-[#4540DB] transition-colors">{job.title}</p>
                      <div className="mt-1.5 flex items-center gap-4 text-xs text-gray-500">
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {job.contractType.replace(/_/g, " ")}
                        </span>
                        {job.remote && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            Remote
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-[#4540DB]" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/[0.15] py-12 text-center">
                <Briefcase className="mx-auto h-10 w-10 text-gray-600" />
                <p className="mt-3 text-gray-400">No positions currently listed.</p>
                <p className="mt-1 text-sm text-gray-500">
                  We are always open to hearing from talented people. Send your CV to{" "}
                  <a href="mailto:careers@oscabe.com" className="text-[#00D4FF] hover:underline">careers@oscabe.com</a>
                </p>
              </div>
            )}

            <div className="mt-8 text-center">
              <Link href="/jobs">
                <Button variant="outline" className="border-white/[0.15] text-white hover:bg-white/[0.06] hover:text-white">
                  Browse All Jobs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Awards */}
      <AwardsBanner compact accentColor="#4540DB" />

      {/* CTA */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[#4540DB]/15 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            Do Not See the Right Role?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-400">
            We are always looking for exceptional people. Send your CV and a note about what excites you to careers@oscabe.com
          </p>
          <div className="mt-8">
            <a href="mailto:careers@oscabe.com">
              <Button size="lg" className="bg-[#4540DB] text-white hover:bg-[#4540DB]/80 px-8 shadow-lg shadow-[#4540DB]/25">
                Send Your CV
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
