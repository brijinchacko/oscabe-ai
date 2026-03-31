"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  PoundSterling,
  TrendingUp,
  Calendar,
  BarChart3,
  Plus,
  Loader2,
  Search,
  X,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Placement {
  id: string;
  role: string;
  salary: number | null;
  dayRate: number | null;
  feeAmount: number;
  feePercent: number | null;
  startDate: string;
  endDate: string | null;
  source: string;
  status: string;
  invoicedAt: string | null;
  paidAt: string | null;
  createdAt: string;
  candidate: { id: string; firstName: string; lastName: string } | null;
  client: { id: string; companyName: string } | null;
  job: { id: string; title: string } | null;
}

const JOB_SOURCES = [
  "DIRECT", "HIRING_HUB", "TEAM_NETWORK", "SPLITFEE",
  "GIIG", "RECXCHANGE", "RECRUITING_HUB", "PARAFORM", "OTHER",
];

const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "STARTED", "COMPLETED", "CANCELLED"];

const SOURCE_DOT: Record<string, string> = {
  DIRECT: "bg-indigo-500",
  HIRING_HUB: "bg-green-500",
  TEAM_NETWORK: "bg-yellow-500",
  SPLITFEE: "bg-red-500",
  GIIG: "bg-purple-500",
  RECXCHANGE: "bg-pink-500",
  RECRUITING_HUB: "bg-cyan-500",
  PARAFORM: "bg-lime-500",
  OTHER: "bg-gray-400",
};

const SOURCE_BG: Record<string, string> = {
  DIRECT: "bg-indigo-50 text-indigo-700",
  HIRING_HUB: "bg-green-50 text-green-700",
  TEAM_NETWORK: "bg-yellow-50 text-yellow-700",
  SPLITFEE: "bg-red-50 text-red-700",
  GIIG: "bg-purple-50 text-purple-700",
  RECXCHANGE: "bg-pink-50 text-pink-700",
  RECRUITING_HUB: "bg-cyan-50 text-cyan-700",
  PARAFORM: "bg-lime-50 text-lime-700",
  OTHER: "bg-gray-50 text-gray-600",
};

const STATUS_DOT: Record<string, string> = {
  PENDING: "bg-yellow-500",
  CONFIRMED: "bg-blue-500",
  STARTED: "bg-green-500",
  COMPLETED: "bg-gray-400",
  CANCELLED: "bg-red-500",
};

