"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Gift,
  Search,
  Loader2,
  Users,
  Clock,
  Phone,
  CheckCircle2,
  Banknote,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface Referral {
  id: string;
  referrerName: string;
  referrerEmail: string;
  referrerPhone: string | null;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string | null;
  candidateRole: string | null;
  candidateSkills: string | null;
  notes: string | null;
  referralCode: string;
  status: string;
  rewardAmount: number;
  rewardPaid: boolean;
  createdAt: string;
  referrer: { firstName: string | null; lastName: string | null; email: string } | null;
}

interface Stats {
  total: number;
  pending: number;
  contacted: number;
  placed: number;
  totalEarnings: number;
}

const STATUSES = ["ALL", "PENDING", "CONTACTED", "INTERVIEWING", "PLACED", "REJECTED"] as const;

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-yellow-500/10 text-yellow-400 ring-yellow-500/20" },
  CONTACTED: { label: "Contacted", className: "bg-blue-500/10 text-blue-400 ring-blue-500/20" },
  INTERVIEWING: { label: "Interviewing", className: "bg-purple-500/10 text-purple-400 ring-purple-500/20" },
  PLACED: { label: "Placed", className: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" },
  REJECTED: { label: "Rejected", className: "bg-red-500/10 text-red-400 ring-red-500/20" },
};

export default function CRMReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    contacted: 0,
    placed: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [confirmPlaced, setConfirmPlaced] = useState<{ id: string; name: string } | null>(null);

  const fetchReferrals = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "ALL") params.set("status", filterStatus);
      if (searchTerm) params.set("search", searchTerm);

      const res = await fetch(`/api/referrals?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setReferrals(data.referrals);
      setStats(data.stats);
    } catch {
      toast.error("Failed to load referrals");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, searchTerm]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  async function updateStatus(id: string, newStatus: string) {
    // If marking as PLACED, show confirmation
    if (newStatus === "PLACED") {
      const referral = referrals.find((r) => r.id === id);
      if (referral) {
        setConfirmPlaced({ id, name: referral.referrerName });
        return;
      }
    }

    await doUpdateStatus(id, newStatus);
  }

  async function doUpdateStatus(id: string, newStatus: string) {
    try {
      const res = await fetch(`/api/referrals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update");

      toast.success(`Status updated to ${newStatus}`);
      setConfirmPlaced(null);
      fetchReferrals();
    } catch {
      toast.error("Failed to update status");
    }
  }

  const statCards = [
    { label: "Total Referrals", value: stats.total, icon: Users, color: "text-[#4540DB]", bg: "bg-[#4540DB]/10" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Contacted", value: stats.contacted, icon: Phone, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Placed", value: stats.placed, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    {
      label: "Total Rewards",
      value: `£${(stats.totalEarnings / 100).toLocaleString()}`,
      icon: Banknote,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Referrals Management</h1>
        <p className="mt-1 text-gray-500">
          Manage candidate referrals and rewards
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`flex size-10 items-center justify-center rounded-lg ${card.bg}`}>
                  <Icon className={`size-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{card.label}</p>
                  <p className="text-xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search referrals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 outline-none focus:border-[#4540DB] focus:ring-1 focus:ring-[#4540DB]"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-[#4540DB] focus:ring-1 focus:ring-[#4540DB]"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "ALL" ? "All Statuses" : s}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Referrer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Candidate
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Skills
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Reward
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {referrals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Gift className="mx-auto mb-3 size-8 text-gray-300" />
                    <p className="text-sm text-gray-500">No referrals found</p>
                  </td>
                </tr>
              ) : (
                referrals.map((referral) => {
                  const config = STATUS_CONFIG[referral.status] || STATUS_CONFIG.PENDING;
                  return (
                    <tr
                      key={referral.id}
                      className="cursor-pointer transition-colors hover:bg-gray-50"
                      onClick={() => setSelectedReferral(referral)}
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{referral.referrerName}</p>
                        <p className="text-xs text-gray-500">{referral.referrerEmail}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{referral.candidateName}</p>
                        <p className="text-xs text-gray-500">{referral.candidateEmail}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                        {referral.candidateRole || "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="font-mono text-xs text-gray-500">{referral.referralCode}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={referral.status}
                          onChange={(e) => updateStatus(referral.id, e.target.value)}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset outline-none cursor-pointer ${config.className}`}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="INTERVIEWING">Interviewing</option>
                          <option value="PLACED">Placed</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        {referral.status === "PLACED" ? (
                          <span className="font-medium text-emerald-600">
                            £{(referral.rewardAmount / 100).toFixed(0)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                        {new Date(referral.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Referral Details</h3>
              <button
                onClick={() => setSelectedReferral(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Referrer</p>
                  <p className="text-sm font-medium text-gray-900">{selectedReferral.referrerName}</p>
                  <p className="text-xs text-gray-500">{selectedReferral.referrerEmail}</p>
                  {selectedReferral.referrerPhone && (
                    <p className="text-xs text-gray-500">{selectedReferral.referrerPhone}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Candidate</p>
                  <p className="text-sm font-medium text-gray-900">{selectedReferral.candidateName}</p>
                  <p className="text-xs text-gray-500">{selectedReferral.candidateEmail}</p>
                  {selectedReferral.candidatePhone && (
                    <p className="text-xs text-gray-500">{selectedReferral.candidatePhone}</p>
                  )}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Role / Skills</p>
                  <p className="text-sm text-gray-700">{selectedReferral.candidateRole || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Referral Code</p>
                  <p className="font-mono text-sm text-gray-700">{selectedReferral.referralCode}</p>
                </div>
              </div>
              {selectedReferral.notes && (
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Notes</p>
                  <p className="text-sm text-gray-700">{selectedReferral.notes}</p>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Status</p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      STATUS_CONFIG[selectedReferral.status]?.className || ""
                    }`}
                  >
                    {STATUS_CONFIG[selectedReferral.status]?.label || selectedReferral.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Reward</p>
                  <p className="text-sm text-gray-700">
                    {selectedReferral.status === "PLACED"
                      ? `£${(selectedReferral.rewardAmount / 100).toFixed(0)}`
                      : "Pending placement"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Submitted</p>
                  <p className="text-sm text-gray-700">
                    {new Date(selectedReferral.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedReferral(null)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Placed Modal */}
      {confirmPlaced && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="size-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Confirm Placement</h3>
            </div>
            <p className="mb-6 text-sm text-gray-600">
              Mark as placed? This will trigger a <strong>£200 reward</strong> for the referrer (
              {confirmPlaced.name}).
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmPlaced(null)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => doUpdateStatus(confirmPlaced.id, "PLACED")}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
              >
                Confirm Placement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
