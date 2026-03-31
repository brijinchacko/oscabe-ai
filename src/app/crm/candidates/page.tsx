"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Upload,
  Search,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Types ──────────────────────────────────────────────────────────────

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  location: string | null;
  headline: string | null;
  status: string;
  source: string | null;
  specialism: string | null;
  industry: string | null;
  contractType: string | null;
  rightToWork: boolean | null;
  salaryMin: number | null;
  salaryMax: number | null;
  noticePeriod: string | null;
  availableFrom: string | null;
  lastContactedAt: string | null;
  cvUrl: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { skills: number };
  skills?: Array<{
    skill: { name: string };
    proficiency: number | null;
  }>;
}

// ── Constants ──────────────────────────────────────────────────────────

const STATUS_DOT: Record<string, string> = {
  ACTIVE: "bg-green-500",
  SOURCED: "bg-blue-500",
  PLACED: "bg-purple-500",
  INACTIVE: "bg-gray-400",
  BLACKLISTED: "bg-red-500",
  PASSIVE: "bg-blue-400",
  UNAVAILABLE: "bg-gray-400",
};

const STATUS_BG: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700",
  SOURCED: "bg-blue-50 text-blue-700",
  PLACED: "bg-purple-50 text-purple-700",
  INACTIVE: "bg-gray-50 text-gray-600",
  BLACKLISTED: "bg-red-50 text-red-700",
  PASSIVE: "bg-blue-50 text-blue-700",
  UNAVAILABLE: "bg-gray-50 text-gray-600",
};

const STATUSES = ["ACTIVE", "SOURCED", "PLACED", "INACTIVE", "BLACKLISTED"];
const SOURCES = [
  "OSCABE_DATA_IMPORT",
  "LinkedIn",
  "Screening",
  "CV_Received",
  "Website",
  "Zoho",
  "Manual",
];
const CONTRACT_TYPES = ["PERMANENT", "CONTRACT", "FIXED_TERM"];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name_asc", label: "Name A-Z" },
  { value: "name_desc", label: "Name Z-A" },
  { value: "last_contacted", label: "Last Contacted" },
];

const INDUSTRIES = [
  "Automotive",
  "Pharma",
  "Water & Utilities",
  "Oil & Gas",
  "Food & Beverage",
  "Power Generation",
  "Building Automation",
  "Manufacturing",
  "Technology",
  "Professional Services",
  "Financial Services",
  "Other",
];

const SPECIALISMS = [
  "PLC Programming",
  "SCADA",
  "Controls Engineering",
  "Robotics",
  "EC&I",
  "Commissioning",
  "Software Development",
  "Data & AI",
  "Business Operations",
  "Project Management",
  "General",
];

