"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Calendar,
  Clock,
  FileText,
  Download,
  Plus,
  Edit,
  CheckCircle,
  MessageSquare,
  UserPlus,
  Briefcase,
  Sparkles,
  Send,
  Activity as ActivityIcon,
  Star,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { AICVParser } from "@/components/crm/ai-cv-parser";

// ── Types ──────────────────────────────────────────────────────────────

interface CandidateDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  location: string | null;
  headline: string | null;
  summary: string | null;
  cvUrl: string | null;
  cvFileName: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  dayRateMin: number | null;
  dayRateMax: number | null;
  noticePeriod: string | null;
  availableFrom: string | null;
  rightToWork: boolean;
  status: string;
  source: string | null;
  linkedIn: string | null;
  isVerified: boolean;
  notes: string | null;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
  skills: CandidateSkill[];
  applications: ApplicationItem[];
  activities: ActivityItem[];
}

interface CandidateSkill {
  id: string;
  skillId: string;
  skill: { id: string; name: string; category: string };
  proficiency: number | null;
  yearsExp: number | null;
  isVerified: boolean;
}

interface ApplicationItem {
  id: string;
  stage: string;
  matchScore: number | null;
  createdAt: string;
  job: {
    id: string;
    title: string;
    client: { name: string } | null;
  };
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  content: string | null;
  createdAt: string;
  user?: { firstName: string; lastName: string } | null;
}

// ── Status badge config ────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  PASSIVE: "bg-blue-100 text-blue-800",
  PLACED: "bg-purple-100 text-purple-800",
  UNAVAILABLE: "bg-gray-100 text-gray-800",
  INACTIVE: "bg-red-100 text-red-800",
};

const STATUSES = ["ACTIVE", "PASSIVE", "PLACED", "UNAVAILABLE", "INACTIVE"];

const STAGE_COLORS: Record<string, string> = {
  SOURCED: "bg-gray-100 text-gray-800",
  SCREENING: "bg-yellow-100 text-yellow-800",
  SUBMITTED: "bg-blue-100 text-blue-800",
  INTERVIEW: "bg-indigo-100 text-indigo-800",
  OFFER: "bg-purple-100 text-purple-800",
  PLACED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  WITHDRAWN: "bg-orange-100 text-orange-800",
};

const ACTIVITY_ICONS: Record<string, typeof Mail> = {
  CANDIDATE_ADDED: UserPlus,
  NOTE_ADDED: MessageSquare,
  STATUS_CHANGED: ActivityIcon,
  EMAIL_SENT: Send,
  INTERVIEW_SCHEDULED: Calendar,
  APPLICATION_CREATED: Briefcase,
  CV_UPLOADED: FileText,
};

function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {status}
    </span>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const colorClass = STAGE_COLORS[stage] ?? "bg-gray-100 text-gray-800";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {stage}
    </span>
  );
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return "Not specified";
  const fmt = (n: number) => `£${n.toLocaleString()}`;
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

