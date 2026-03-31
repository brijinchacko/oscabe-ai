"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Loader2,
  AlertCircle,
  Briefcase,
  X,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  "DIRECT", "HIRING_HUB", "TEAM_NETWORK", "SPLITFEE",
  "GIIG", "RECXCHANGE", "RECRUITING_HUB", "PARAFORM", "OTHER",
] as const;

const JOB_STATUSES = ["ACTIVE", "ON_HOLD", "FILLED", "CANCELLED", "DRAFT"] as const;

const CONTRACT_TYPES = ["PERMANENT", "CONTRACT", "FIXED_TERM"] as const;

const SOURCE_BADGE_COLORS: Record<string, string> = {
  DIRECT: "bg-indigo-50 text-indigo-700",
  HIRING_HUB: "bg-emerald-50 text-emerald-700",
  TEAM_NETWORK: "bg-amber-50 text-amber-700",
  SPLITFEE: "bg-red-50 text-red-700",
  GIIG: "bg-violet-50 text-violet-700",
  RECXCHANGE: "bg-pink-50 text-pink-700",
  RECRUITING_HUB: "bg-cyan-50 text-cyan-700",
  PARAFORM: "bg-lime-50 text-lime-700",
  OTHER: "bg-gray-50 text-gray-600",
};

const STATUS_DOT: Record<string, string> = {
  ACTIVE: "bg-green-500",
  ON_HOLD: "bg-yellow-500",
  FILLED: "bg-blue-500",
  CANCELLED: "bg-gray-400",
  DRAFT: "bg-slate-400",
};

const STATUS_BG: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700",
  ON_HOLD: "bg-yellow-50 text-yellow-700",
  FILLED: "bg-blue-50 text-blue-700",
  CANCELLED: "bg-gray-50 text-gray-600",
  DRAFT: "bg-slate-50 text-slate-600",
};

const CONTRACT_BG: Record<string, string> = {
  PERMANENT: "bg-indigo-50 text-indigo-700",
  CONTRACT: "bg-amber-50 text-amber-700",
  FIXED_TERM: "bg-cyan-50 text-cyan-700",
};

const INDUSTRIES = [
  "Automotive", "Food & Beverage", "Pharmaceuticals", "Water & Wastewater",
  "Oil & Gas", "Energy & Renewables", "Manufacturing", "Building Automation",
  "Technology", "Other",
];

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
  industry: string | null;
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
    return `\u00A3${min}-\u00A3${max}`;
  }
  if (job.dayRateMin || job.dayRateMax) {
    const min = job.dayRateMin ?? "?";
    const max = job.dayRateMax ?? "?";
    return `\u00A3${min}-\u00A3${max}/d`;
  }
  return "-";
}

function daysOpen(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000);
}

