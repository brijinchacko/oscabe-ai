"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Gift, Plus, Users, Banknote, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Referral {
  id: string;
  candidateName: string;
  candidateEmail: string;
  referralCode: string;
  status: string;
  rewardAmount: number;
  createdAt: string;
}

interface Stats {
  total: number;
  placed: number;
  totalEarnings: number;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-yellow-500/10 text-yellow-400 ring-yellow-500/20" },
  CONTACTED: { label: "Contacted", className: "bg-blue-500/10 text-blue-400 ring-blue-500/20" },
  INTERVIEWING: { label: "Interviewing", className: "bg-purple-500/10 text-purple-400 ring-purple-500/20" },
  PLACED: { label: "Placed", className: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" },
  REJECTED: { label: "Rejected", className: "bg-red-500/10 text-red-400 ring-red-500/20" },
};

export default function CandidateReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, placed: 0, totalEarnings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferrals();
  }, []);

  async function fetchReferrals() {
    try {
      const res = await fetch("/api/referrals");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setReferrals(data.referrals);
      setStats(data.stats);
    } catch {
      toast.error("Failed to load referrals");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Referrals</h1>
          <p className="mt-1 text-gray-400">
            Track your referrals and earnings
          </p>
        </div>
        <Link
          href="/refer"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          <Plus className="size-4" />
          Refer Someone New
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#4540DB]/10">
              <Users className="size-5 text-[#4540DB]" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Referrals</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Gift className="size-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Successful Placements</p>
              <p className="text-2xl font-bold text-white">{stats.placed}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Banknote className="size-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Earnings</p>
              <p className="text-2xl font-bold text-white">
                £{(stats.totalEarnings / 100).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Referrals Table */}
      {referrals.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-12 text-center backdrop-blur">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-white/[0.05]">
            <Gift className="size-8 text-gray-500" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-white">No Referrals Yet</h3>
          <p className="mb-6 text-gray-400">
            Know a talented automation engineer? Refer them and earn £200 per placement.
          </p>
          <Link
            href="/refer"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
          >
            <Plus className="size-4" />
            Make Your First Referral
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    Date Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    Reward
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {referrals.map((referral) => {
                  const config = STATUS_CONFIG[referral.status] || STATUS_CONFIG.PENDING;
                  return (
                    <tr key={referral.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="whitespace-nowrap px-6 py-4">
                        <p className="font-medium text-white">{referral.candidateName}</p>
                        <p className="text-sm text-gray-500">{referral.candidateEmail}</p>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="font-mono text-sm text-gray-400">
                          {referral.referralCode}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                        {new Date(referral.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${config.className}`}
                        >
                          {config.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {referral.status === "PLACED" ? (
                          <span className="font-medium text-emerald-400">
                            £{(referral.rewardAmount / 100).toFixed(0)}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