const STATUS_BG: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  STARTED: "bg-green-50 text-green-700",
  COMPLETED: "bg-gray-50 text-gray-600",
  CANCELLED: "bg-red-50 text-red-700",
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PlacementsPage() {
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterSource, setFilterSource] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [feeMin, setFeeMin] = useState("");
  const [feeMax, setFeeMax] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const activeFilterCount =
    (filterSource ? 1 : 0) +
    (filterStatus ? 1 : 0) +
    (filterClient ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0) +
    (feeMin ? 1 : 0) +
    (feeMax ? 1 : 0) +
    (sortBy !== "newest" ? 1 : 0);

  // Stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const revenueThisMonth = placements
    .filter((p) => new Date(p.startDate) >= startOfMonth)
    .reduce((sum, p) => sum + p.feeAmount, 0);
  const revenueThisQuarter = placements
    .filter((p) => new Date(p.startDate) >= startOfQuarter)
    .reduce((sum, p) => sum + p.feeAmount, 0);
  const revenueThisYear = placements
    .filter((p) => new Date(p.startDate) >= startOfYear)
    .reduce((sum, p) => sum + p.feeAmount, 0);
  const avgFee =
    placements.length > 0
      ? Math.round(placements.reduce((sum, p) => sum + p.feeAmount, 0) / placements.length)
      : 0;

  async function loadPlacements() {
    try {
      const params = new URLSearchParams();
      if (filterSource) params.set("source", filterSource);
      if (filterStatus) params.set("status", filterStatus);
      if (filterClient) params.set("clientId", filterClient);
      if (searchTerm) params.set("search", searchTerm);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      if (feeMin) params.set("feeMin", feeMin);
      if (feeMax) params.set("feeMax", feeMax);
      if (sortBy) params.set("sortBy", sortBy);
      const res = await fetch(`/api/placements?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPlacements(data.placements ?? []);
      }
    } catch {
      toast.error("Failed to load placements");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    loadPlacements();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSource, filterStatus, filterClient, searchTerm, dateFrom, dateTo, feeMin, feeMax, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => { setSearchTerm(searchInput); }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      candidateId: fd.get("candidateId") as string,
      clientId: fd.get("clientId") as string,
      jobId: (fd.get("jobId") as string) || undefined,
      role: fd.get("role") as string,
      salary: fd.get("salary") ? Number(fd.get("salary")) : undefined,
      dayRate: fd.get("dayRate") ? Number(fd.get("dayRate")) : undefined,
      feeAmount: Number(fd.get("feeAmount")),
      feePercent: fd.get("feePercent") ? Number(fd.get("feePercent")) : undefined,
      startDate: fd.get("startDate") as string,
      endDate: (fd.get("endDate") as string) || undefined,
      source: fd.get("source") as string,
      status: fd.get("status") as string,
      notes: (fd.get("notes") as string) || undefined,
    };

    try {
      const res = await fetch("/api/placements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Placement recorded");
      setDialogOpen(false);
      setLoading(true);
      loadPlacements();
    } catch {
      toast.error("Failed to create placement");
    } finally {
      setSubmitting(false);
    }
  }

  function clearAllFilters() {
    setFilterSource("");
    setFilterStatus("");
    setFilterClient("");
    setSearchInput("");
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
    setFeeMin("");
    setFeeMax("");
    setSortBy("newest");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Placements</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={<Button size="sm" className="h-7 text-xs px-2" />}
          >
            <Plus className="size-3" />
            Record Placement
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Placement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label className="text-xs" htmlFor="candidateId">Candidate ID *</Label><Input id="candidateId" name="candidateId" required className="mt-1 h-8 text-xs" placeholder="Paste candidate ID" /></div>
                <div><Label className="text-xs" htmlFor="clientId">Client ID</Label><Input id="clientId" name="clientId" className="mt-1 h-8 text-xs" placeholder="Paste client ID" /></div>
              </div>
              <div><Label className="text-xs" htmlFor="role">Role Title *</Label><Input id="role" name="role" required className="mt-1 h-8 text-xs" /></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label className="text-xs" htmlFor="salary">Salary</Label><Input id="salary" name="salary" type="number" className="mt-1 h-8 text-xs" /></div>
                <div><Label className="text-xs" htmlFor="dayRate">Day Rate</Label><Input id="dayRate" name="dayRate" type="number" className="mt-1 h-8 text-xs" /></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label className="text-xs" htmlFor="feeAmount">Fee Amount *</Label><Input id="feeAmount" name="feeAmount" type="number" required className="mt-1 h-8 text-xs" /></div>
                <div><Label className="text-xs" htmlFor="feePercent">Fee %</Label><Input id="feePercent" name="feePercent" type="number" step="0.1" className="mt-1 h-8 text-xs" /></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label className="text-xs" htmlFor="startDate">Start Date *</Label><Input id="startDate" name="startDate" type="date" required className="mt-1 h-8 text-xs" /></div>
                <div><Label className="text-xs" htmlFor="endDate">End Date</Label><Input id="endDate" name="endDate" type="date" className="mt-1 h-8 text-xs" /></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label className="text-xs">Source</Label><select name="source" defaultValue="DIRECT" className="mt-1 w-full h-8 rounded-md border border-gray-200 px-2 text-xs">{JOB_SOURCES.map((s) => (<option key={s} value={s}>{s.replace(/_/g, " ")}</option>))}</select></div>
                <div><Label className="text-xs">Status</Label><select name="status" defaultValue="PENDING" className="mt-1 w-full h-8 rounded-md border border-gray-200 px-2 text-xs">{STATUS_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}</select></div>
              </div>
              <div><Label className="text-xs" htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" className="mt-1 text-xs" rows={2} /></div>
              <Button type="submit" disabled={submitting} size="sm" className="w-full">
                {submitting ? <Loader2 className="size-3 animate-spin" /> : null}
                {submitting ? "Saving..." : "Record Placement"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Compact stat cards */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Month", value: revenueThisMonth, icon: PoundSterling },
          { label: "Quarter", value: revenueThisQuarter, icon: TrendingUp },
          { label: "Year", value: revenueThisYear, icon: Calendar },
          { label: "Avg Fee", value: avgFee, icon: BarChart3 },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2">
            <div>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-sm font-bold font-mono tabular-nums text-gray-900">{"\u00A3"}{stat.value.toLocaleString()}</p>
            </div>
            <stat.icon className="size-4 text-gray-300" />
          </div>
        ))}
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
            <input type="text" placeholder="Search..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="h-8 w-[140px] rounded-md border border-gray-200 bg-white pl-7 pr-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          </div>

          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v === "all" ? "" : (v ?? ""))}>
            <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
            </SelectContent>
          </Select>

          <Select value={filterSource} onValueChange={(v) => setFilterSource(v === "all" ? "" : (v ?? ""))}>
            <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {JOB_SOURCES.map((s) => (<SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>))}
            </SelectContent>
          </Select>

          <input type="text" placeholder="Client..." value={filterClient} onChange={(e) => setFilterClient(e.target.value)} className="h-8 w-[100px] rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400" />

          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-8 w-[120px] rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-8 w-[120px] rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400" />

          <input type="number" placeholder="Fee min" value={feeMin} onChange={(e) => setFeeMin(e.target.value)} className="h-8 w-[80px] rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          <input type="number" placeholder="Fee max" value={feeMax} onChange={(e) => setFeeMax(e.target.value)} className="h-8 w-[80px] rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400" />

          <Select value={sortBy} onValueChange={(v) => setSortBy(v ?? "newest")}>
            <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="fee_high">Fee High</SelectItem>
              <SelectItem value="fee_low">Fee Low</SelectItem>
            </SelectContent>
          </Select>

          {activeFilterCount > 0 && (
            <button onClick={clearAllFilters} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap">
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="sticky top-0 z-10 bg-white border-b border-gray-200">
                <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Candidate</th>
                <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Client</th>
                <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Role</th>
                <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Start</th>
                <th className="px-3 py-1.5 text-right text-[11px] uppercase tracking-wider text-gray-500 font-medium">Salary/Rate</th>
                <th className="px-3 py-1.5 text-right text-[11px] uppercase tracking-wider text-gray-500 font-medium">Fee</th>
                <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Source</th>
                <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-3 py-1.5"><div className="h-3 w-16 animate-pulse rounded bg-gray-200" /></td>
                    ))}
                  </tr>
                ))
              ) : placements.length === 0 ? (
                <tr><td colSpan={8} className="px-3 py-8 text-center text-xs text-gray-400">No placements found</td></tr>
              ) : (
                placements.map((p, idx) => (
                  <tr key={p.id} className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`} style={{ height: "32px" }}>
                    <td className="px-3 py-1.5">
                      {p.candidate ? (
                        <Link href={`/crm/candidates/${p.candidate.id}`} className="text-xs font-medium text-indigo-600 hover:underline">
                          {p.candidate.firstName} {p.candidate.lastName}
                        </Link>
                      ) : <span className="text-xs text-gray-300">-</span>}
                    </td>
                    <td className="px-3 py-1.5">
                      {p.client ? (
                        <Link href={`/crm/clients/${p.client.id}`} className="text-xs text-indigo-600 hover:underline">{p.client.companyName}</Link>
                      ) : <span className="text-xs text-gray-300">-</span>}
                    </td>
                    <td className="px-3 py-1.5 text-xs font-medium text-gray-900">{p.role}</td>
                    <td className="px-3 py-1.5 text-xs text-gray-500">{new Date(p.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-gray-600">
                      {p.salary ? `\u00A3${p.salary.toLocaleString()}` : p.dayRate ? `\u00A3${p.dayRate}/d` : "-"}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums font-semibold text-gray-900">{"\u00A3"}{p.feeAmount.toLocaleString()}</td>
                    <td className="px-3 py-1.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${SOURCE_BG[p.source] ?? "bg-gray-50 text-gray-600"}`}>
                        <span className={`size-1.5 rounded-full ${SOURCE_DOT[p.source] ?? "bg-gray-400"}`} />
                        {p.source.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-3 py-1.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_BG[p.status] ?? "bg-gray-50 text-gray-600"}`}>
                        <span className={`size-1.5 rounded-full ${STATUS_DOT[p.status] ?? "bg-gray-400"}`} />
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
