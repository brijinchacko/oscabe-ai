"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Award,
  CalendarCheck,
  Loader2,
  Briefcase,
  ArrowRight,
} from "lucide-react";

interface DashboardData {
  stats: {
    activeApplications: number;
    profileCompletion: number;
    interviewsScheduled: number;
    verifiedSkills: number;
  };
  recentApplications: Array<{
    id: string;
    stage: string;
    createdAt: string;
    job: {
      id: string;
      title: string;
      companyName: string | null;
      location: string | null;
    };
  }>;
  recommendedJobs: Array<{
    id: string;
    title: string;
    companyName: string | null;
    location: string | null;
    contractType: string;
    salaryMin: number | null;
    salaryMax: number | null;
  }>;
}

const STAGE_COLORS: Record<string, string> = {
  SOURCED: "bg-gray-500/20 text-gray-400",
  SCREENING: "bg-blue-500/20 text-blue-400",
  SUBMITTED: "bg-indigo-500/20 text-indigo-400",
  INTERVIEW: "bg-purple-500/20 text-purple-400",
  OFFER: "bg-green-500/20 text-green-400",
  PLACED: "bg-emerald-500/20 text-emerald-400",
};

export default function CandidateDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/candidate/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#00D4FF]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-gray-400">
        Failed to load dashboard data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Candidate Dashboard</h1>
        <p className="mt-1 text-sm text-gray-400">
          Track your applications and discover new opportunities
        </p>
      </div>

      {/* Profile Completion */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-300">
            Profile Completion
          </p>
          <span className="text-sm font-bold text-[#00D4FF]">
            {data.stats.profileCompletion}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className="h-full rounded-full bg-[#00D4FF] transition-all"
            style={{ width: `${data.stats.profileCompletion}%` }}
          />
        </div>
        {data.stats.profileCompletion < 100 && (
          <Link
            href="/portal/candidate/profile"
            className="mt-2 inline-block text-xs text-[#00D4FF] hover:underline"
          >
            Complete your profile to improve matching
          </Link>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Applications</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {data.stats.activeApplications}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#00D4FF]/20">
              <FileText className="size-5 text-[#00D4FF]" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">Verified Skills</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {data.stats.verifiedSkills}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#00D4FF]/20">
              <Award className="size-5 text-[#00D4FF]" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">Interviews Scheduled</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {data.stats.interviewsScheduled}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#00D4FF]/20">
              <CalendarCheck className="size-5 text-[#00D4FF]" />
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Jobs */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Recommended Jobs
          </h2>
          <Link
            href="/portal/candidate/jobs"
            className="text-sm text-[#00D4FF] hover:underline"
          >
            Browse all
          </Link>
        </div>
        {data.recommendedJobs.length === 0 ? (
          <p className="text-sm text-gray-400">
            No recommended jobs at the moment.
          </p>
        ) : (
          <div className="space-y-3">
            {data.recommendedJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-4 py-3"
              >
                <div>
                  <p className="font-medium text-white">{job.title}</p>
                  <p className="text-xs text-gray-400">
                    {job.companyName ?? "Company"}{" "}
                    {job.location ? `- ${job.location}` : ""} &middot;{" "}
                    {job.contractType}
                  </p>
                </div>
                <Link href="/portal/candidate/jobs">
                  <ArrowRight className="size-4 text-gray-400 hover:text-[#00D4FF]" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Applications */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Recent Applications
          </h2>
          <Link
            href="/portal/candidate/applications"
            className="text-sm text-[#00D4FF] hover:underline"
          >
            View all
          </Link>
        </div>
        {data.recentApplications.length === 0 ? (
          <p className="text-sm text-gray-400">No applications yet.</p>
        ) : (
          <div className="space-y-3">
            {data.recentApplications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-4 py-3"
              >
                <div>
                  <p className="font-medium text-white">{app.job.title}</p>
                  <p className="text-xs text-gray-400">
                    {app.job.companyName ?? "Company"} &middot;{" "}
                    {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    STAGE_COLORS[app.stage] ?? "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {app.stage}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
