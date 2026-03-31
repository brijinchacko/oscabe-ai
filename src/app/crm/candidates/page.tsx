"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  Upload,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
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
import {
  DataTable,
  type PaginationState,
} from "@/components/shared/data-table";

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
  salaryMin: number | null;
  salaryMax: number | null;
  noticePeriod: string | null;
  availableFrom: string | null;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { skills: number };
  skills?: Array<{
    skill: { name: string };
    proficiency: number | null;
  }>;
}

// ── Status badge config ────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  PASSIVE: "bg-blue-100 text-blue-800",
  PLACED: "bg-purple-100 text-purple-800",
  UNAVAILABLE: "bg-gray-100 text-gray-800",
  INACTIVE: "bg-red-100 text-red-800",
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

function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {status}
    </span>
  );
}

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return "-";
  const fmt = (n: number) =>
    n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
  if (min && max) return `£${fmt(min)} - £${fmt(max)}`;
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
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

// ── Columns ────────────────────────────────────────────────────────────

const columns: ColumnDef<Candidate, unknown>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const c = row.original;
      return (
        <Link
          href={`/crm/candidates/${c.id}`}
          className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
        >
          {c.firstName} {c.lastName}
        </Link>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.location ?? "-"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "skills",
    header: "Top Skills",
    cell: ({ row }) => {
      const skills = row.original.skills ?? [];
      if (skills.length === 0) {
        return <span className="text-xs text-muted-foreground">-</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {skills.slice(0, 3).map((s, i) => (
            <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
              {s.skill.name}
            </Badge>
          ))}
          {skills.length > 3 && (
            <span className="text-[10px] text-muted-foreground">
              +{skills.length - 3}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "salary",
    header: "Salary Range",
    cell: ({ row }) => (
      <span className="text-sm">
        {formatSalary(row.original.salaryMin, row.original.salaryMax)}
      </span>
    ),
  },
  {
    accessorKey: "availableFrom",
    header: "Availability",
    cell: ({ row }) => {
      const d = row.original.availableFrom;
      if (!d) return <span className="text-sm text-muted-foreground">-</span>;
      return (
        <span className="text-sm">
          {new Date(d).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.source
          ? row.original.source.replace(/_/g, " ")
          : "-"}
      </span>
    ),
  },
  {
    accessorKey: "lastContactedAt",
    header: "Last Contacted",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatRelativeDate(row.original.lastContactedAt)}
      </span>
    ),
  },
];

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
    <form onSubmit={handleSubmit} className="grid gap-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            required
            value={form.firstName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("firstName", e.target.value)
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            required
            value={form.lastName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("lastName", e.target.value)
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("email", e.target.value)
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("phone", e.target.value)
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={form.location}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("location", e.target.value)
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="headline">Headline</Label>
          <Input
            id="headline"
            value={form.headline}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("headline", e.target.value)
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) => updateField("status", v ?? "")}
          >
            <SelectTrigger className="w-full">
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
        <div className="space-y-1.5">
          <Label>Source</Label>
          <Select
            value={form.source}
            onValueChange={(v) => updateField("source", v ?? "")}
          >
            <SelectTrigger className="w-full">
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

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="salaryMin">Salary Min (£)</Label>
          <Input
            id="salaryMin"
            type="number"
            value={form.salaryMin}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("salaryMin", e.target.value)
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="salaryMax">Salary Max (£)</Label>
          <Input
            id="salaryMax"
            type="number"
            value={form.salaryMax}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("salaryMax", e.target.value)
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="noticePeriod">Notice Period</Label>
          <Input
            id="noticePeriod"
            placeholder="e.g. 1 month"
            value={form.noticePeriod}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("noticePeriod", e.target.value)
            }
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            updateField("notes", e.target.value)
          }
          rows={3}
        />
      </div>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>
          Cancel
        </DialogClose>
        <Button type="submit" disabled={loading}>
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
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [specialismFilter, setSpecialismFilter] = useState("");
  const [hasCVFilter, setHasCVFilter] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  // Pagination
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 20,
    total: 0,
  });

  const fetchCandidates = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(pagination.page));
      params.set("pageSize", String(pagination.pageSize));
      if (search) params.set("search", search);
      if (statusFilters.length === 1) params.set("status", statusFilters[0]);
      if (locationFilter) params.set("location", locationFilter);
      if (sourceFilter) params.set("source", sourceFilter);
      if (industryFilter) params.set("industry", industryFilter);
      if (specialismFilter) params.set("specialism", specialismFilter);
      if (hasCVFilter) params.set("hasCV", "true");
      if (sortBy) params.set("sortBy", sortBy);

      const res = await fetch(`/api/candidates?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCandidates(data.candidates ?? []);
      setPagination((prev) => ({ ...prev, total: data.total ?? 0 }));
    } catch (err) {
      console.error("Error fetching candidates:", err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.pageSize, search, statusFilters, locationFilter, sourceFilter, industryFilter, specialismFilter, hasCVFilter, sortBy]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  function toggleStatus(status: string) {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  function handleSearchChange(query: string) {
    setSearch(query);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  function handlePageChange(page: number, pageSize: number) {
    setPagination((prev) => ({ ...prev, page, pageSize }));
  }

  const activeFilterCount =
    statusFilters.length +
    (locationFilter ? 1 : 0) +
    (sourceFilter ? 1 : 0) +
    (industryFilter ? 1 : 0) +
    (specialismFilter ? 1 : 0) +
    (hasCVFilter ? 1 : 0) +
    (sortBy !== "newest" ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Candidates
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and search your candidate database
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/crm/candidates/import">
            <Button variant="outline" size="sm">
              <Upload className="size-3.5" />
              Import CSV
            </Button>
          </Link>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button size="sm">
                  <Plus className="size-3.5" />
                  New Candidate
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

      {/* Filters bar */}
      <div className="rounded-lg border bg-white p-4">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex w-full items-center justify-between text-sm font-medium text-gray-700"
        >
          <div className="flex items-center gap-2">
            <Filter className="size-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          {filtersOpen ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </button>

        {filtersOpen && (
          <>
            <Separator className="my-3" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {/* Status checkboxes */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </Label>
                <div className="space-y-1.5">
                  {STATUSES.map((s) => (
                    <label
                      key={s}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={statusFilters.includes(s)}
                        onCheckedChange={() => toggleStatus(s)}
                      />
                      <StatusBadge status={s} />
                    </label>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </Label>
                <Input
                  placeholder="e.g. London"
                  value={locationFilter}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setLocationFilter(e.target.value);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                />
              </div>

              {/* Source */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </Label>
                <Select
                  value={sourceFilter}
                  onValueChange={(v) => {
                    setSourceFilter(v ?? "");
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All sources</SelectItem>
                    {SOURCES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Industry
                </Label>
                <Select
                  value={industryFilter}
                  onValueChange={(v) => {
                    setIndustryFilter(v ?? "");
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All industries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All industries</SelectItem>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Specialism */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialism
                </Label>
                <Select
                  value={specialismFilter}
                  onValueChange={(v) => {
                    setSpecialismFilter(v ?? "");
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All specialisms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All specialisms</SelectItem>
                    {SPECIALISMS.map((sp) => (
                      <SelectItem key={sp} value={sp}>
                        {sp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Has CV */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Has CV
                </Label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={hasCVFilter}
                    onCheckedChange={(checked) => {
                      setHasCVFilter(!!checked);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                  />
                  <span className="text-sm text-gray-700">CV uploaded</span>
                </label>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sort By
                </Label>
                <Select
                  value={sortBy}
                  onValueChange={(v) => {
                    setSortBy(v ?? "newest");
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear filters */}
              <div className="flex items-end">
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStatusFilters([]);
                      setLocationFilter("");
                      setSourceFilter("");
                      setIndustryFilter("");
                      setSpecialismFilter("");
                      setHasCVFilter(false);
                      setSortBy("newest");
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Data table */}
      <div className="rounded-lg bg-white">
        <DataTable
          columns={columns}
          data={candidates}
          pagination={pagination}
          onPaginationChange={handlePageChange}
          onSearchChange={handleSearchChange}
          isLoading={isLoading}
          emptyMessage="No candidates found. Add your first candidate to get started."
        />
      </div>
    </div>
  );
}
