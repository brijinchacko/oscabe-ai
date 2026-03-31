"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import {
  Building2,
  LayoutGrid,
  List,
  Plus,
  Search,
  GripVertical,
  Briefcase,
  Loader2,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
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
import { CLIENT_PIPELINE_STAGES, INDUSTRIES } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Client {
  id: string;
  companyName: string;
  industry: string | null;
  location: string | null;
  website: string | null;
  source: string | null;
  feeAgreement: string | null;
  defaultFeePercent: number | null;
  pipelineStage: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
  _count: {
    contacts: number;
    jobs: number;
  };
  contacts?: { firstName: string; lastName: string; isPrimary: boolean }[];
}

interface FetchResponse {
  clients: Client[];
  total: number;
  page: number;
  pageSize: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stageInfo(value: string) {
  return (
    CLIENT_PIPELINE_STAGES.find((s) => s.value === value) ?? {
      value,
      label: value,
      color: "bg-gray-200 text-gray-800",
    }
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Draggable Card
// ---------------------------------------------------------------------------

function DraggableCard({
  client,
  onClick,
}: {
  client: Client;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: client.id });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const primaryContact = client.contacts?.find((c) => c.isPrimary);
  const stage = stageInfo(client.pipelineStage);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={onClick}
          className="min-w-0 flex-1 text-left"
        >
          <p className="truncate text-sm font-semibold text-gray-900">
            {client.companyName}
          </p>
          {primaryContact && (
            <p className="mt-0.5 truncate text-xs text-gray-500">
              {primaryContact.firstName} {primaryContact.lastName}
            </p>
          )}
        </button>
        <div
          {...listeners}
          {...attributes}
          className="cursor-grab rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <GripVertical className="size-4" />
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {client.defaultFeePercent != null && (
          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
            {client.defaultFeePercent}%
          </span>
        )}
        {client.source && (
          <Badge variant="secondary" className="text-[10px]">
            {client.source}
          </Badge>
        )}
        {client._count.jobs > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-500">
            <Briefcase className="size-3" />
            {client._count.jobs}
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Droppable Column
// ---------------------------------------------------------------------------

function KanbanColumn({
  stage,
  clients,
  onCardClick,
}: {
  stage: (typeof CLIENT_PIPELINE_STAGES)[number];
  clients: Client[];
  onCardClick: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.value });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-lg bg-gray-100/70 ${
        isOver ? "ring-2 ring-indigo-300" : ""
      }`}
    >
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${stage.color}`}
          >
            {stage.label}
          </span>
          <span className="text-xs font-medium text-gray-500">
            {clients.length}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
        {clients.map((client) => (
          <DraggableCard
            key={client.id}
            client={client}
            onClick={() => onCardClick(client.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Overlay card shown while dragging
// ---------------------------------------------------------------------------

function OverlayCard({ client }: { client: Client }) {
  const primaryContact = client.contacts?.find((c) => c.isPrimary);
  return (
    <div className="w-72 rounded-lg border border-indigo-200 bg-white p-3 shadow-lg">
      <p className="truncate text-sm font-semibold text-gray-900">
        {client.companyName}
      </p>
      {primaryContact && (
        <p className="mt-0.5 truncate text-xs text-gray-500">
          {primaryContact.firstName} {primaryContact.lastName}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// New Client Dialog Form
// ---------------------------------------------------------------------------

function CreateClientForm({
  onSuccess,
  onClose,
}: {
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    companyName: "",
    industry: "",
    location: "",
    website: "",
    source: "",
    feeAgreement: "",
    defaultFeePercent: "",
    notes: "",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.companyName.trim()) return;

    setSaving(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        companyName: form.companyName.trim(),
      };
      if (form.industry) body.industry = form.industry;
      if (form.location) body.location = form.location;
      if (form.website) body.website = form.website;
      if (form.source) body.source = form.source;
      if (form.feeAgreement) body.feeAgreement = form.feeAgreement;
      if (form.defaultFeePercent)
        body.defaultFeePercent = parseFloat(form.defaultFeePercent);
      if (form.notes) body.notes = form.notes;

      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create client");
      }

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
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div>
        <Label>
          Company Name <span className="text-red-500">*</span>
        </Label>
        <Input
          className="mt-1.5"
          value={form.companyName}
          onChange={(e) => set("companyName", e.target.value)}
          placeholder="Acme Ltd"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Industry</Label>
          <Select
            value={form.industry}
            onValueChange={(v) => set("industry", v ?? "")}
          >
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind} value={ind}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Location</Label>
          <Input
            className="mt-1.5"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="London, UK"
          />
        </div>
      </div>

      <div>
        <Label>Website</Label>
        <Input
          className="mt-1.5"
          value={form.website}
          onChange={(e) => set("website", e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Source</Label>
          <Input
            className="mt-1.5"
            value={form.source}
            onChange={(e) => set("source", e.target.value)}
            placeholder="Referral, LinkedIn..."
          />
        </div>
        <div>
          <Label>Default Fee %</Label>
          <Input
            className="mt-1.5"
            type="number"
            step="0.5"
            min="0"
            max="100"
            value={form.defaultFeePercent}
            onChange={(e) => set("defaultFeePercent", e.target.value)}
            placeholder="15"
          />
        </div>
      </div>

      <div>
        <Label>Fee Agreement</Label>
        <Input
          className="mt-1.5"
          value={form.feeAgreement}
          onChange={(e) => set("feeAgreement", e.target.value)}
          placeholder="Standard terms, Retained..."
        />
      </div>

      <div>
        <Label>Notes</Label>
        <Textarea
          className="mt-1.5"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
          placeholder="Any additional notes..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving || !form.companyName.trim()}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          Create Client
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ClientsPage() {
  const router = useRouter();
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [hasDocsFilter, setHasDocsFilter] = useState(false);
  const [hasJobsFilter, setHasJobsFilter] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeFilterCount =
    (stageFilter ? 1 : 0) +
    (industryFilter ? 1 : 0) +
    (hasDocsFilter ? 1 : 0) +
    (hasJobsFilter ? 1 : 0) +
    (sortBy !== "newest" ? 1 : 0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // ---- Fetch clients ----
  const fetchClients = useCallback(async () => {
    try {
      const params = new URLSearchParams({ pageSize: "200" });
      if (search) params.set("search", search);
      if (stageFilter) params.set("stage", stageFilter);
      if (industryFilter) params.set("industry", industryFilter);
      if (hasDocsFilter) params.set("hasDocuments", "true");
      if (hasJobsFilter) params.set("hasJobs", "true");
      if (sortBy) params.set("sortBy", sortBy);
      const res = await fetch(`/api/clients?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: FetchResponse = await res.json();
      setClients(data.clients);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [search, stageFilter, industryFilter, hasDocsFilter, hasJobsFilter, sortBy]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      fetchClients();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchClients]);

  // ---- DnD handlers ----
  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const clientId = String(active.id);
    const newStage = String(over.id);
    const client = clients.find((c) => c.id === clientId);
    if (!client || client.pipelineStage === newStage) return;

    // Optimistic update
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId ? { ...c, pipelineStage: newStage } : c
      )
    );

    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pipelineStage: newStage }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Revert on failure
      setClients((prev) =>
        prev.map((c) =>
          c.id === clientId
            ? { ...c, pipelineStage: client.pipelineStage }
            : c
        )
      );
    }
  }

  const activeClient = activeId
    ? clients.find((c) => c.id === activeId) ?? null
    : null;

  // ---- Render ----

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Building2 className="size-5 text-indigo-600" />
          <h1 className="text-lg font-bold text-gray-900">Clients</h1>
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg border border-gray-200 bg-white">
          <button
            onClick={() => setView("kanban")}
            className={`inline-flex items-center gap-1.5 rounded-l-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "kanban"
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <LayoutGrid className="size-3.5" />
            Kanban
          </button>
          <button
            onClick={() => setView("table")}
            className={`inline-flex items-center gap-1.5 rounded-r-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "table"
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <List className="size-3.5" />
            Table
          </button>
        </div>

        {/* Search */}
        <div className="relative ml-auto w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search clients..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* New client */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="size-4" />
                New Client
              </Button>
            }
          />
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <CreateClientForm
              onSuccess={fetchClients}
              onClose={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
          <Filter className="size-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs">{activeFilterCount}</Badge>
          )}
        </div>

        <Select
          value={stageFilter}
          onValueChange={(v) => setStageFilter(v === "all" ? "" : (v ?? ""))}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {CLIENT_PIPELINE_STAGES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={industryFilter}
          onValueChange={(v) => setIndustryFilter(v === "all" ? "" : (v ?? ""))}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Industries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {INDUSTRIES.map((ind) => (
              <SelectItem key={ind} value={ind}>{ind}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
          <Checkbox
            checked={hasDocsFilter}
            onCheckedChange={(checked) => setHasDocsFilter(!!checked)}
          />
          Has Documents
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
          <Checkbox
            checked={hasJobsFilter}
            onCheckedChange={(checked) => setHasJobsFilter(!!checked)}
          />
          Has Jobs
        </label>

        <Select
          value={sortBy}
          onValueChange={(v) => setSortBy(v ?? "newest")}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="name_asc">Name A-Z</SelectItem>
            <SelectItem value="name_desc">Name Z-A</SelectItem>
          </SelectContent>
        </Select>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStageFilter("");
              setIndustryFilter("");
              setHasDocsFilter(false);
              setHasJobsFilter(false);
              setSortBy("newest");
            }}
          >
            <X className="mr-1 size-3" />
            Clear all
          </Button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-indigo-500" />
        </div>
      )}

      {/* Kanban view */}
      {!loading && view === "kanban" && (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-1 gap-3 overflow-x-auto pb-4">
            {CLIENT_PIPELINE_STAGES.map((stage) => (
              <KanbanColumn
                key={stage.value}
                stage={stage}
                clients={clients.filter(
                  (c) => c.pipelineStage === stage.value
                )}
                onCardClick={(id) => router.push(`/crm/clients/${id}`)}
              />
            ))}
          </div>
          <DragOverlay>
            {activeClient ? <OverlayCard client={activeClient} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Table view */}
      {!loading && view === "table" && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-medium text-gray-600">
                  Company Name
                </th>
                <th className="px-4 py-3 font-medium text-gray-600">
                  Contact
                </th>
                <th className="px-4 py-3 font-medium text-gray-600">Stage</th>
                <th className="px-4 py-3 font-medium text-gray-600">Fee %</th>
                <th className="px-4 py-3 font-medium text-gray-600">Source</th>
                <th className="px-4 py-3 font-medium text-gray-600">Jobs</th>
                <th className="px-4 py-3 font-medium text-gray-600">
                  Assigned To
                </th>
                <th className="px-4 py-3 font-medium text-gray-600">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    No clients found.
                  </td>
                </tr>
              )}
              {clients.map((client) => {
                const stage = stageInfo(client.pipelineStage);
                const primaryContact = client.contacts?.find(
                  (c) => c.isPrimary
                );
                return (
                  <tr
                    key={client.id}
                    onClick={() => router.push(`/crm/clients/${client.id}`)}
                    className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {client.companyName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {primaryContact
                        ? `${primaryContact.firstName} ${primaryContact.lastName}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${stage.color}`}
                      >
                        {stage.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {client.defaultFeePercent != null
                        ? `${client.defaultFeePercent}%`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {client.source || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {client._count.jobs}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {client.assignedTo
                        ? `${client.assignedTo.firstName ?? ""} ${client.assignedTo.lastName ?? ""}`.trim()
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(client.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
