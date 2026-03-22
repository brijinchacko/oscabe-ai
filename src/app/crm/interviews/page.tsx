"use client";

import { useEffect, useState, useCallback, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CalendarCheck,
  Clock,
  MessageSquare,
  CheckCircle2,
  Plus,
  Loader2,
  List,
  CalendarDays,
  Phone,
  Video,
  MapPin,
  Monitor,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
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

interface Interview {
  id: string;
  applicationId: string;
  candidateId: string;
  jobId: string;
  interviewerId: string | null;
  scheduledAt: string;
  duration: number;
  type: string;
  location: string | null;
  meetingLink: string | null;
  notes: string | null;
  feedback: string | null;
  rating: number | null;
  status: string;
  completedAt: string | null;
  createdAt: string;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  job: {
    id: string;
    title: string;
    companyName: string | null;
    location: string | null;
  };
  interviewer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
  application: {
    id: string;
    stage: string;
  };
}

interface CandidateOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface JobOption {
  id: string;
  title: string;
  companyName: string | null;
}

interface UserOption {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

interface ApplicationOption {
  id: string;
  candidateId: string;
  jobId: string;
  stage: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TYPE_OPTIONS = ["PHONE", "VIDEO", "IN_PERSON", "TECHNICAL"] as const;
const STATUS_OPTIONS = ["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;
const DURATION_OPTIONS = [30, 45, 60, 90] as const;

const TYPE_COLORS: Record<string, string> = {
  PHONE: "bg-blue-100 text-blue-800 border-blue-200",
  VIDEO: "bg-purple-100 text-purple-800 border-purple-200",
  IN_PERSON: "bg-green-100 text-green-800 border-green-200",
  TECHNICAL: "bg-orange-100 text-orange-800 border-orange-200",
};

const TYPE_BG_COLORS: Record<string, string> = {
  PHONE: "bg-blue-50 border-blue-300 hover:bg-blue-100",
  VIDEO: "bg-purple-50 border-purple-300 hover:bg-purple-100",
  IN_PERSON: "bg-green-50 border-green-300 hover:bg-green-100",
  TECHNICAL: "bg-orange-50 border-orange-300 hover:bg-orange-100",
};

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-yellow-100 text-yellow-800",
};

const TYPE_ICONS: Record<string, typeof Phone> = {
  PHONE: Phone,
  VIDEO: Video,
  IN_PERSON: MapPin,
  TECHNICAL: Monitor,
};

const TYPE_LABELS: Record<string, string> = {
  PHONE: "Phone",
  VIDEO: "Video",
  IN_PERSON: "In-Person",
  TECHNICAL: "Technical",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getWeekDates(baseDate: Date): Date[] {
  const d = new Date(baseDate);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 5 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} ${formatTime(d)}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8am to 6pm

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState<"calendar" | "list">("list");

  // Filters
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dateRange, setDateRange] = useState<"this_week" | "next_week" | "custom">("this_week");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  // Calendar navigation
  const [calendarWeek, setCalendarWeek] = useState(new Date());

  // Schedule form state
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateResults, setCandidateResults] = useState<CandidateOption[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateOption | null>(null);
  const [jobSearch, setJobSearch] = useState("");
  const [jobResults, setJobResults] = useState<JobOption[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobOption | null>(null);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [applications, setApplications] = useState<ApplicationOption[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState("");

  // Detail panel
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [savingFeedback, setSavingFeedback] = useState(false);

  // Compute date filters
  const getDateRange = useCallback((): { from: string; to: string } => {
    const now = new Date();
    if (dateRange === "this_week") {
      const weekDates = getWeekDates(now);
      const from = weekDates[0].toISOString();
      const endOfFriday = new Date(weekDates[4]);
      endOfFriday.setHours(23, 59, 59, 999);
      return { from, to: endOfFriday.toISOString() };
    } else if (dateRange === "next_week") {
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const weekDates = getWeekDates(nextWeek);
      const from = weekDates[0].toISOString();
      const endOfFriday = new Date(weekDates[4]);
      endOfFriday.setHours(23, 59, 59, 999);
      return { from, to: endOfFriday.toISOString() };
    } else {
      return { from: customFrom ? new Date(customFrom).toISOString() : "", to: customTo ? new Date(customTo + "T23:59:59").toISOString() : "" };
    }
  }, [dateRange, customFrom, customTo]);

  const loadInterviews = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      const { from, to } = getDateRange();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (filterType) params.set("type", filterType);
      if (filterStatus) params.set("status", filterStatus);
      params.set("pageSize", "100");

      const res = await fetch(`/api/interviews?${params}`);
      if (res.ok) {
        const data = await res.json();
        setInterviews(data.interviews ?? []);
      }
    } catch {
      toast.error("Failed to load interviews");
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus, getDateRange]);

  useEffect(() => {
    setLoading(true);
    loadInterviews();
  }, [loadInterviews]);

  // Load users for interviewer select
  useEffect(() => {
    fetch("/api/settings/users")
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Search candidates
  useEffect(() => {
    if (candidateSearch.length < 2) {
      setCandidateResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/candidates?search=${encodeURIComponent(candidateSearch)}&pageSize=10`);
        if (res.ok) {
          const data = await res.json();
          setCandidateResults(data.candidates ?? []);
        }
      } catch {
        /* ignore */
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [candidateSearch]);

  // Search jobs
  useEffect(() => {
    if (jobSearch.length < 2) {
      setJobResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/jobs?search=${encodeURIComponent(jobSearch)}&pageSize=10`);
        if (res.ok) {
          const data = await res.json();
          setJobResults(data.jobs ?? []);
        }
      } catch {
        /* ignore */
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [jobSearch]);

  // Load applications when candidate and job are both selected
  useEffect(() => {
    if (!selectedCandidate || !selectedJob) {
      setApplications([]);
      setSelectedApplicationId("");
      return;
    }
    fetch(`/api/candidates/${selectedCandidate.id}`)
      .then((r) => r.json())
      .then((data) => {
        const apps = (data.applications ?? []).filter(
          (a: ApplicationOption) => a.jobId === selectedJob?.id
        );
        setApplications(apps);
        if (apps.length === 1) {
          setSelectedApplicationId(apps[0].id);
        }
      })
      .catch(() => {});
  }, [selectedCandidate, selectedJob]);

  // Stats
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const weekDatesNow = getWeekDates(now);
  const weekEnd = new Date(weekDatesNow[4]);
  weekEnd.setHours(23, 59, 59, 999);

  const todaysInterviews = interviews.filter((i) => {
    const d = new Date(i.scheduledAt);
    return d >= todayStart && d < todayEnd && i.status === "SCHEDULED";
  }).length;

  const thisWeekInterviews = interviews.filter((i) => {
    const d = new Date(i.scheduledAt);
    return d >= weekDatesNow[0] && d <= weekEnd && i.status === "SCHEDULED";
  }).length;

  const pendingFeedback = interviews.filter(
    (i) => i.status === "COMPLETED" && !i.feedback
  ).length;

  const totalCompleted = interviews.filter((i) => i.status === "COMPLETED").length;

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedCandidate || !selectedJob || !selectedApplicationId) {
      toast.error("Please select a candidate, job, and application");
      return;
    }

    setSubmitting(true);
    const fd = new FormData(e.currentTarget);

    const payload = {
      applicationId: selectedApplicationId,
      candidateId: selectedCandidate.id,
      jobId: selectedJob.id,
      interviewerId: (fd.get("interviewerId") as string) || undefined,
      scheduledAt: fd.get("scheduledAt") as string,
      duration: Number(fd.get("duration")) || 60,
      type: (fd.get("type") as string) || "PHONE",
      location: (fd.get("location") as string) || undefined,
      meetingLink: (fd.get("meetingLink") as string) || undefined,
      notes: (fd.get("notes") as string) || undefined,
    };

    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      toast.success("Interview scheduled");
      setDialogOpen(false);
      resetForm();
      setLoading(true);
      loadInterviews();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to schedule interview");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setSelectedCandidate(null);
    setSelectedJob(null);
    setCandidateSearch("");
    setJobSearch("");
    setApplications([]);
    setSelectedApplicationId("");
  }

  async function handleSaveFeedback() {
    if (!selectedInterview) return;
    setSavingFeedback(true);
    try {
      const res = await fetch(`/api/interviews/${selectedInterview.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback: feedbackText,
          rating: feedbackRating || undefined,
          status: "COMPLETED",
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Feedback saved");
      setDetailPanelOpen(false);
      setLoading(true);
      loadInterviews();
    } catch {
      toast.error("Failed to save feedback");
    } finally {
      setSavingFeedback(false);
    }
  }

  function openDetailPanel(interview: Interview) {
    setSelectedInterview(interview);
    setFeedbackText(interview.feedback || "");
    setFeedbackRating(interview.rating || 0);
    setDetailPanelOpen(true);
  }

  // Calendar data
  const calendarDates = getWeekDates(calendarWeek);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger
            render={<Button className="bg-[#4540DB] hover:bg-[#4540DB]/90 text-white" />}
          >
            <Plus className="mr-2 size-4" />
            Schedule Interview
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              {/* Candidate Search */}
              <div>
                <Label>Candidate *</Label>
                {selectedCandidate ? (
                  <div className="mt-1 flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm">
                    <span className="flex-1">
                      {selectedCandidate.firstName} {selectedCandidate.lastName} ({selectedCandidate.email})
                    </span>
                    <button type="button" onClick={() => { setSelectedCandidate(null); setCandidateSearch(""); }}>
                      <X className="size-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>
                ) : (
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={candidateSearch}
                      onChange={(e) => setCandidateSearch(e.target.value)}
                      placeholder="Search candidates..."
                      className="pl-9"
                    />
                    {candidateResults.length > 0 && (
                      <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
                        {candidateResults.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                            onClick={() => {
                              setSelectedCandidate(c);
                              setCandidateSearch("");
                              setCandidateResults([]);
                            }}
                          >
                            <div className="font-medium">{c.firstName} {c.lastName}</div>
                            <div className="text-xs text-gray-500">{c.email}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Job Search */}
              <div>
                <Label>Job *</Label>
                {selectedJob ? (
                  <div className="mt-1 flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm">
                    <span className="flex-1">
                      {selectedJob.title} {selectedJob.companyName ? `(${selectedJob.companyName})` : ""}
                    </span>
                    <button type="button" onClick={() => { setSelectedJob(null); setJobSearch(""); }}>
                      <X className="size-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>
                ) : (
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={jobSearch}
                      onChange={(e) => setJobSearch(e.target.value)}
                      placeholder="Search jobs..."
                      className="pl-9"
                    />
                    {jobResults.length > 0 && (
                      <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
                        {jobResults.map((j) => (
                          <button
                            key={j.id}
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                            onClick={() => {
                              setSelectedJob(j);
                              setJobSearch("");
                              setJobResults([]);
                            }}
                          >
                            <div className="font-medium">{j.title}</div>
                            {j.companyName && <div className="text-xs text-gray-500">{j.companyName}</div>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Application select */}
              {selectedCandidate && selectedJob && (
                <div>
                  <Label>Application *</Label>
                  {applications.length > 0 ? (
                    <select
                      name="applicationId"
                      value={selectedApplicationId}
                      onChange={(e) => setSelectedApplicationId(e.target.value)}
                      required
                      className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                    >
                      <option value="">Select application</option>
                      {applications.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.stage} - {a.id.slice(0, 8)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="mt-1 text-sm text-amber-600">
                      No application found for this candidate-job pair. Please create an application first.
                    </p>
                  )}
                </div>
              )}

              {/* Date & Time */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="scheduledAt">Date & Time *</Label>
                  <Input
                    id="scheduledAt"
                    name="scheduledAt"
                    type="datetime-local"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Duration</Label>
                  <select name="duration" defaultValue="60" className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm">
                    {DURATION_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d} min</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Type */}
              <div>
                <Label>Type</Label>
                <select name="type" defaultValue="PHONE" className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm">
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              {/* Location / Meeting Link */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" className="mt-1" placeholder="Office, room, etc." />
                </div>
                <div>
                  <Label htmlFor="meetingLink">Meeting Link</Label>
                  <Input id="meetingLink" name="meetingLink" className="mt-1" placeholder="https://..." />
                </div>
              </div>

              {/* Interviewer */}
              <div>
                <Label>Interviewer</Label>
                <select name="interviewerId" defaultValue="" className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm">
                  <option value="">Select interviewer (optional)</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" className="mt-1" rows={3} placeholder="Preparation notes, topics to cover..." />
              </div>

              <Button
                type="submit"
                disabled={submitting || !selectedCandidate || !selectedJob || !selectedApplicationId}
                className="w-full bg-[#4540DB] hover:bg-[#4540DB]/90 text-white"
              >
                {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                {submitting ? "Scheduling..." : "Schedule Interview"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Today&apos;s Interviews</p>
            <CalendarCheck className="size-5 text-gray-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{todaysInterviews}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">This Week</p>
            <Clock className="size-5 text-gray-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{thisWeekInterviews}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Pending Feedback</p>
            <MessageSquare className="size-5 text-gray-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{pendingFeedback}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Total Completed</p>
            <CheckCircle2 className="size-5 text-gray-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{totalCompleted}</p>
        </div>
      </div>

      {/* Filters + View Toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={dateRange} onValueChange={(v) => setDateRange(v as "this_week" | "next_week" | "custom")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="next_week">Next Week</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>

        {dateRange === "custom" && (
          <>
            <Input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="w-40"
              placeholder="From"
            />
            <Input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="w-40"
              placeholder="To"
            />
          </>
        )}

        <Select value={filterType} onValueChange={(v) => setFilterType(v ?? "")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            {TYPE_OPTIONS.map((t) => (
              <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? "")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-0.5">
          <button
            onClick={() => setView("list")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "list" ? "bg-[#4540DB] text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <List className="inline size-4 mr-1" />
            List
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "calendar" ? "bg-[#4540DB] text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <CalendarDays className="inline size-4 mr-1" />
            Calendar
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {view === "calendar" && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          {/* Calendar header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <button
              onClick={() => {
                const prev = new Date(calendarWeek);
                prev.setDate(prev.getDate() - 7);
                setCalendarWeek(prev);
              }}
              className="rounded-md p-1 hover:bg-gray-100"
            >
              <ChevronLeft className="size-5 text-gray-600" />
            </button>
            <h3 className="text-sm font-semibold text-gray-900">
              {calendarDates[0].toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
            </h3>
            <button
              onClick={() => {
                const next = new Date(calendarWeek);
                next.setDate(next.getDate() + 7);
                setCalendarWeek(next);
              }}
              className="rounded-md p-1 hover:bg-gray-100"
            >
              <ChevronRight className="size-5 text-gray-600" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Day headers */}
              <div className="grid grid-cols-[60px_repeat(5,1fr)] border-b bg-gray-50">
                <div className="px-2 py-2" />
                {calendarDates.map((date) => {
                  const isToday = isSameDay(date, now);
                  return (
                    <div
                      key={date.toISOString()}
                      className={`border-l px-2 py-2 text-center text-xs font-medium ${
                        isToday ? "bg-blue-50 text-blue-700" : "text-gray-600"
                      }`}
                    >
                      <div>{date.toLocaleDateString("en-GB", { weekday: "short" })}</div>
                      <div className="text-lg font-bold">{date.getDate()}</div>
                    </div>
                  );
                })}
              </div>

              {/* Time grid */}
              {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-[60px_repeat(5,1fr)] border-b">
                  <div className="px-2 py-3 text-right text-xs text-gray-400">
                    {hour.toString().padStart(2, "0")}:00
                  </div>
                  {calendarDates.map((date) => {
                    const dayInterviews = interviews.filter((i) => {
                      const d = new Date(i.scheduledAt);
                      return isSameDay(d, date) && d.getHours() === hour;
                    });
                    return (
                      <div key={date.toISOString()} className="relative min-h-[60px] border-l p-1">
                        {dayInterviews.map((interview) => {
                          const TypeIcon = TYPE_ICONS[interview.type] || Phone;
                          return (
                            <button
                              key={interview.id}
                              onClick={() => openDetailPanel(interview)}
                              className={`mb-1 w-full rounded-md border p-1.5 text-left text-xs transition-colors ${
                                TYPE_BG_COLORS[interview.type] || "bg-gray-50 border-gray-300 hover:bg-gray-100"
                              }`}
                            >
                              <div className="flex items-center gap-1 font-medium">
                                <TypeIcon className="size-3 shrink-0" />
                                <span className="truncate">
                                  {formatTime(new Date(interview.scheduledAt))}
                                </span>
                              </div>
                              <div className="mt-0.5 truncate text-gray-700">
                                {interview.candidate.firstName} {interview.candidate.lastName}
                              </div>
                              <div className="truncate text-gray-500">
                                {interview.job.title}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-500">Date/Time</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Candidate</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Job</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Type</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Interviewer</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : interviews.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                      No interviews found for the selected period
                    </td>
                  </tr>
                ) : (
                  interviews.map((interview) => {
                    const TypeIcon = TYPE_ICONS[interview.type] || Phone;
                    return (
                      <tr key={interview.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            {formatDate(interview.scheduledAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatTime(new Date(interview.scheduledAt))} - {interview.duration}min
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/crm/candidates/${interview.candidate.id}`}
                            className="font-medium text-[#4540DB] hover:underline"
                          >
                            {interview.candidate.firstName} {interview.candidate.lastName}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/crm/jobs/${interview.job.id}`}
                            className="text-[#4540DB] hover:underline"
                          >
                            {interview.job.title}
                          </Link>
                          {interview.job.companyName && (
                            <div className="text-xs text-gray-500">{interview.job.companyName}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[interview.type] || "bg-gray-100 text-gray-800"}`}>
                            <TypeIcon className="size-3" />
                            {TYPE_LABELS[interview.type] || interview.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {interview.interviewer
                            ? `${interview.interviewer.firstName || ""} ${interview.interviewer.lastName || ""}`.trim() || interview.interviewer.email
                            : "-"
                          }
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[interview.status] || "bg-gray-100 text-gray-800"}`}>
                            {interview.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/crm/interviews/${interview.id}`}
                              className="rounded-md px-2 py-1 text-xs font-medium text-[#4540DB] hover:bg-indigo-50"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => openDetailPanel(interview)}
                              className="rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                            >
                              Feedback
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail / Feedback Panel */}
      {detailPanelOpen && selectedInterview && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDetailPanelOpen(false)} />
          <div className="relative w-full max-w-md bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Interview Details</h3>
              <button onClick={() => setDetailPanelOpen(false)} className="rounded-md p-1 hover:bg-gray-100">
                <X className="size-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Interview info */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Candidate</p>
                  <p className="font-medium text-gray-900">
                    {selectedInterview.candidate.firstName} {selectedInterview.candidate.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Job</p>
                  <p className="font-medium text-gray-900">{selectedInterview.job.title}</p>
                  {selectedInterview.job.companyName && (
                    <p className="text-xs text-gray-500">{selectedInterview.job.companyName}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Date & Time</p>
                    <p className="text-sm font-medium">{formatDateTime(selectedInterview.scheduledAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="text-sm font-medium">{selectedInterview.duration} min</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Type</p>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[selectedInterview.type] || "bg-gray-100 text-gray-800"}`}>
                      {TYPE_LABELS[selectedInterview.type] || selectedInterview.type}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[selectedInterview.status] || "bg-gray-100 text-gray-800"}`}>
                      {selectedInterview.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
                {selectedInterview.location && (
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm">{selectedInterview.location}</p>
                  </div>
                )}
                {selectedInterview.meetingLink && (
                  <div>
                    <p className="text-xs text-gray-500">Meeting Link</p>
                    <a href={selectedInterview.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-[#4540DB] hover:underline break-all">
                      {selectedInterview.meetingLink}
                    </a>
                  </div>
                )}
                {selectedInterview.interviewer && (
                  <div>
                    <p className="text-xs text-gray-500">Interviewer</p>
                    <p className="text-sm">
                      {selectedInterview.interviewer.firstName} {selectedInterview.interviewer.lastName}
                    </p>
                  </div>
                )}
              </div>

              {/* Feedback Form */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Feedback</h4>

                {/* Star Rating */}
                <div className="mb-3">
                  <Label className="text-xs text-gray-500">Rating</Label>
                  <div className="mt-1 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className="p-0.5"
                      >
                        <Star
                          className={`size-6 ${
                            star <= feedbackRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                    {feedbackRating > 0 && (
                      <span className="ml-2 text-sm text-gray-500">{feedbackRating}/5</span>
                    )}
                  </div>
                </div>

                <Textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Enter interview feedback..."
                  rows={5}
                />

                <Button
                  onClick={handleSaveFeedback}
                  disabled={savingFeedback}
                  className="mt-3 w-full bg-[#4540DB] hover:bg-[#4540DB]/90 text-white"
                >
                  {savingFeedback ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  {savingFeedback ? "Saving..." : "Save Feedback & Mark Complete"}
                </Button>
              </div>

              {/* Link to full detail page */}
              <div className="border-t pt-4">
                <Link
                  href={`/crm/interviews/${selectedInterview.id}`}
                  className="text-sm text-[#4540DB] hover:underline"
                >
                  View full interview details
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
