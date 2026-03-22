"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  FileText,
  Award,
  CalendarCheck,
  Plus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardData {
  stats: {
    activeJobs: number;
    totalApplications: number;
    totalPlacements: number;
    interviewsThisWeek: number;
  };
  recentJobs: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
    _count: { applications: number };
  }>;
  recentSubmissions: Array<{
    id: string;
    stage: string;
    createdAt: string;
    candidate: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      headline: string | null;
    };
    job: { id: string; title: string };
  }>;
}

const STAT_CARDS = [
  { key: "activeJobs" as const, label: "Active Jobs", icon: Briefcase },
  {
    key: "totalApplications" as const,
    label: "Applications",
    icon: FileText,
  },
  { key: "totalPlacements" as const, label: "Placements", icon: Award },
  {
    key: "interviewsThisWeek" as const,
    label: "Interviews This Week",
    icon: CalendarCheck,
  },
];

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-500/20 text-emerald-400",
  CLOSED: "bg-gray-500/20 text-gray-400",
  DRAFT: "bg-yellow-500/20 text-yellow-400",
  ON_HOLD: "bg-orange-500/20 text-orange-400",
};

export default function EmployerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/employer/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#4540DB]" />
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Employer Dashboard</h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage your jobs and track applications
          </p>
        </div>
        <Link href="/portal/employer/jobs/new">
          <Button className="bg-[#4540DB] text-white hover:bg-[#3632b0]">
            <Plus className="mr-2 size-4" />
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {data.stats[card.key]}
                  </p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-[#4540DB]/20">
                  <Icon className="size-5 text-[#4540DB]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Jobs */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Jobs</h2>
          <Link
            href="/portal/employer/jobs"
            className="text-sm text-[#4540DB] hover:underline"
          >
            View all
          </Link>
        </div>
        {data.recentJobs.length === 0 ? (
          <p className="text-sm text-gray-400">No jobs posted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-gray-400">
                  <th className="pb-3 font-medium">Title</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Applications</th>
                  <th className="pb-3 font-medium">Posted</th>
                </tr>
              </thead>
              <tbody>
                {data.recentJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-white/[0.05] last:border-0"
                  >
                    <td className="py-3 font-medium text-white">{job.title}</td>
                    <td className="py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_COLORS[job.status] ??
                          "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-300">
                      {job._count.applications}
                    </td>
                    <td className="py-3 text-gray-400">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Candidate Submissions */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Recent Candidate Submissions
        </h2>
        {data.recentSubmissions.length === 0 ? (
          <p className="text-sm text-gray-400">No submissions yet.</p>
        ) : (
          <div className="space-y-3">
            {data.recentSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-4 py-3"
              >
                <div>
                  <p className="font-medium text-white">
                    {sub.candidate.firstName} {sub.candidate.lastName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {sub.candidate.headline ?? sub.candidate.email} &mdash;{" "}
                    {sub.job.title}
                  </p>
                </div>
                <span className="rounded-full bg-[#4540DB]/20 px-2.5 py-0.5 text-xs font-medium text-[#4540DB]">
                  {sub.stage}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
