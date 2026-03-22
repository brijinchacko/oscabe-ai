"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Loader2,
  Users,
  UserPlus,
  Mail,
  MessageSquare,
  ArrowUpRight,
  MoreHorizontal,
  Compass,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { toast } from "sonner";
import { INDUSTRIES } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Prospect {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string | null;
  jobTitle: string | null;
  industry: string | null;
  companySize: string | null;
  location: string | null;
  technologies: string | null;
  linkedIn: string | null;
  source: string;
  status: string;
  segment: string | null;
  lastContactedAt: string | null;
  createdAt: string;
  _count: {
    outreachEmails: number;
    outreachReplies: number;
  };
}

interface Stats {
  total: number;
  newThisWeek: number;
  contacted: number;
  replied: number;
  converted: number;
}

interface FetchResponse {
  prospects: Prospect[];
  total: number;
  page: number;
  pageSize: number;
  stats: Stats;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: "NEW", label: "New", color: "bg-blue-100 text-blue-800" },
  { value: "CONTACTED", label: "Contacted", color: "bg-yellow-100 text-yellow-800" },
  { value: "REPLIED", label: "Replied", color: "bg-green-100 text-green-800" },
  { value: "CONVERTED", label: "Converted", color: "bg-purple-100 text-purple-800" },
  { value: "OPTED_OUT", label: "Opted Out", color: "bg-red-100 text-red-800" },
];

function statusColor(status: string) {
  return STATUS_OPTIONS.find((s) => s.value === status)?.color || "bg-gray-200 text-gray-800";
}

function statusLabel(status: string) {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label || status;
}

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Create Prospect Form
// ---------------------------------------------------------------------------