// ── Helpers ────────────────────────────────────────────────────────────

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return "-";
  const fmt = (n: number) =>
    n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
  if (min && max) return `£${fmt(min)}-£${fmt(max)}`;
  if (min) return `£${fmt(min)}+`;
  return `Up to £${fmt(max!)}`;
}

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1d";
  if (diffDays < 7) return `${diffDays}d`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo`;
  return `${Math.floor(diffDays / 365)}y`;
}

// ── New Candidate Form ─────────────────────────────────────────────────

interface NewCandidateFormProps {
  onCreated: () => void;
  onClose: () => void;
}

function NewCandidateForm({ onCreated, onClose }: NewCandidateFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    headline: "",
    status: "ACTIVE",
    source: "",
    salaryMin: "",
    salaryMax: "",
    noticePeriod: "",
    notes: "",
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload: Record<string, unknown> = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
      };
      if (form.phone) payload.phone = form.phone;
      if (form.location) payload.location = form.location;
      if (form.headline) payload.headline = form.headline;
      if (form.status) payload.status = form.status;
      if (form.source) payload.source = form.source;
      if (form.salaryMin) payload.salaryMin = parseInt(form.salaryMin, 10);
      if (form.salaryMax) payload.salaryMax = parseInt(form.salaryMax, 10);
      if (form.noticePeriod) payload.noticePeriod = form.noticePeriod;
      if (form.notes) payload.notes = form.notes;

      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create candidate");
      }

      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      {error && (
        <div className="rounded-md bg-red-50 p-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="firstName" className="text-xs">First Name *</Label>
          <Input
            id="firstName"
            required
            className="h-8 text-xs"
            value={form.firstName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("firstName", e.target.value)
            }
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="lastName" className="text-xs">Last Name *</Label>
          <Input
            id="lastName"
            required
            className="h-8 text-xs"
            value={form.lastName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("lastName", e.target.value)
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="email" className="text-xs">Email *</Label>
          <Input
            id="email"
            type="email"
            required
            className="h-8 text-xs"
            value={form.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("email", e.target.value)
            }
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="phone" className="text-xs">Phone</Label>
          <Input
            id="phone"
            className="h-8 text-xs"
            value={form.phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("phone", e.target.value)
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="location" className="text-xs">Location</Label>
          <Input
            id="location"
            className="h-8 text-xs"
            value={form.location}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("location", e.target.value)
            }
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="headline" className="text-xs">Headline</Label>
          <Input
            id="headline"
            className="h-8 text-xs"
            value={form.headline}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("headline", e.target.value)
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) => updateField("status", v ?? "")}
          >
            <SelectTrigger className="h-8 text-xs w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Source</Label>
          <Select
            value={form.source}
            onValueChange={(v) => updateField("source", v ?? "")}
          >
            <SelectTrigger className="h-8 text-xs w-full">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {SOURCES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label htmlFor="salaryMin" className="text-xs">Salary Min (£)</Label>
          <Input
            id="salaryMin"
            type="number"
            className="h-8 text-xs"
            value={form.salaryMin}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("salaryMin", e.target.value)
            }
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="salaryMax" className="text-xs">Salary Max (£)</Label>
          <Input
            id="salaryMax"
            type="number"
            className="h-8 text-xs"
            value={form.salaryMax}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("salaryMax", e.target.value)
            }
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="noticePeriod" className="text-xs">Notice Period</Label>
          <Input
            id="noticePeriod"
            placeholder="e.g. 1 month"
            className="h-8 text-xs"
            value={form.noticePeriod}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("noticePeriod", e.target.value)
            }
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="notes" className="text-xs">Notes</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            updateField("notes", e.target.value)
          }
          rows={2}
          className="text-xs"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Creating..." : "Create Candidate"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────

export default function CandidatesPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [specialismFilter, setSpecialismFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [hasCVFilter, setHasCVFilter] = useState("");
  const [rightToWorkFilter, setRightToWorkFilter] = useState("");
  const [salaryMinFilter, setSalaryMinFilter] = useState("");
  const [salaryMaxFilter, setSalaryMaxFilter] = useState("");
  const [contractTypeFilter, setContractTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchCandidates = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (locationFilter) params.set("location", locationFilter);
      if (sourceFilter) params.set("source", sourceFilter);
      if (industryFilter) params.set("industry", industryFilter);
      if (specialismFilter) params.set("specialism", specialismFilter);
      if (hasCVFilter === "yes") params.set("hasCV", "true");
      if (rightToWorkFilter === "yes") params.set("rightToWork", "true");
      if (salaryMinFilter) params.set("salaryMin", salaryMinFilter);
      if (salaryMaxFilter) params.set("salaryMax", salaryMaxFilter);
      if (contractTypeFilter) params.set("contractType", contractTypeFilter);
      if (sortBy) params.set("sortBy", sortBy);

      const res = await fetch(`/api/candidates?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCandidates(data.candidates ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      console.error("Error fetching candidates:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, locationFilter, sourceFilter, industryFilter, specialismFilter, hasCVFilter, rightToWorkFilter, salaryMinFilter, salaryMaxFilter, contractTypeFilter, sortBy]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const activeFilterCount =
    (statusFilter ? 1 : 0) +
    (industryFilter ? 1 : 0) +
    (specialismFilter ? 1 : 0) +
    (sourceFilter ? 1 : 0) +
    (locationFilter ? 1 : 0) +
    (hasCVFilter ? 1 : 0) +
    (rightToWorkFilter ? 1 : 0) +
    (salaryMinFilter ? 1 : 0) +
    (salaryMaxFilter ? 1 : 0) +
    (contractTypeFilter ? 1 : 0) +
    (sortBy !== "newest" ? 1 : 0);

  function clearAllFilters() {
    setStatusFilter("");
    setIndustryFilter("");
    setSpecialismFilter("");
    setSourceFilter("");
    setLocationFilter("");
    setHasCVFilter("");
    setRightToWorkFilter("");
    setSalaryMinFilter("");
    setSalaryMaxFilter("");
    setContractTypeFilter("");
    setSortBy("newest");
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-3">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Candidates</h1>
          <p className="text-[11px] text-gray-500">{total} total</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Link href="/crm/candidates/import">
            <Button variant="outline" size="sm" className="h-7 text-xs px-2">
              <Upload className="size-3" />
              Import
            </Button>
          </Link>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button size="sm" className="h-7 text-xs px-2">
                  <Plus className="size-3" />
                  New
                </Button>
              }
            />
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Add New Candidate</DialogTitle>
              </DialogHeader>
              <NewCandidateForm
                onCreated={fetchCandidates}
                onClose={() => setDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter bar */}
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

          {/* Row 1: Search + main selects */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-8 w-[160px] rounded-md border border-gray-200 bg-white pl-7 pr-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : (v ?? "")); setPage(1); }}>
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={industryFilter} onValueChange={(v) => { setIndustryFilter(v === "all" ? "" : (v ?? "")); setPage(1); }}>
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={specialismFilter} onValueChange={(v) => { setSpecialismFilter(v === "all" ? "" : (v ?? "")); setPage(1); }}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Specialism" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialisms</SelectItem>
              {SPECIALISMS.map((sp) => (
                <SelectItem key={sp} value={sp}>{sp}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v === "all" ? "" : (v ?? "")); setPage(1); }}>
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {SOURCES.map((s) => (
                <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <input
            type="text"
            placeholder="Location..."
            value={locationFilter}
            onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}
            className="h-8 w-[110px] rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />

          <Select value={hasCVFilter} onValueChange={(v) => { setHasCVFilter(v === "all" ? "" : (v ?? "")); setPage(1); }}>
            <SelectTrigger className="h-8 w-[90px] text-xs">
              <SelectValue placeholder="Has CV" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any CV</SelectItem>
              <SelectItem value="yes">Has CV</SelectItem>
            </SelectContent>
          </Select>

          <Select value={rightToWorkFilter} onValueChange={(v) => { setRightToWorkFilter(v === "all" ? "" : (v ?? "")); setPage(1); }}>
            <SelectTrigger className="h-8 w-[100px] text-xs">
              <SelectValue placeholder="RTW" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any RTW</SelectItem>
              <SelectItem value="yes">Has RTW</SelectItem>
            </SelectContent>
          </Select>

          <input
            type="number"
            placeholder="Salary min"
            value={salaryMinFilter}
            onChange={(e) => { setSalaryMinFilter(e.target.value); setPage(1); }}
            className="h-8 w-[90px] rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
          <input
            type="number"
            placeholder="Salary max"
            value={salaryMaxFilter}
            onChange={(e) => { setSalaryMaxFilter(e.target.value); setPage(1); }}
            className="h-8 w-[90px] rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />

          <Select value={contractTypeFilter} onValueChange={(v) => { setContractTypeFilter(v === "all" ? "" : (v ?? "")); setPage(1); }}>
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue placeholder="Contract" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {CONTRACT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => { setSortBy(v ?? "newest"); setPage(1); }}>
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap"
            >
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
                <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Name</th>
                <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Status</th>
                <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Specialism</th>
                <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Location</th>
                <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Source</th>
                <th className="px-3 py-1.5 text-right text-[11px] uppercase tracking-wider text-gray-500 font-medium">Salary</th>
                <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Added</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-xs text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-xs text-gray-400">
                    No candidates found
                  </td>
                </tr>
              ) : (
                candidates.map((c, idx) => (
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/crm/candidates/${c.id}`)}
                    className={`cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                    style={{ height: "32px" }}
                  >
                    <td className="px-3 py-1.5">
                      <div>
                        <span className="text-xs font-medium text-gray-900">
                          {c.firstName} {c.lastName}
                        </span>
                        <span className="ml-2 text-[10px] text-gray-400">{c.email}</span>
                      </div>
                    </td>
                    <td className="px-3 py-1.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_BG[c.status] ?? "bg-gray-50 text-gray-600"}`}>
                        <span className={`size-1.5 rounded-full ${STATUS_DOT[c.status] ?? "bg-gray-400"}`} />
                        {c.status}
                      </span>
                    </td>
                    <td className="px-3 py-1.5">
                      {c.specialism ? (
                        <span className="inline-flex rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-700">
                          {c.specialism}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-3 py-1.5 text-xs text-gray-600">{c.location || "-"}</td>
                    <td className="px-3 py-1.5 text-xs text-gray-500">{c.source ? c.source.replace(/_/g, " ") : "-"}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-gray-600">{formatSalary(c.salaryMin, c.salaryMax)}</td>
                    <td className="px-3 py-1.5 text-xs text-gray-400">{formatRelativeDate(c.createdAt)}</td>
                  </tr>
                ))
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
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-[11px] text-gray-500">{page}/{totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
