"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Loader2,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const JOB_SOURCES = [
  "DIRECT",
  "HIRING_HUB",
  "TEAM_NETWORK",
  "SPLITFEE",
  "GIIG",
  "RECXCHANGE",
  "RECRUITING_HUB",
  "PARAFORM",
  "OTHER",
] as const;

const JOB_STATUSES = ["ACTIVE", "ON_HOLD", "FILLED", "CANCELLED", "DRAFT"] as const;

const CONTRACT_TYPES = ["PERMANENT", "CONTRACT", "FIXED_TERM"] as const;

const SOURCE_BADGE_COLORS: Record<string, string> = {
  DIRECT: "bg-indigo-100 text-indigo-800",
  HIRING_HUB: "bg-emerald-100 text-emerald-800",
  TEAM_NETWORK: "bg-amber-100 text-amber-800",
  SPLITFEE: "bg-red-100 text-red-800",
  GIIG: "bg-violet-100 text-violet-800",
  RECXCHANGE: "bg-pink-100 text-pink-800",
  RECRUITING_HUB: "bg-cyan-100 text-cyan-800",
  PARAFORM: "bg-lime-100 text-lime-800",
  OTHER: "bg-gray-100 text-gray-800",
};

const STATUS_BADGE_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  ON_HOLD: "bg-yellow-100 text-yellow-800",
  FILLED: "bg-blue-100 text-blue-800",
  CANCELLED: "bg-gray-100 text-gray-600",
  DRAFT: "bg-slate-100 text-slate-600",
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Job {
  id: string;
  title: string;
  companyName: string | null;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  dayRateMin: number | null;
  dayRateMax: number | null;
  feeAmount: number | null;
  feePercent: number | null;
  source: string | null;
  status: string;
  contractType: string | null;
  createdAt: string;
  client: { id: string; companyName: string } | null;
  assignedTo: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
  _count: { applications: number };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatSalaryRate(job: Job): string {
  if (job.salaryMin || job.salaryMax) {
    const min = job.salaryMin ? `${(job.salaryMin / 1000).toFixed(0)}k` : "?";
    const max = job.salaryMax ? `${(job.salaryMax / 1000).toFixed(0)}k` : "?";
    return `\u00A3${min} - \u00A3${max}`;
  }
  if (job.dayRateMin || job.dayRateMax) {
    const min = job.dayRateMin ?? "?";
    const max = job.dayRateMax ?? "?";
    return `\u00A3${min} - \u00A3${max}/day`;
  }
  return "-";
}

function daysOpen(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000);
}

function formatSource(source: string): string {
  return source
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function rowBgClass(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "bg-green-50";
    case "ON_HOLD":
      return "bg-yellow-50";
    case "FILLED":
    case "CANCELLED":
      return "bg-gray-50";
    default:
      return "";
  }
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function JobsListPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [contractFilter, setContractFilter] = useState("");

  const pageSize = 20;

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (sourceFilter) params.set("source", sourceFilter);
      if (contractFilter) params.set("contractType", contractFilter);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const data = await res.json();
      setJobs(data.jobs ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setError("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, sourceFilter, contractFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-sm text-gray-500">
            {total} job{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/crm/jobs/new">
          <Button>
            <Plus className="size-4" />
            New Job
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search jobs..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v ?? "");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            {JOB_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sourceFilter}
          onValueChange={(v) => {
            setSourceFilter(v ?? "");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            {JOB_SOURCES.map((s) => (
              <SelectItem key={s} value={s}>
                {formatSource(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={contractFilter}
          onValueChange={(v) => {
            setContractFilter(v ?? "");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            {CONTRACT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(statusFilter || sourceFilter || contractFilter) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter("");
              setSourceFilter("");
              setContractFilter("");
              setPage(1);
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-600">Title</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Client</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Location</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Salary/Rate</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Fee</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Source</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Candidates</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Days Open</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center">
                  <Loader2 className="mx-auto size-6 animate-spin text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Loading jobs...</p>
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center">
                  <Briefcase className="mx-auto size-10 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">No jobs found</p>
                </td>
              </tr>
            ) : (
              jobs.map((job) => {
                const days = daysOpen(job.createdAt);
                const candidateCount = job._count.applications;
                const daysClass =
                  days > 14 && candidateCount === 0
                    ? "text-red-600 font-semibold"
                    : "text-gray-700";

                return (
                  <tr
                    key={job.id}
                    className={`border-b border-gray-100 transition-colors hover:bg-gray-50/50 ${rowBgClass(job.status)}`}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/crm/jobs/${job.id}`}
                        className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        {job.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {job.client ? (
                        <Link
                          href={`/crm/clients/${job.client.id}`}
                          className="hover:text-indigo-600 hover:underline"
                        >
                          {job.client.companyName}
                        </Link>
                      ) : (
                        job.companyName || "-"
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {job.location || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatSalaryRate(job)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {job.feeAmount
                        ? `\u00A3${job.feeAmount.toLocaleString()}`
                        : job.feePercent
                          ? `${job.feePercent}%`
                          : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {job.source ? (
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${SOURCE_BADGE_COLORS[job.source] || SOURCE_BADGE_COLORS.OTHER}`}
                        >
                          {formatSource(job.source)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_COLORS[job.status] || "bg-gray-100 text-gray-600"}`}
                      >
                        {job.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">
                      {candidateCount}
                    </td>
                    <td className={`px-4 py-3 text-center ${daysClass}`}>
                      {days}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {job.assignedTo
                        ? `${job.assignedTo.firstName ?? ""} ${job.assignedTo.lastName ?? ""}`.trim() ||
                          job.assignedTo.email
                        : "-"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * pageSize + 1}-
            {Math.min(page * pageSize, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
