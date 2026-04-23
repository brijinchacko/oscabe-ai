"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  Award,
  Loader2,
  Handshake,
  TrendingUp,
  Shield,
} from "lucide-react";

interface DashboardData {
  stats: {
    sharedRoles: number;
    talentPool: number;
    placements: number;
  };
  recentJobs: Array<{
    id: string;
    title: string;
    companyName: string | null;
    location: string | null;
    contractType: string;
    feePercent: number | null;
    createdAt: string;
    _count: { applications: number };
    client: { companyName: string } | null;
  }>;
}

export default function AgencyDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/agency/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#8B5CF6]" />
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
        <h1 className="text-2xl font-bold text-white">Agency Dashboard</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage your split-fee partnerships and shared roles
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">Shared Roles</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {data.stats.sharedRoles}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#8B5CF6]/20">
              <Briefcase className="size-5 text-[#8B5CF6]" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">Talent Pool</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {data.stats.talentPool}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#8B5CF6]/20">
              <Users className="size-5 text-[#8B5CF6]" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">Placements</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {data.stats.placements}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#8B5CF6]/20">
              <Award className="size-5 text-[#8B5CF6]" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Active Jobs */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Recent Active Roles
          </h2>
          <Link
            href="/portal/agency/roles"
            className="text-sm text-[#8B5CF6] hover:underline"
          >
            View all
          </Link>
        </div>
        {data.recentJobs.length === 0 ? (
          <p className="text-sm text-gray-400">No active roles available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-gray-400">
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Company</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Fee %</th>
                  <th className="pb-3 font-medium">Applications</th>
                </tr>
              </thead>
              <tbody>
                {data.recentJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-white/[0.05] last:border-0"
                  >
                    <td className="py-3 font-medium text-white">{job.title}</td>
                    <td className="py-3 text-gray-300">
                      {job.client?.companyName ?? job.companyName ?? "-"}
                    </td>
                    <td className="py-3 text-gray-300">{job.contractType}</td>
                    <td className="py-3 text-gray-300">
                      {job.feePercent != null ? `${job.feePercent}%` : "-"}
                    </td>
                    <td className="py-3 text-gray-300">
                      {job._count.applications}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Partner Benefits */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
          <Handshake className="mb-3 size-8 text-[#8B5CF6]" />
          <h3 className="text-sm font-semibold text-white">
            Split-Fee Network
          </h3>
          <p className="mt-1 text-xs text-gray-400">
            Access shared roles from our employer network and earn split fees on
            successful placements.
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
          <TrendingUp className="mb-3 size-8 text-[#8B5CF6]" />
          <h3 className="text-sm font-semibold text-white">
            Revenue Growth
          </h3>
          <p className="mt-1 text-xs text-gray-400">
            Expand your revenue streams by placing candidates in roles outside
            your direct client base.
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
          <Shield className="mb-3 size-8 text-[#8B5CF6]" />
          <h3 className="text-sm font-semibold text-white">
            GDPR Compliant
          </h3>
          <p className="mt-1 text-xs text-gray-400">
            All candidate data sharing is fully GDPR compliant with consent
            management built in.
          </p>
        </div>
      </div>
    </div>
  );
}
