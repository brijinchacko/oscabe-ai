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

const SOURCE_COLORS: Record<string, string> = {
  DIRECT: "bg-indigo-100 text-indigo-800",
  HIRING_HUB: "bg-green-100 text-green-800",
  TEAM_NETWORK: "bg-yellow-100 text-yellow-800",
  SPLITFEE: "bg-red-100 text-red-800",
  GIIG: "bg-purple-100 text-purple-800",
  RECXCHANGE: "bg-pink-100 text-pink-800",
  RECRUITING_HUB: "bg-cyan-100 text-cyan-800",
  PARAFORM: "bg-lime-100 text-lime-800",
  OTHER: "bg-gray-100 text-gray-800",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  STARTED: "bg-green-100 text-green-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
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
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const activeFilterCount =
    (filterSource ? 1 : 0) +
    (filterStatus ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0) +
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
      ? Math.round(
          placements.reduce((sum, p) => sum + p.feeAmount, 0) / placements.length
        )
      : 0;

  async function loadPlacements() {
    try {
      const params = new URLSearchParams();
      if (filterSource) params.set("source", filterSource);
      if (filterStatus) params.set("status", filterStatus);
      if (searchTerm) params.set("search", searchTerm);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
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
  }, [filterSource, filterStatus, searchTerm, dateFrom, dateTo, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Placements</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={<Button className="bg-[#4540DB] hover:bg-[#4540DB]/90 text-white" />}
          >
            <Plus className="mr-2 size-4" />
            Record Placement
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Placement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="candidateId">Candidate ID *</Label>
                  <Input id="candidateId" name="candidateId" required className="mt-1" placeholder="Paste candidate ID" />
                </div>
                <div>
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input id="clientId" name="clientId" className="mt-1" placeholder="Paste client ID" />
                </div>
              </div>
              <div>
                <Label htmlFor="role">Role Title *</Label>
                <Input id="role" name="role" required className="mt-1" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="salary">Salary (£)</Label>
                  <Input id="salary" name="salary" type="number" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="dayRate">Day Rate (£)</Label>
                  <Input id="dayRate" name="dayRate" type="number" className="mt-1" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="feeAmount">Fee Amount (£) *</Label>
                  <Input id="feeAmount" name="feeAmount" type="number" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="feePercent">Fee %</Label>
                  <Input id="feePercent" name="feePercent" type="number" step="0.1" className="mt-1" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input id="startDate" name="startDate" type="date" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" name="endDate" type="date" className="mt-1" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Source</Label>
                  <select name="source" defaultValue="DIRECT" className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm">
                    {JOB_SOURCES.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Status</Label>
                  <select name="status" defaultValue="PENDING" className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm">
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" className="mt-1" rows={3} />
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-[#4540DB] hover:bg-[#4540DB]/90 text-white">
                {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                {submitting ? "Saving..." : "Record Placement"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Revenue This Month</p>
            <PoundSterling className="size-5 text-gray-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">£{revenueThisMonth.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Revenue This Quarter</p>
            <TrendingUp className="size-5 text-gray-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">£{revenueThisQuarter.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Revenue This Year</p>
            <Calendar className="size-5 text-gray-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">£{revenueThisYear.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Avg Fee Per Placement</p>
            <BarChart3 className="size-5 text-gray-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">£{avgFee.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search candidate, role, client..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v === "all" ? "" : (v ?? ""))}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterSource} onValueChange={(v) => setFilterSource(v === "all" ? "" : (v ?? ""))}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {JOB_SOURCES.map((s) => (
                <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Label className="text-xs text-gray-500 whitespace-nowrap">From</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[150px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs text-gray-500 whitespace-nowrap">To</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[150px]"
            />
          </div>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v ?? "newest")}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="fee_high">Fee High-Low</SelectItem>
              <SelectItem value="fee_low">Fee Low-High</SelectItem>
            </SelectContent>
          </Select>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterSource("");
                setFilterStatus("");
                setSearchInput("");
                setSearchTerm("");
                setDateFrom("");
                setDateTo("");
                setSortBy("newest");
              }}
            >
              <X className="mr-1 size-3" />
              Clear all ({activeFilterCount})
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-500">Candidate</th>
                <th className="px-4 py-3 font-medium text-gray-500">Client</th>
                <th className="px-4 py-3 font-medium text-gray-500">Role</th>
                <th className="px-4 py-3 font-medium text-gray-500">Start Date</th>
                <th className="px-4 py-3 font-medium text-gray-500">Salary/Rate</th>
                <th className="px-4 py-3 font-medium text-gray-500">Fee</th>
                <th className="px-4 py-3 font-medium text-gray-500">Source</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : placements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    No placements found
                  </td>
                </tr>
              ) : (
                placements.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {p.candidate ? (
                        <Link href={`/crm/candidates/${p.candidate.id}`} className="font-medium text-[#4540DB] hover:underline">
                          {p.candidate.firstName} {p.candidate.lastName}
                        </Link>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.client ? (
                        <Link href={`/crm/clients/${p.client.id}`} className="text-[#4540DB] hover:underline">
                          {p.client.companyName}
                        </Link>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{p.role}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(p.startDate).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.salary ? `£${p.salary.toLocaleString()}` : p.dayRate ? `£${p.dayRate}/day` : "-"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      £{p.feeAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${SOURCE_COLORS[p.source] ?? "bg-gray-100 text-gray-800"}`}>
                        {p.source.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-800"}`}>
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