function CreateProspectForm({
  onSuccess,
  onClose,
}: {
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    jobTitle: "",
    industry: "",
    location: "",
    linkedIn: "",
    technologies: "",
    segment: "",
    notes: "",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) return;

    setSaving(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
      };
      if (form.company) body.company = form.company;
      if (form.jobTitle) body.jobTitle = form.jobTitle;
      if (form.industry) body.industry = form.industry;
      if (form.location) body.location = form.location;
      if (form.linkedIn) body.linkedIn = form.linkedIn;
      if (form.technologies) body.technologies = form.technologies;
      if (form.segment) body.segment = form.segment;
      if (form.notes) body.notes = form.notes;

      const res = await fetch("/api/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create prospect");
      }

      toast.success("Prospect created successfully");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>First Name <span className="text-red-500">*</span></Label>
          <Input className="mt-1.5" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required />
        </div>
        <div>
          <Label>Last Name <span className="text-red-500">*</span></Label>
          <Input className="mt-1.5" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required />
        </div>
      </div>

      <div>
        <Label>Email <span className="text-red-500">*</span></Label>
        <Input className="mt-1.5" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required placeholder="prospect@company.com" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Company</Label>
          <Input className="mt-1.5" value={form.company} onChange={(e) => set("company", e.target.value)} />
        </div>
        <div>
          <Label>Job Title</Label>
          <Input className="mt-1.5" value={form.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Industry</Label>
          <Select value={form.industry} onValueChange={(v) => set("industry", v ?? "")}>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Location</Label>
          <Input className="mt-1.5" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="London, UK" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>LinkedIn</Label>
          <Input className="mt-1.5" value={form.linkedIn} onChange={(e) => set("linkedIn", e.target.value)} placeholder="https://linkedin.com/in/..." />
        </div>
        <div>
          <Label>Segment</Label>
          <Input className="mt-1.5" value={form.segment} onChange={(e) => set("segment", e.target.value)} placeholder="e.g. Enterprise, SMB" />
        </div>
      </div>

      <div>
        <Label>Technologies</Label>
        <Input className="mt-1.5" value={form.technologies} onChange={(e) => set("technologies", e.target.value)} placeholder="Siemens, Rockwell, TIA Portal..." />
      </div>

      <div>
        <Label>Notes</Label>
        <Textarea className="mt-1.5" value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={saving || !form.firstName.trim() || !form.lastName.trim() || !form.email.trim()}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          Create Prospect
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Discover Prospects Dialog
// ---------------------------------------------------------------------------

function DiscoverForm({
  onSuccess,
  onClose,
}: {
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ imported: number; skipped: number; total: number } | null>(null);
  const [form, setForm] = useState({
    jobTitle: "",
    industry: "",
    location: "",
    companySize: "",
    technologies: "",
    limit: "25",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const body: Record<string, unknown> = {};
      if (form.jobTitle) body.jobTitle = form.jobTitle;
      if (form.industry) body.industry = form.industry;
      if (form.location) body.location = form.location;
      if (form.companySize) body.companySize = form.companySize;
      if (form.technologies) body.technologies = form.technologies;
      body.limit = parseInt(form.limit, 10) || 25;

      const res = await fetch("/api/prospects/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Discovery failed");

      setResult(data);
      if (data.imported > 0) {
        toast.success(`Imported ${data.imported} new prospects`);
        onSuccess();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      {result && (
        <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Found {result.total} prospects. Imported {result.imported}, skipped {result.skipped} (duplicates/suppressed).
        </div>
      )}

      <div>
        <Label>Job Title / Role</Label>
        <Input className="mt-1.5" value={form.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} placeholder="e.g. Controls Engineer, PLC Programmer" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Industry</Label>
          <Select value={form.industry} onValueChange={(v) => set("industry", v ?? "")}>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Location</Label>
          <Input className="mt-1.5" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="UK, London..." />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Company Size</Label>
          <Select value={form.companySize} onValueChange={(v) => set("companySize", v ?? "")}>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10</SelectItem>
              <SelectItem value="11-50">11-50</SelectItem>
              <SelectItem value="51-200">51-200</SelectItem>
              <SelectItem value="201-500">201-500</SelectItem>
              <SelectItem value="501-1000">501-1000</SelectItem>
              <SelectItem value="1001-5000">1001-5000</SelectItem>
              <SelectItem value="5001+">5001+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Max Results</Label>
          <Input className="mt-1.5" type="number" min="1" max="100" value={form.limit} onChange={(e) => set("limit", e.target.value)} />
        </div>
      </div>

      <div>
        <Label>Technologies</Label>
        <Input className="mt-1.5" value={form.technologies} onChange={(e) => set("technologies", e.target.value)} placeholder="Siemens, Rockwell, TwinCAT..." />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Compass className="size-4" />}
          Discover Prospects
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Bulk Actions Bar
// ---------------------------------------------------------------------------

function BulkActionsBar({
  selectedIds,
  onClear,
  onRefresh,
}: {
  selectedIds: string[];
  onClear: () => void;
  onRefresh: () => void;
}) {
  const [statusChanging, setStatusChanging] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function handleChangeStatus(status: string) {
    setStatusChanging(true);
    try {
      const res = await fetch("/api/prospects/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change_status", prospectIds: selectedIds, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Updated ${data.updated} prospects`);
      onClear();
      onRefresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setStatusChanging(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/prospects/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "export", prospectIds: selectedIds }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prospects-export-${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} prospect(s)? They will be added to the suppression list.`)) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/prospects/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", prospectIds: selectedIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Deleted ${data.deleted} prospects`);
      onClear();
      onRefresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2">
      <CheckSquare className="size-4 text-indigo-600" />
      <span className="text-sm font-medium text-indigo-700">{selectedIds.length} selected</span>
      <div className="mx-2 h-4 w-px bg-indigo-200" />

      <Select onValueChange={(v) => { if (v) handleChangeStatus(v as string); }} disabled={statusChanging}>
        <SelectTrigger className="h-8 w-40 text-xs">
          <SelectValue placeholder="Change Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((s) => (
            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
        {exporting ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
        Export
      </Button>

      <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting} className="text-red-600 hover:text-red-700">
        {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
        Delete
      </Button>

      <Button variant="ghost" size="sm" onClick={onClear} className="ml-auto text-xs">
        Clear
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ProspectsPage() {
  const router = useRouter();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, newThisWeek: 0, contacted: 0, replied: 0, converted: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  const fetchProspects = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (industryFilter) params.set("industry", industryFilter);
      if (segmentFilter) params.set("segment", segmentFilter);

      const res = await fetch(`/api/prospects?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: FetchResponse = await res.json();
      setProspects(data.prospects);
      setTotal(data.total);
      setStats(data.stats);
    } catch {
      toast.error("Failed to load prospects");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, industryFilter, segmentFilter, page]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      fetchProspects();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchProspects]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [search, statusFilter, industryFilter, segmentFilter]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === prospects.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(prospects.map((p) => p.id));
    }
  }

  // Get unique segments from loaded prospects for filter
  const segments = [...new Set(prospects.map((p) => p.segment).filter(Boolean))] as string[];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Users className="size-5 text-indigo-600" />
          <h1 className="text-lg font-bold text-gray-900">Prospects</h1>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Discover */}
          <Dialog open={discoverOpen} onOpenChange={setDiscoverOpen}>
            <DialogTrigger
              render={
                <Button variant="outline">
                  <Compass className="size-4" />
                  Discover Prospects
                </Button>
              }
            />
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Discover Prospects via Apollo</DialogTitle>
              </DialogHeader>
              <DiscoverForm onSuccess={fetchProspects} onClose={() => setDiscoverOpen(false)} />
            </DialogContent>
          </Dialog>

          {/* Add Prospect */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger
              render={
                <Button>
                  <Plus className="size-4" />
                  Add Prospect
                </Button>
              }
            />
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Prospect</DialogTitle>
              </DialogHeader>
              <CreateProspectForm onSuccess={fetchProspects} onClose={() => setCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Users className="size-3.5" />
            Total Prospects
          </div>
          <p className="mt-1 text-xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <UserPlus className="size-3.5" />
            New This Week
          </div>
          <p className="mt-1 text-xl font-bold text-blue-600">{stats.newThisWeek}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Mail className="size-3.5" />
            Contacted
          </div>
          <p className="mt-1 text-xl font-bold text-yellow-600">{stats.contacted}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MessageSquare className="size-3.5" />
            Replied
          </div>
          <p className="mt-1 text-xl font-bold text-green-600">{stats.replied}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <ArrowUpRight className="size-3.5" />
            Converted
          </div>
          <p className="mt-1 text-xl font-bold text-purple-600">{stats.converted}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search prospects..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === "ALL" ? "" : v ?? "")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={industryFilter} onValueChange={(v) => setIndustryFilter(v === "ALL" ? "" : v ?? "")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Industries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Industries</SelectItem>
            {INDUSTRIES.map((ind) => (
              <SelectItem key={ind} value={ind}>{ind}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {segments.length > 0 && (
          <Select value={segmentFilter} onValueChange={(v) => setSegmentFilter(v === "ALL" ? "" : v ?? "")}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Segments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Segments</SelectItem>
              {segments.map((seg) => (
                <SelectItem key={seg} value={seg}>{seg}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="mb-4">
          <BulkActionsBar
            selectedIds={selectedIds}
            onClear={() => setSelectedIds([])}
            onRefresh={fetchProspects}
          />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-indigo-500" />
        </div>
      )}

      {/* Table */}
      {!loading && (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-3 py-3">
                    <Checkbox
                      checked={prospects.length > 0 && selectedIds.length === prospects.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Company</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Job Title</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Industry</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Last Contacted</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Source</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prospects.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                      No prospects found. Add your first prospect or discover new ones.
                    </td>
                  </tr>
                )}
                {prospects.map((prospect) => (
                  <tr
                    key={prospect.id}
                    className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${
                      selectedIds.includes(prospect.id) ? "bg-indigo-50/50" : ""
                    }`}
                  >
                    <td className="px-3 py-3">
                      <Checkbox
                        checked={selectedIds.includes(prospect.id)}
                        onCheckedChange={() => toggleSelect(prospect.id)}
                      />
                    </td>
                    <td
                      className="cursor-pointer px-4 py-3 font-medium text-gray-900"
                      onClick={() => router.push(`/crm/prospects/${prospect.id}`)}
                    >
                      {prospect.firstName} {prospect.lastName}
                      <p className="text-xs font-normal text-gray-500">{prospect.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{prospect.company || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{prospect.jobTitle || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{prospect.industry || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(prospect.status)}`}>
                        {statusLabel(prospect.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(prospect.lastContactedAt)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-xs">{prospect.source}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/crm/prospects/${prospect.id}`)}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} prospects
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="px-3 text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