function formatSource(source: string): string {
  return source.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [contractFilter, setContractFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [remoteFilter, setRemoteFilter] = useState(false);
  const [hasAppsFilter, setHasAppsFilter] = useState(false);
  const [salaryMinFilter, setSalaryMinFilter] = useState("");
  const [salaryMaxFilter, setSalaryMaxFilter] = useState("");
  const [sortByFilter, setSortByFilter] = useState("newest");
  const [topClients, setTopClients] = useState<{ id: string; companyName: string }[]>([]);

  const pageSize = 25;

  const activeFilterCount =
    (statusFilter ? 1 : 0) +
    (sourceFilter ? 1 : 0) +
    (contractFilter ? 1 : 0) +
    (clientFilter ? 1 : 0) +
    (locationFilter ? 1 : 0) +
    (industryFilter ? 1 : 0) +
    (remoteFilter ? 1 : 0) +
    (hasAppsFilter ? 1 : 0) +
    (salaryMinFilter ? 1 : 0) +
    (salaryMaxFilter ? 1 : 0) +
    (sortByFilter !== "newest" ? 1 : 0);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

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
      if (clientFilter) params.set("clientId", clientFilter);
      if (locationFilter) params.set("location", locationFilter);
      if (industryFilter) params.set("industry", industryFilter);
      if (remoteFilter) params.set("remote", "true");
      if (hasAppsFilter) params.set("hasApplications", "true");
      if (salaryMinFilter) params.set("salaryMin", salaryMinFilter);
      if (salaryMaxFilter) params.set("salaryMax", salaryMaxFilter);
      if (sortByFilter) params.set("sortBy", sortByFilter);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const data = await res.json();
      setJobs(data.jobs ?? []);
      setTotal(data.total ?? 0);
      if (data.topClients) setTopClients(data.topClients);
    } catch {
      setError("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, sourceFilter, contractFilter, clientFilter, locationFilter, industryFilter, remoteFilter, hasAppsFilter, salaryMinFilter, salaryMaxFilter, sortByFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  function clearAllFilters() {
    setStatusFilter("");
    setSourceFilter("");
    setContractFilter("");
    setClientFilter("");
    setLocationFilter("");
    setIndustryFilter("");
    setRemoteFilter(false);
    setHasAppsFilter(false);
    setSalaryMinFilter("");
    setSalaryMaxFilter("");
    setSortByFilter("newest");
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Jobs</h1>
          <p className="text-[11px] text-gray-500">{total} total</p>
        </div>
        <Link href="/crm/jobs/new">
          <Button size="sm" className="h-7 text-xs px-2">
            <Plus className="size-3" />
            New Job
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
            <Filter className="size-3" />
            Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-semibold min-w-[18px] h-[18px] px-1">
                {activeFilterCount}
              </span>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-8 w-[140px] rounded-md border border-gray-200 bg-white pl-7 pr-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : (v ?? "")); setPage(1); }}>
            <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {JOB_STATUSES.map((s) => (<SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>))}
            </SelectContent>
          </Select>

          <Select value={contractFilter} onValueChange={(v) => { setContractFilter(v === "all" ? "" : (v ?? "")); setPage(1); }}>
            <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue placeholder="Contract" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {CONTRACT_TYPES.map((t) => (<SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>))}
            </SelectContent>
          </Select>

          <Select value={clientFilter} onValueChange={(v) => { setClientFilter(v === "all" ? "" : (v ?? "")); setPage(1); }}>
            <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue placeholder="Client" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {topClients.map((c) => (<SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>))}
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v === "all" ? "" : (v ?? "")); setPage(1); }}>
            <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {JOB_SOURCES.map((s) => (<SelectItem key={s} value={s}>{formatSource(s)}</SelectItem>))}
            </SelectContent>
          </Select>

          <Select value={industryFilter} onValueChange={(v) => { setIndustryFilter(v === "all" ? "" : (v ?? "")); setPage(1); }}>
            <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue placeholder="Industry" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {INDUSTRIES.map((ind) => (<SelectItem key={ind} value={ind}>{ind}</SelectItem>))}
            </SelectContent>
          </Select>

          <input
            type="text"
            placeholder="Location..."
            value={locationFilter}
            onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}
            className="h-8 w-[100px] rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />

          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-600">
            <Checkbox checked={remoteFilter} onCheckedChange={(checked) => { setRemoteFilter(!!checked); setPage(1); }} />
            Remote
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-600">
            <Checkbox checked={hasAppsFilter} onCheckedChange={(checked) => { setHasAppsFilter(!!checked); setPage(1); }} />
            Has Apps
          </label>

          <input type="number" placeholder="Salary min" value={salaryMinFilter} onChange={(e) => { setSalaryMinFilter(e.target.value); setPage(1); }} className="h-8 w-[85px] rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          <input type="number" placeholder="Salary max" value={salaryMaxFilter} onChange={(e) => { setSalaryMaxFilter(e.target.value); setPage(1); }} className="h-8 w-[85px] rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400" />

          <Select value={sortByFilter} onValueChange={(v) => { setSortByFilter(v ?? "newest"); setPage(1); }}>
            <SelectTrigger className="h-8 w-[100px] text-xs"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="title_asc">Title A-Z</SelectItem>
            </SelectContent>
          </Select>

          {activeFilterCount > 0 && (
            <button onClick={clearAllFilters} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap">
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          <AlertCircle className="size-3 shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="sticky top-0 z-10 bg-white border-b border-gray-200">
                <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Title</th>
                <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Client</th>
                <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Location</th>
                <th className="px-3 py-1.5 text-right text-[11px] uppercase tracking-wider text-gray-500 font-medium">Salary/Rate</th>
                <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Type</th>
                <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Source</th>
                <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Status</th>
                <th className="px-3 py-1.5 text-right text-[11px] uppercase tracking-wider text-gray-500 font-medium">Apps</th>
                <th className="px-3 py-1.5 text-right text-[11px] uppercase tracking-wider text-gray-500 font-medium">Days</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-3 py-8 text-center"><Loader2 className="mx-auto size-5 animate-spin text-gray-400" /></td></tr>
              ) : jobs.length === 0 ? (
                <tr><td colSpan={9} className="px-3 py-8 text-center text-xs text-gray-400"><Briefcase className="mx-auto mb-1 size-6 text-gray-300" />No jobs found</td></tr>
              ) : (
                jobs.map((job, idx) => {
                  const days = daysOpen(job.createdAt);
                  const candidateCount = job._count.applications;
                  const daysClass = days > 14 && candidateCount === 0 ? "text-red-600 font-semibold" : "text-gray-600";

                  return (
                    <tr
                      key={job.id}
                      className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                      style={{ height: "32px" }}
                    >
                      <td className="px-3 py-1.5">
                        <Link href={`/crm/jobs/${job.id}`} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline">
                          {job.title}
                        </Link>
                      </td>
                      <td className="px-3 py-1.5 text-xs text-gray-600">
                        {job.client ? (
                          <Link href={`/crm/clients/${job.client.id}`} className="hover:text-indigo-600 hover:underline">{job.client.companyName}</Link>
                        ) : (job.companyName || "-")}
                      </td>
                      <td className="px-3 py-1.5 text-xs text-gray-600">{job.location || "-"}</td>
                      <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-gray-600">{formatSalaryRate(job)}</td>
                      <td className="px-3 py-1.5">
                        {job.contractType ? (
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${CONTRACT_BG[job.contractType] ?? "bg-gray-50 text-gray-600"}`}>
                            {job.contractType.replace(/_/g, " ")}
                          </span>
                        ) : <span className="text-[10px] text-gray-300">-</span>}
                      </td>
                      <td className="px-3 py-1.5">
                        {job.source ? (
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${SOURCE_BADGE_COLORS[job.source] || SOURCE_BADGE_COLORS.OTHER}`}>
                            {formatSource(job.source)}
                          </span>
                        ) : "-"}
                      </td>
                      <td className="px-3 py-1.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_BG[job.status] || "bg-gray-50 text-gray-600"}`}>
                          <span className={`size-1.5 rounded-full ${STATUS_DOT[job.status] ?? "bg-gray-400"}`} />
                          {job.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-gray-600">{candidateCount}</td>
                      <td className={`px-3 py-1.5 text-right font-mono text-xs tabular-nums ${daysClass}`}>{days}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-3 py-2">
            <p className="text-[11px] text-gray-500">
              {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="rounded px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100 disabled:opacity-40">Prev</button>
              <span className="text-[11px] text-gray-500">{page}/{totalPages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="rounded px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
