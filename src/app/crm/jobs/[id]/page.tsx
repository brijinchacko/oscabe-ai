"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import {
  GripVertical,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Calendar,
  PoundSterling,
  Loader2,
  AlertCircle,
  Search,
  Plus,
  Pencil,
  X,
  UserPlus,
  Mail,
  Sparkles,
} from "lucide-react";
import { AIMatchResults } from "@/components/crm/ai-match-results";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const APPLICATION_STAGES = [
  "SOURCED",
  "SCREENING",
  "SUBMITTED",
  "INTERVIEW",
  "OFFER",
  "PLACED",
  "REJECTED",
  "WITHDRAWN",
] as const;

const STAGE_COLORS: Record<string, string> = {
  SOURCED: "bg-gray-100 border-gray-300",
  SCREENING: "bg-blue-50 border-blue-300",
  SUBMITTED: "bg-indigo-50 border-indigo-300",
  INTERVIEW: "bg-purple-50 border-purple-300",
  OFFER: "bg-yellow-50 border-yellow-300",
  PLACED: "bg-green-50 border-green-300",
  REJECTED: "bg-red-50 border-red-300",
  WITHDRAWN: "bg-slate-50 border-slate-300",
};

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

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Skill {
  skill: { id: string; name: string };
}

interface Application {
  id: string;
  stage: string;
  matchScore: number | null;
  notes: string | null;
  updatedAt: string;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    location: string | null;
    headline: string | null;
    availableFrom: string | null;
    noticePeriod: string | null;
    skills: Skill[];
  };
}

interface JobDetail {
  id: string;
  title: string;
  description: string | null;
  companyName: string | null;
  location: string | null;
  remote: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  dayRateMin: number | null;
  dayRateMax: number | null;
  contractType: string | null;
  industry: string | null;
  feePercent: number | null;
  feeAmount: number | null;
  source: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  client: { id: string; companyName: string } | null;
  assignedTo: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  skills: Skill[];
  applications: Application[];
}

interface CandidateSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  headline: string | null;
  location: string | null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function daysOpen(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000);
}

