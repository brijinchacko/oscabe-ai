"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Link2,
  User,
  Briefcase,
  Phone,
  Mail,
  Star,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CalendarClock,
  Loader2,
  Video,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface InterviewDetail {
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
    location: string | null;
    headline: string | null;
    skills: Array<{
      skill: { id: string; name: string };
    }>;
  };
  job: {
    id: string;
    title: string;
    companyName: string | null;
    location: string | null;
    contractType: string;
    salaryMin: number | null;
    salaryMax: number | null;
    client: { id: string; companyName: string } | null;
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
    matchScore: number | null;
  };
  activities: Array<{
    id: string;
    type: string;
    title: string;
    content: string | null;
    createdAt: string;
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
    } | null;
  }>;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TYPE_COLORS: Record<string, string> = {
  PHONE: "bg-blue-100 text-blue-800",
  VIDEO: "bg-purple-100 text-purple-800",
  IN_PERSON: "bg-green-100 text-green-800",
  TECHNICAL: "bg-orange-100 text-orange-800",
};

const TYPE_LABELS: Record<string, string> = {
  PHONE: "Phone Screen",
  VIDEO: "Video Interview",
  IN_PERSON: "In-Person",
  TECHNICAL: "Technical Assessment",
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

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function InterviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [interview, setInterview] = useState<InterviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [newScheduledAt, setNewScheduledAt] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  async function loadInterview() {
    try {
      const res = await fetch(`/api/interviews/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Interview not found");
          router.push("/crm/interviews");
          return;
        }
        throw new Error("Failed to fetch");
      }
      const data = await res.json();
      setInterview(data);
      setFeedbackText(data.feedback || "");
      setFeedbackRating(data.rating || 0);
    } catch {
      toast.error("Failed to load interview");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInterview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function updateStatus(status: string) {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/interviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Interview marked as ${status.toLowerCase().replace("_", " ")}`);
      loadInterview();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function saveFeedback() {
    setSavingFeedback(true);
    try {
      const res = await fetch(`/api/interviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback: feedbackText,
          rating: feedbackRating || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Feedback saved");
      loadInterview();
    } catch {
      toast.error("Failed to save feedback");
    } finally {
      setSavingFeedback(false);
    }
  }

  async function handleReschedule() {
    if (!newScheduledAt) {
      toast.error("Please select a new date and time");
      return;
    }
    setRescheduling(true);
    try {
      const res = await fetch(`/api/interviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt: newScheduledAt }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Interview rescheduled");
      setRescheduleOpen(false);
      setNewScheduledAt("");
      loadInterview();
    } catch {
      toast.error("Failed to reschedule");
    } finally {
      setRescheduling(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to cancel and remove this interview?")) return;
    try {
      const res = await fetch(`/api/interviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Interview removed");
      router.push("/crm/interviews");
    } catch {
      toast.error("Failed to delete interview");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="text-center py-20 text-gray-400">Interview not found</div>
    );
  }

  const TypeIcon = TYPE_ICONS[interview.type] || Phone;
  const scheduledDate = new Date(interview.scheduledAt);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/crm/interviews"
          className="rounded-md p-1.5 hover:bg-gray-100"
        >
          <ArrowLeft className="size-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Interview Details</h1>
          <p className="text-sm text-gray-500">
            {interview.candidate.firstName} {interview.candidate.lastName} &mdash; {interview.job.title}
          </p>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[interview.status] || "bg-gray-100 text-gray-800"}`}>
          {interview.status.replace("_", " ")}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interview Details Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Interview Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Calendar className="size-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-medium">
                    {scheduledDate.toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="size-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Time & Duration</p>
                  <p className="font-medium">
                    {scheduledDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} &mdash; {interview.duration} minutes
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TypeIcon className="size-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[interview.type] || "bg-gray-100 text-gray-800"}`}>
                    {TYPE_LABELS[interview.type] || interview.type}
                  </span>
                </div>
              </div>
              {interview.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="size-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="font-medium">{interview.location}</p>
                  </div>
                </div>
              )}
              {interview.meetingLink && (
                <div className="flex items-start gap-3">
                  <Link2 className="size-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Meeting Link</p>
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#4540DB] hover:underline break-all"
                    >
                      {interview.meetingLink}
                    </a>
                  </div>
                </div>
              )}
              {interview.interviewer && (
                <div className="flex items-start gap-3">
                  <User className="size-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Interviewer</p>
                    <p className="font-medium">
                      {interview.interviewer.firstName} {interview.interviewer.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{interview.interviewer.email}</p>
                  </div>
                </div>
              )}
            </div>

            {interview.notes && (
              <div className="mt-4 border-t pt-4">
                <p className="text-xs text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{interview.notes}</p>
              </div>
            )}
          </div>

          {/* Status Actions */}
          {interview.status === "SCHEDULED" && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => updateStatus("COMPLETED")}
                  disabled={updatingStatus}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle2 className="mr-2 size-4" />
                  Mark Complete
                </Button>
                <Button
                  onClick={() => updateStatus("NO_SHOW")}
                  disabled={updatingStatus}
                  variant="outline"
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                >
                  <AlertTriangle className="mr-2 size-4" />
                  Mark No Show
                </Button>
                <Button
                  onClick={() => updateStatus("CANCELLED")}
                  disabled={updatingStatus}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="mr-2 size-4" />
                  Cancel
                </Button>
                <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
                  <DialogTrigger
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium hover:bg-gray-50"
                  >
                    <CalendarClock className="size-4" />
                    Reschedule
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Reschedule Interview</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="newScheduledAt">New Date & Time</Label>
                        <Input
                          id="newScheduledAt"
                          type="datetime-local"
                          value={newScheduledAt}
                          onChange={(e) => setNewScheduledAt(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <Button
                        onClick={handleReschedule}
                        disabled={rescheduling || !newScheduledAt}
                        className="w-full bg-[#4540DB] hover:bg-[#4540DB]/90 text-white"
                      >
                        {rescheduling ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                        {rescheduling ? "Rescheduling..." : "Confirm Reschedule"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}

          {/* Feedback Section */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Feedback</h2>

            {/* Star Rating */}
            <div className="mb-4">
              <Label className="text-sm text-gray-500">Rating</Label>
              <div className="mt-1 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className="p-0.5"
                  >
                    <Star
                      className={`size-7 transition-colors ${
                        star <= feedbackRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 hover:text-yellow-300"
                      }`}
                    />
                  </button>
                ))}
                {feedbackRating > 0 && (
                  <span className="ml-3 text-sm text-gray-500">{feedbackRating} out of 5</span>
                )}
              </div>
            </div>

            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Enter interview feedback, observations, and recommendations..."
              rows={6}
            />

            <div className="mt-3 flex gap-2">
              <Button
                onClick={saveFeedback}
                disabled={savingFeedback}
                className="bg-[#4540DB] hover:bg-[#4540DB]/90 text-white"
              >
                {savingFeedback ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                {savingFeedback ? "Saving..." : "Save Feedback"}
              </Button>
            </div>
          </div>

          {/* Activity Timeline */}
          {interview.activities && interview.activities.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h2>
              <div className="space-y-4">
                {interview.activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="mt-1 size-2 shrink-0 rounded-full bg-indigo-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      {activity.content && (
                        <p className="text-xs text-gray-500 mt-0.5">{activity.content}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(activity.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {activity.user && (
                          <> &mdash; {activity.user.firstName} {activity.user.lastName}</>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Candidate Info Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Candidate</h3>
            <div className="space-y-2">
              <Link
                href={`/crm/candidates/${interview.candidate.id}`}
                className="text-base font-medium text-[#4540DB] hover:underline"
              >
                {interview.candidate.firstName} {interview.candidate.lastName}
              </Link>
              {interview.candidate.headline && (
                <p className="text-xs text-gray-500">{interview.candidate.headline}</p>
              )}
              {interview.candidate.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="size-3.5 text-gray-400" />
                  {interview.candidate.email}
                </div>
              )}
              {interview.candidate.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="size-3.5 text-gray-400" />
                  {interview.candidate.phone}
                </div>
              )}
              {interview.candidate.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="size-3.5 text-gray-400" />
                  {interview.candidate.location}
                </div>
              )}
              {interview.candidate.skills.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {interview.candidate.skills.map((s) => (
                      <span
                        key={s.skill.id}
                        className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                      >
                        {s.skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Job Info Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Job</h3>
            <div className="space-y-2">
              <Link
                href={`/crm/jobs/${interview.job.id}`}
                className="text-base font-medium text-[#4540DB] hover:underline"
              >
                {interview.job.title}
              </Link>
              {(interview.job.companyName || interview.job.client?.companyName) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="size-3.5 text-gray-400" />
                  {interview.job.client?.companyName || interview.job.companyName}
                </div>
              )}
              {interview.job.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="size-3.5 text-gray-400" />
                  {interview.job.location}
                </div>
              )}
              <div className="text-xs text-gray-500">
                {interview.job.contractType}
                {interview.job.salaryMin && interview.job.salaryMax && (
                  <> &mdash; {"\u00A3"}{interview.job.salaryMin.toLocaleString()} - {"\u00A3"}{interview.job.salaryMax.toLocaleString()}</>
                )}
              </div>
              {interview.application.matchScore && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">Match Score</p>
                  <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-indigo-500"
                      style={{ width: `${Math.min(interview.application.matchScore, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{interview.application.matchScore}%</p>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <h3 className="text-sm font-semibold text-red-800 mb-2">Danger Zone</h3>
            <p className="text-xs text-red-600 mb-3">
              Permanently remove this interview record.
            </p>
            <Button
              onClick={handleDelete}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100 text-sm"
            >
              Delete Interview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