function ProficiencyBar({ value }: { value: number | null }) {
  const level = value ?? 0;
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-16 rounded-full bg-gray-200">
        <div
          className="h-1.5 rounded-full bg-indigo-500"
          style={{ width: `${Math.min(level, 100)}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground">{level}%</span>
    </div>
  );
}

// ── Edit Profile Dialog ────────────────────────────────────────────────

interface EditProfileFormProps {
  candidate: CandidateDetail;
  onSaved: () => void;
  onClose: () => void;
}

function EditProfileForm({ candidate, onSaved, onClose }: EditProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    email: candidate.email,
    phone: candidate.phone ?? "",
    location: candidate.location ?? "",
    headline: candidate.headline ?? "",
    summary: candidate.summary ?? "",
    linkedIn: candidate.linkedIn ?? "",
    noticePeriod: candidate.noticePeriod ?? "",
    salaryMin: candidate.salaryMin?.toString() ?? "",
    salaryMax: candidate.salaryMax?.toString() ?? "",
    dayRateMin: candidate.dayRateMin?.toString() ?? "",
    dayRateMax: candidate.dayRateMax?.toString() ?? "",
    rightToWork: candidate.rightToWork,
    availableFrom: candidate.availableFrom
      ? new Date(candidate.availableFrom).toISOString().split("T")[0]
      : "",
    source: candidate.source ?? "",
    notes: candidate.notes ?? "",
  });

  function updateField(field: string, value: string | boolean) {
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
      if (form.summary) payload.summary = form.summary;
      if (form.linkedIn) payload.linkedIn = form.linkedIn;
      if (form.noticePeriod) payload.noticePeriod = form.noticePeriod;
      if (form.salaryMin) payload.salaryMin = parseInt(form.salaryMin, 10);
      if (form.salaryMax) payload.salaryMax = parseInt(form.salaryMax, 10);
      if (form.dayRateMin) payload.dayRateMin = parseInt(form.dayRateMin, 10);
      if (form.dayRateMax) payload.dayRateMax = parseInt(form.dayRateMax, 10);
      payload.rightToWork = form.rightToWork;
      if (form.availableFrom) payload.availableFrom = form.availableFrom;
      if (form.source) payload.source = form.source;
      if (form.notes) payload.notes = form.notes;

      const res = await fetch(`/api/candidates/${candidate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update candidate");
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 max-h-[70vh] overflow-y-auto pr-1">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="ed-firstName">First Name *</Label>
          <Input
            id="ed-firstName"
            required
            value={form.firstName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("firstName", e.target.value)
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ed-lastName">Last Name *</Label>
          <Input
            id="ed-lastName"
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
          <Label htmlFor="ed-email">Email *</Label>
          <Input
            id="ed-email"
            type="email"
            required
            value={form.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("email", e.target.value)
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ed-phone">Phone</Label>
          <Input
            id="ed-phone"
            value={form.phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("phone", e.target.value)
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="ed-location">Location</Label>
          <Input
            id="ed-location"
            value={form.location}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("location", e.target.value)
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ed-linkedIn">LinkedIn URL</Label>
          <Input
            id="ed-linkedIn"
            value={form.linkedIn}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("linkedIn", e.target.value)
            }
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ed-headline">Headline</Label>
        <Input
          id="ed-headline"
          value={form.headline}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateField("headline", e.target.value)
          }
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ed-summary">Summary</Label>
        <Textarea
          id="ed-summary"
          value={form.summary}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            updateField("summary", e.target.value)
          }
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="ed-salaryMin">Salary Min (£)</Label>
          <Input
            id="ed-salaryMin"
            type="number"
            value={form.salaryMin}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("salaryMin", e.target.value)
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ed-salaryMax">Salary Max (£)</Label>
          <Input
            id="ed-salaryMax"
            type="number"
            value={form.salaryMax}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("salaryMax", e.target.value)
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ed-noticePeriod">Notice Period</Label>
          <Input
            id="ed-noticePeriod"
            value={form.noticePeriod}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("noticePeriod", e.target.value)
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="ed-dayRateMin">Day Rate Min (£)</Label>
          <Input
            id="ed-dayRateMin"
            type="number"
            value={form.dayRateMin}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("dayRateMin", e.target.value)
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ed-dayRateMax">Day Rate Max (£)</Label>
          <Input
            id="ed-dayRateMax"
            type="number"
            value={form.dayRateMax}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("dayRateMax", e.target.value)
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ed-availableFrom">Available From</Label>
          <Input
            id="ed-availableFrom"
            type="date"
            value={form.availableFrom}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("availableFrom", e.target.value)
            }
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ed-notes">Notes</Label>
        <Textarea
          id="ed-notes"
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
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ── Add Skill Dialog ───────────────────────────────────────────────────

interface AddSkillFormProps {
  candidateId: string;
  onAdded: () => void;
  onClose: () => void;
}

function AddSkillForm({ candidateId, onAdded, onClose }: AddSkillFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [skills, setSkills] = useState<Array<{ id: string; name: string }>>([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [proficiency, setProficiency] = useState(50);

  useEffect(() => {
    async function fetchSkills() {
      try {
        const res = await fetch(`/api/skills?search=${encodeURIComponent(skillSearch)}`);
        if (res.ok) {
          const data = await res.json();
          setSkills(data.skills ?? data ?? []);
        }
      } catch {
        // Skills API may not exist yet
      }
    }
    const timer = setTimeout(fetchSkills, 300);
    return () => clearTimeout(timer);
  }, [skillSearch]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSkillId) {
      setError("Please select a skill");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/candidates/${candidateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addSkill: { skillId: selectedSkillId, proficiency },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add skill");
      }

      onAdded();
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

      <div className="space-y-1.5">
        <Label>Search Skills</Label>
        <Input
          placeholder="Type to search skills..."
          value={skillSearch}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSkillSearch(e.target.value)
          }
        />
        {skills.length > 0 && (
          <div className="max-h-32 overflow-y-auto rounded-md border">
            {skills.map((skill) => (
              <button
                key={skill.id}
                type="button"
                onClick={() => setSelectedSkillId(skill.id)}
                className={`w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 ${
                  selectedSkillId === skill.id
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : ""
                }`}
              >
                {skill.name}
              </button>
            ))}
          </div>
        )}
        {selectedSkillId && (
          <p className="text-xs text-muted-foreground">
            Selected: {skills.find((s) => s.id === selectedSkillId)?.name ?? selectedSkillId}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>
          Proficiency: {proficiency}%
        </Label>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={proficiency}
          onChange={(e) => setProficiency(parseInt(e.target.value, 10))}
          className="w-full accent-indigo-600"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Beginner</span>
          <span>Intermediate</span>
          <span>Expert</span>
        </div>
      </div>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>
          Cancel
        </DialogClose>
        <Button type="submit" disabled={loading || !selectedSkillId}>
          {loading ? "Adding..." : "Add Skill"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;

  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchCandidate = useCallback(async () => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}`);
      if (!res.ok) throw new Error("Failed to fetch candidate");
      const data = await res.json();
      setCandidate(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load candidate");
    } finally {
      setIsLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    fetchCandidate();
  }, [fetchCandidate]);

  async function handleStatusChange(newStatus: string) {
    if (!candidate || !newStatus) return;
    setStatusLoading(true);
    try {
      const res = await fetch(`/api/candidates/${candidateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      await fetchCandidate();
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleAddNote() {
    if (!noteText.trim()) return;
    setNoteLoading(true);
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "NOTE_ADDED",
          title: "Note added",
          content: noteText,
          candidateId,
        }),
      });
      if (!res.ok) throw new Error("Failed to add note");
      setNoteText("");
      await fetchCandidate();
    } catch (err) {
      console.error("Add note error:", err);
    } finally {
      setNoteLoading(false);
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !candidate) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
        <p className="text-sm text-red-600">{error || "Candidate not found"}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => router.push("/crm/candidates")}
        >
          <ArrowLeft className="size-3.5" />
          Back to Candidates
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/crm/candidates"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to Candidates
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {candidate.firstName} {candidate.lastName}
            </h1>
            {candidate.isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                <CheckCircle className="size-3" />
                Verified
              </span>
            )}
          </div>
          {candidate.headline && (
            <p className="mt-1 text-sm text-muted-foreground">
              {candidate.headline}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {candidate.location && (
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5" />
                {candidate.location}
              </span>
            )}
            <StatusBadge status={candidate.status} />
            {candidate.availableFrom && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                <Calendar className="size-3" />
                Available{" "}
                {new Date(candidate.availableFrom).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Profile section */}
          <div className="rounded-lg border bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Profile</h2>
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger
                  render={
                    <Button variant="outline" size="sm">
                      <Edit className="size-3.5" />
                      Edit
                    </Button>
                  }
                />
                <DialogContent className="sm:max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <EditProfileForm
                    candidate={candidate}
                    onSaved={fetchCandidate}
                    onClose={() => setEditDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {candidate.summary && (
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {candidate.summary}
              </p>
            )}

            <Separator className="my-4" />

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="size-4 text-muted-foreground" />
                <a
                  href={`mailto:${candidate.email}`}
                  className="text-indigo-600 hover:underline"
                >
                  {candidate.email}
                </a>
              </div>
              {candidate.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="size-4 text-muted-foreground" />
                  <span>{candidate.phone}</span>
                </div>
              )}
              {candidate.linkedIn && (
                <div className="flex items-center gap-2 text-sm">
                  <Linkedin className="size-4 text-muted-foreground" />
                  <a
                    href={candidate.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline truncate"
                  >
                    LinkedIn Profile
                  </a>
                </div>
              )}
              {candidate.noticePeriod && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="size-4 text-muted-foreground" />
                  <span>Notice: {candidate.noticePeriod}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Salary:</span>
                <span>{formatSalary(candidate.salaryMin, candidate.salaryMax)}</span>
              </div>
              {(candidate.dayRateMin || candidate.dayRateMax) && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Day Rate:</span>
                  <span>
                    {formatSalary(candidate.dayRateMin, candidate.dayRateMax)}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Shield className="size-4 text-muted-foreground" />
                <span>
                  Right to Work:{" "}
                  {candidate.rightToWork ? (
                    <span className="text-green-700 font-medium">Yes</span>
                  ) : (
                    <span className="text-red-600">No</span>
                  )}
                </span>
              </div>
              {candidate.availableFrom && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span>
                    Available from:{" "}
                    {new Date(candidate.availableFrom).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Skills section */}
          <div className="rounded-lg border bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Skills</h2>
              <Dialog open={skillDialogOpen} onOpenChange={setSkillDialogOpen}>
                <DialogTrigger
                  render={
                    <Button variant="outline" size="sm">
                      <Plus className="size-3.5" />
                      Add Skill
                    </Button>
                  }
                />
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Skill</DialogTitle>
                  </DialogHeader>
                  <AddSkillForm
                    candidateId={candidateId}
                    onAdded={fetchCandidate}
                    onClose={() => setSkillDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {candidate.skills.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No skills added yet.
              </p>
            ) : (
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {candidate.skills.map((cs) => (
                  <div
                    key={cs.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div>
                      <span className="text-sm font-medium">
                        {cs.skill.name}
                      </span>
                      {cs.isVerified && (
                        <CheckCircle className="ml-1 inline size-3 text-green-600" />
                      )}
                    </div>
                    <ProficiencyBar value={cs.proficiency} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Applications section */}
          <div className="rounded-lg border bg-white p-5">
            <h2 className="text-lg font-semibold">Applications</h2>

            {candidate.applications.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No applications yet.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <th className="pb-2 pr-4">Job Title</th>
                      <th className="pb-2 pr-4">Client</th>
                      <th className="pb-2 pr-4">Stage</th>
                      <th className="pb-2 pr-4">Match</th>
                      <th className="pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidate.applications.map((app) => (
                      <tr
                        key={app.id}
                        className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/crm/jobs/${app.job.id}`)}
                      >
                        <td className="py-2.5 pr-4">
                          <span className="font-medium text-indigo-600 hover:underline">
                            {app.job.title}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 text-muted-foreground">
                          {app.job.client?.name ?? "-"}
                        </td>
                        <td className="py-2.5 pr-4">
                          <StageBadge stage={app.stage} />
                        </td>
                        <td className="py-2.5 pr-4">
                          {app.matchScore != null ? (
                            <div className="flex items-center gap-1">
                              <Star className="size-3 text-amber-500" />
                              <span>{app.matchScore}%</span>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-2.5 text-muted-foreground">
                          {new Date(app.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="rounded-lg border bg-white p-5">
            <h2 className="text-lg font-semibold">Activity Timeline</h2>

            {/* Add note */}
            <div className="mt-3 flex gap-2">
              <Textarea
                placeholder="Add a note..."
                value={noteText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNoteText(e.target.value)
                }
                rows={2}
                className="flex-1"
              />
              <Button
                size="sm"
                disabled={noteLoading || !noteText.trim()}
                onClick={handleAddNote}
                className="self-end"
              >
                {noteLoading ? "Adding..." : "Add Note"}
              </Button>
            </div>

            {candidate.activities.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No activity recorded yet.
              </p>
            ) : (
              <div className="mt-4 space-y-0">
                {candidate.activities.map((activity, idx) => {
                  const Icon =
                    ACTIVITY_ICONS[activity.type] ?? ActivityIcon;
                  return (
                    <div key={activity.id} className="relative flex gap-3 pb-4">
                      {/* Timeline line */}
                      {idx < candidate.activities.length - 1 && (
                        <div className="absolute left-[15px] top-8 bottom-0 w-px bg-gray-200" />
                      )}
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                        <Icon className="size-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {formatRelativeTime(activity.createdAt)}
                          </span>
                        </div>
                        {activity.content && (
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {activity.content}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* CV card */}
          <div className="rounded-lg border bg-white p-4">
            <h3 className="text-sm font-semibold">CV / Resume</h3>
            {candidate.cvFileName ? (
              <div className="mt-3 flex items-center gap-3">
                <FileText className="size-8 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {candidate.cvFileName}
                  </p>
                </div>
                {candidate.cvUrl && (
                  <a href={candidate.cvUrl} download>
                    <Button variant="outline" size="sm">
                      <Download className="size-3.5" />
                      Download
                    </Button>
                  </a>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                No CV uploaded
              </p>
            )}
          </div>

          {/* Quick actions */}
          <div className="rounded-lg border bg-white p-4">
            <h3 className="text-sm font-semibold">Quick Actions</h3>
            <div className="mt-3 flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setNoteText("");
                  document
                    .querySelector<HTMLTextAreaElement>("textarea")
                    ?.focus();
                }}
              >
                <MessageSquare className="size-3.5" />
                Add Note
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  if (candidate?.email) {
                    window.open(
                      `/crm/emails/new?to=${encodeURIComponent(candidate.email)}&name=${encodeURIComponent(candidate.firstName + " " + candidate.lastName)}`,
                      "_self"
                    );
                  }
                }}
              >
                <Send className="size-3.5" />
                Send Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => router.push("/crm/jobs")}
              >
                <Briefcase className="size-3.5" />
                Add to Job
              </Button>
            </div>
          </div>

          {/* Status control */}
          <div className="rounded-lg border bg-white p-4">
            <h3 className="text-sm font-semibold">Status</h3>
            <div className="mt-3">
              <Select
                value={candidate.status}
                onValueChange={(v) => handleStatusChange(v ?? "")}
                disabled={statusLoading}
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
          </div>

          {/* AI Actions */}
          <div className="rounded-lg border bg-white p-4">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <Sparkles className="size-4 text-indigo-500" />
              AI Actions
            </h3>
            <div className="mt-3 flex flex-col gap-2">
              <AICVParser
                candidateId={candidate.id}
                onComplete={() => {
                  toast.success("CV parsed and profile updated");
                  fetchCandidate();
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