function formatSource(source: string): string {
  return source.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ------------------------------------------------------------------ */
/*  Draggable Card                                                     */
/* ------------------------------------------------------------------ */

function DraggableCard({
  application,
  isDragOverlay,
}: {
  application: Application;
  isDragOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: application.id,
      data: { application },
    });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const topSkills = application.candidate.skills.slice(0, 3);

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={isDragOverlay ? undefined : style}
      {...(isDragOverlay ? {} : { ...attributes, ...listeners })}
      className={`rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md ${
        isDragging && !isDragOverlay ? "opacity-40" : ""
      } ${isDragOverlay ? "shadow-lg ring-2 ring-indigo-300" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <Link
            href={`/crm/candidates/${application.candidate.id}`}
            className="font-medium text-gray-900 hover:text-indigo-600"
            onClick={(e) => e.stopPropagation()}
          >
            {application.candidate.firstName} {application.candidate.lastName}
          </Link>
          {application.matchScore !== null && (
            <span
              className={`ml-2 text-xs font-semibold ${
                application.matchScore >= 80
                  ? "text-green-600"
                  : application.matchScore >= 60
                    ? "text-yellow-600"
                    : "text-gray-500"
              }`}
            >
              {application.matchScore}%
            </span>
          )}
        </div>
        <GripVertical className="size-4 shrink-0 text-gray-300" />
      </div>

      {topSkills.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {topSkills.map((s) => (
            <span
              key={s.skill.id}
              className="inline-flex rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600"
            >
              {s.skill.name}
            </span>
          ))}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
        <span>
          {application.candidate.noticePeriod
            ? application.candidate.noticePeriod
            : application.candidate.availableFrom
              ? `From ${new Date(application.candidate.availableFrom).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
              : "Availability N/A"}
        </span>
        <span>{relativeTime(application.updatedAt)}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Droppable Column                                                   */
/* ------------------------------------------------------------------ */

function StageColumn({
  stage,
  applications,
}: {
  stage: string;
  applications: Application[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-w-[240px] flex-col rounded-lg border ${STAGE_COLORS[stage] || "bg-gray-50 border-gray-200"} ${
        isOver ? "ring-2 ring-indigo-400" : ""
      }`}
    >
      <div className="flex items-center justify-between border-b border-gray-200/50 px-3 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600">
          {stage.replace(/_/g, " ")}
        </h3>
        <span className="inline-flex size-5 items-center justify-center rounded-full bg-white text-xs font-medium text-gray-600 shadow-sm">
          {applications.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2" style={{ maxHeight: "calc(100vh - 320px)" }}>
        {applications.length === 0 ? (
          <p className="py-4 text-center text-xs text-gray-400">
            Drop here
          </p>
        ) : (
          applications.map((app) => (
            <DraggableCard key={app.id} application={app} />
          ))
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Edit Job Dialog                                                    */
/* ------------------------------------------------------------------ */

function EditJobDialog({
  job,
  onSaved,
}: {
  job: JobDetail;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: job.title,
    description: job.description || "",
    location: job.location || "",
    salaryMin: job.salaryMin?.toString() || "",
    salaryMax: job.salaryMax?.toString() || "",
    dayRateMin: job.dayRateMin?.toString() || "",
    dayRateMax: job.dayRateMax?.toString() || "",
    contractType: job.contractType || "",
    feePercent: job.feePercent?.toString() || "",
    feeAmount: job.feeAmount?.toString() || "",
    source: job.source || "",
    status: job.status,
    notes: job.notes || "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        title: job.title,
        description: job.description || "",
        location: job.location || "",
        salaryMin: job.salaryMin?.toString() || "",
        salaryMax: job.salaryMax?.toString() || "",
        dayRateMin: job.dayRateMin?.toString() || "",
        dayRateMax: job.dayRateMax?.toString() || "",
        contractType: job.contractType || "",
        feePercent: job.feePercent?.toString() || "",
        feeAmount: job.feeAmount?.toString() || "",
        source: job.source || "",
        status: job.status,
        notes: job.notes || "",
      });
    }
  }, [open, job]);

  async function handleSave() {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        title: form.title,
        description: form.description || undefined,
        location: form.location || undefined,
        contractType: form.contractType || undefined,
        source: form.source || undefined,
        status: form.status,
        notes: form.notes || undefined,
      };
      if (form.salaryMin) body.salaryMin = parseFloat(form.salaryMin);
      if (form.salaryMax) body.salaryMax = parseFloat(form.salaryMax);
      if (form.dayRateMin) body.dayRateMin = parseFloat(form.dayRateMin);
      if (form.dayRateMax) body.dayRateMax = parseFloat(form.dayRateMax);
      if (form.feePercent) body.feePercent = parseFloat(form.feePercent);
      if (form.feeAmount) body.feeAmount = parseFloat(form.feeAmount);

      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update job");
      toast.success("Job updated successfully");
      setOpen(false);
      onSaved();
    } catch {
      toast.error("Failed to update job");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted"
      >
        <Pencil className="size-3.5" />
        Edit Job
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Contract Type</Label>
              <Select
                value={form.contractType}
                onValueChange={(v) =>
                  setForm({ ...form, contractType: v ?? "" })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERMANENT">Permanent</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                  <SelectItem value="FIXED_TERM">Fixed Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Salary Min</Label>
              <Input
                type="number"
                value={form.salaryMin}
                onChange={(e) =>
                  setForm({ ...form, salaryMin: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Salary Max</Label>
              <Input
                type="number"
                value={form.salaryMax}
                onChange={(e) =>
                  setForm({ ...form, salaryMax: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Day Rate Min</Label>
              <Input
                type="number"
                value={form.dayRateMin}
                onChange={(e) =>
                  setForm({ ...form, dayRateMin: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Day Rate Max</Label>
              <Input
                type="number"
                value={form.dayRateMax}
                onChange={(e) =>
                  setForm({ ...form, dayRateMax: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Fee %</Label>
              <Input
                type="number"
                value={form.feePercent}
                onChange={(e) =>
                  setForm({ ...form, feePercent: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Fee Amount</Label>
              <Input
                type="number"
                value={form.feeAmount}
                onChange={(e) =>
                  setForm({ ...form, feeAmount: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Source</Label>
              <Select
                value={form.source}
                onValueChange={(v) => setForm({ ...form, source: v ?? "" })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {formatSource(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v ?? "" })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.title}>
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Add Candidate Dialog                                               */
/* ------------------------------------------------------------------ */

function AddCandidateDialog({
  jobId,
  existingCandidateIds,
  onAdded,
}: {
  jobId: string;
  existingCandidateIds: string[];
  onAdded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState<CandidateSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setCandidates([]);
      return;
    }
  }, [open]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setCandidates([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/candidates?search=${encodeURIComponent(searchQuery)}&pageSize=10`
        );
        if (res.ok) {
          const data = await res.json();
          setCandidates(data.candidates ?? []);
        }
      } catch {
        // silently fail
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function handleAdd(candidateId: string) {
    setAdding(candidateId);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, jobId, stage: "SOURCED" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add candidate");
      }
      toast.success("Candidate added to pipeline");
      setOpen(false);
      onAdded();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add candidate"
      );
    } finally {
      setAdding(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
      >
        <UserPlus className="size-3.5" />
        Add Candidate
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Candidate to Job</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search candidates by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {searching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-gray-400" />
              </div>
            ) : candidates.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                {searchQuery.length < 2
                  ? "Type at least 2 characters to search"
                  : "No candidates found"}
              </p>
            ) : (
              <div className="space-y-1">
                {candidates.map((c) => {
                  const alreadyAdded = existingCandidateIds.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {c.firstName} {c.lastName}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {c.email}
                          {c.headline ? ` - ${c.headline}` : ""}
                        </p>
                      </div>
                      {alreadyAdded ? (
                        <Badge variant="secondary">Already added</Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleAdd(c.id)}
                          disabled={adding === c.id}
                        >
                          {adding === c.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Plus className="size-3.5" />
                          )}
                          Add
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchJob = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs/${id}`);
      if (!res.ok) throw new Error("Failed to fetch job");
      const data = await res.json();
      setJob(data);
    } catch {
      setError("Failed to load job details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || !job) return;

    const applicationId = active.id as string;
    const newStage = over.id as string;

    // Find the application
    const app = job.applications.find((a) => a.id === applicationId);
    if (!app || app.stage === newStage) return;

    // Optimistic update
    setJob({
      ...job,
      applications: job.applications.map((a) =>
        a.id === applicationId ? { ...a, stage: newStage, updatedAt: new Date().toISOString() } : a
      ),
    });

    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      if (!res.ok) throw new Error("Failed to update stage");
      toast.success(
        `Moved ${app.candidate.firstName} to ${newStage.replace(/_/g, " ")}`
      );
    } catch {
      // Revert on error
      toast.error("Failed to update application stage");
      fetchJob();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="size-10 text-red-400" />
        <p className="mt-3 text-sm text-gray-600">{error || "Job not found"}</p>
        <Link href="/crm/jobs" className="mt-4">
          <Button variant="outline">Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  const days = daysOpen(job.createdAt);
  const existingCandidateIds = job.applications.map((a) => a.candidate.id);

  // Group applications by stage
  const appsByStage: Record<string, Application[]> = {};
  for (const stage of APPLICATION_STAGES) {
    appsByStage[stage] = [];
  }
  for (const app of job.applications) {
    if (appsByStage[app.stage]) {
      appsByStage[app.stage].push(app);
    } else {
      appsByStage[app.stage] = [app];
    }
  }

  const activeApp = activeId
    ? job.applications.find((a) => a.id === activeId)
    : null;

  return (
    <div className="flex h-full flex-col">
      {/* Top header */}
      <div className="flex items-start justify-between pb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/crm/jobs" className="hover:text-indigo-600">
              Jobs
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="truncate">{job.title}</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            {job.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {job.client && (
              <Link
                href={`/crm/clients/${job.client.id}`}
                className="text-sm font-medium text-indigo-600 hover:underline"
              >
                {job.client.companyName}
              </Link>
            )}
            {!job.client && job.companyName && (
              <span className="text-sm text-gray-600">{job.companyName}</span>
            )}
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_COLORS[job.status] || "bg-gray-100 text-gray-600"}`}
            >
              {job.status.replace(/_/g, " ")}
            </span>
            {job.source && (
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${SOURCE_BADGE_COLORS[job.source] || SOURCE_BADGE_COLORS.OTHER}`}
              >
                {formatSource(job.source)}
              </span>
            )}
            {job.feeAmount && (
              <span className="flex items-center gap-1 text-sm text-gray-600">
                <PoundSterling className="size-3.5" />
                {job.feeAmount.toLocaleString()}
              </span>
            )}
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar className="size-3.5" />
              {days}d open
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AddCandidateDialog
            jobId={job.id}
            existingCandidateIds={existingCandidateIds}
            onAdded={fetchJob}
          />
          <EditJobDialog job={job} onSaved={fetchJob} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Main content + sidebar */}
      <div className="mt-4 flex flex-1 gap-4 overflow-hidden">
        {/* Kanban board */}
        <div className="flex-1 overflow-x-auto">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-3">
              {APPLICATION_STAGES.map((stage) => (
                <StageColumn
                  key={stage}
                  stage={stage}
                  applications={appsByStage[stage] || []}
                />
              ))}
            </div>
            <DragOverlay>
              {activeApp ? (
                <DraggableCard application={activeApp} isDragOverlay />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Right sidebar */}
        {sidebarOpen && (
          <div className="w-[350px] shrink-0 overflow-y-auto rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">
                Job Details
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Salary / Rate */}
              {(job.salaryMin || job.salaryMax) && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Salary Range
                  </p>
                  <p className="mt-1 text-sm text-gray-800">
                    {job.salaryMin
                      ? `\u00A3${job.salaryMin.toLocaleString()}`
                      : "?"}{" "}
                    -{" "}
                    {job.salaryMax
                      ? `\u00A3${job.salaryMax.toLocaleString()}`
                      : "?"}
                  </p>
                </div>
              )}

              {(job.dayRateMin || job.dayRateMax) && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Day Rate
                  </p>
                  <p className="mt-1 text-sm text-gray-800">
                    {job.dayRateMin
                      ? `\u00A3${job.dayRateMin}`
                      : "?"}{" "}
                    -{" "}
                    {job.dayRateMax ? `\u00A3${job.dayRateMax}` : "?"} /day
                  </p>
                </div>
              )}

              {/* Location */}
              {job.location && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Location
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-800">
                    <MapPin className="size-3.5 text-gray-400" />
                    {job.location}
                    {job.remote && (
                      <span className="ml-1 rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
                        Remote
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Contract Type */}
              {job.contractType && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Contract Type
                  </p>
                  <p className="mt-1 text-sm text-gray-800">
                    {job.contractType.replace(/_/g, " ")}
                  </p>
                </div>
              )}

              {/* Industry */}
              {job.industry && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Industry
                  </p>
                  <p className="mt-1 text-sm text-gray-800">{job.industry}</p>
                </div>
              )}

              {/* Required Skills */}
              {job.skills.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Required Skills
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {job.skills.map((s) => (
                      <Badge key={s.skill.id} variant="outline">
                        {s.skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Description */}
              {job.description && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Description
                  </p>
                  <div className="mt-2 max-h-[200px] overflow-y-auto rounded-lg bg-gray-50 p-3">
                    <p className="whitespace-pre-wrap text-sm text-gray-700">
                      {job.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {job.notes && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Notes
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                    {job.notes}
                  </p>
                </div>
              )}

              {/* AI Match */}
              <Separator />
              <AIMatchResults
                jobId={job.id}
                onAddCandidate={async (candidateId) => {
                  try {
                    const res = await fetch("/api/applications", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        candidateId,
                        jobId: job.id,
                        stage: "SOURCED",
                      }),
                    });
                    if (res.ok) {
                      fetchJob();
                    }
                  } catch {
                    // ignore
                  }
                }}
              />

              {/* Email All Candidates */}
              {job.applications.length > 0 && (
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const emails = job.applications
                        .map((a: { candidate: { email: string } }) => a.candidate.email)
                        .filter(Boolean)
                        .join(",");
                      window.open(
                        `/crm/emails/new?to=${encodeURIComponent(emails)}&subject=${encodeURIComponent(`Regarding: ${job.title}`)}`,
                        "_self"
                      );
                    }}
                  >
                    <Mail className="mr-1 size-3.5" />
                    Email All Candidates ({job.applications.length})
                  </Button>
                </div>
              )}

              {/* Assigned to */}
              {job.assignedTo && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Assigned To
                  </p>
                  <p className="mt-1 text-sm text-gray-800">
                    {job.assignedTo.firstName} {job.assignedTo.lastName}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
