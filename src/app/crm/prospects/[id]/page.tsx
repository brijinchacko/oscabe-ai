"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Building2,
  Briefcase,
  Globe,
  Loader2,
  Send,
  UserPlus,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  MessageSquare,
  Edit2,
  Save,
  X,
  ExternalLink,
  Cpu,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OutreachReply {
  id: string;
  subject: string | null;
  body: string;
  receivedAt: string;
  sentiment: string | null;
  aiClassification: string | null;
  isRead: boolean;
}

interface OutreachEmail {
  id: string;
  subject: string | null;
  body: string | null;
  sequenceStep: number;
  status: string;
  sentAt: string | null;
  openedAt: string | null;
  repliedAt: string | null;
  bouncedAt: string | null;
  createdAt: string;
  campaign: { id: string; name: string } | null;
  replies: OutreachReply[];
}

interface ProspectDetail {
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
  apolloId: string | null;
  emailVerified: boolean;
  verifiedAt: string | null;
  source: string;
  status: string;
  segment: string | null;
  convertedClientId: string | null;
  convertedClient: { id: string; companyName: string } | null;
  notes: string | null;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
  outreachEmails: OutreachEmail[];
  outreachReplies: OutreachReply[];
}

// ---------------------------------------------------------------------------
// Constants & helpers
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
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

function sentimentColor(sentiment: string | null) {
  switch (sentiment?.toLowerCase()) {
    case "positive": return "bg-green-100 text-green-800";
    case "negative": return "bg-red-100 text-red-800";
    case "neutral": return "bg-gray-100 text-gray-800";
    case "interested": return "bg-blue-100 text-blue-800";
    case "not_interested": return "bg-orange-100 text-orange-800";
    default: return "bg-gray-100 text-gray-600";
  }
}

function emailStatusColor(status: string) {
  switch (status) {
    case "SENT": return "bg-blue-100 text-blue-800";
    case "OPENED": return "bg-green-100 text-green-800";
    case "REPLIED": return "bg-emerald-100 text-emerald-800";
    case "BOUNCED": return "bg-red-100 text-red-800";
    case "QUEUED": return "bg-gray-100 text-gray-800";
    default: return "bg-gray-100 text-gray-600";
  }
}

// ---------------------------------------------------------------------------
// Convert to Client Dialog
// ---------------------------------------------------------------------------

function ConvertDialog({
  prospect,
  onSuccess,
  onClose,
}: {
  prospect: ProspectDetail;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    companyName: prospect.company || `${prospect.firstName} ${prospect.lastName}`,
    industry: prospect.industry || "",
    website: "",
    location: prospect.location || "",
    notes: "",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/prospects/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId: prospect.id,
          companyName: form.companyName,
          industry: form.industry || undefined,
          website: form.website || undefined,
          location: form.location || undefined,
          notes: form.notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to convert");
      toast.success("Prospect converted to client");
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
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div>
        <Label>Company Name <span className="text-red-500">*</span></Label>
        <Input className="mt-1.5" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Industry</Label>
          <Input className="mt-1.5" value={form.industry} onChange={(e) => set("industry", e.target.value)} />
        </div>
        <div>
          <Label>Location</Label>
          <Input className="mt-1.5" value={form.location} onChange={(e) => set("location", e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Website</Label>
        <Input className="mt-1.5" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://..." />
      </div>
      <div>
        <Label>Notes</Label>
        <Textarea className="mt-1.5" value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={saving || !form.companyName.trim()}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          Convert to Client
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ProspectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const prospectId = params.id as string;

  const [prospect, setProspect] = useState<ProspectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [convertOpen, setConvertOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchProspect = useCallback(async () => {
    try {
      const res = await fetch(`/api/prospects/${prospectId}`);
      if (!res.ok) throw new Error("Not found");
      const data: ProspectDetail = await res.json();
      setProspect(data);
      setNotesDraft(data.notes || "");
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [prospectId]);

  useEffect(() => {
    fetchProspect();
  }, [fetchProspect]);

  async function updateStatus(newStatus: string) {
    if (!prospect || prospect.status === newStatus) return;
    setProspect((prev) => prev ? { ...prev, status: newStatus } : prev);
    try {
      const res = await fetch(`/api/prospects/${prospectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success("Status updated");
      fetchProspect();
    } catch {
      fetchProspect();
      toast.error("Failed to update status");
    }
  }

  async function saveNotes() {
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/prospects/${prospectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesDraft }),
      });
      if (!res.ok) throw new Error();
      toast.success("Notes saved");
      setEditingNotes(false);
      fetchProspect();
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  }

  async function verifyEmail() {
    try {
      const res = await fetch(`/api/prospects/${prospectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailVerified: true }),
      });
      if (!res.ok) throw new Error();
      toast.success("Email marked as verified");
      fetchProspect();
    } catch {
      toast.error("Failed to verify email");
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!prospect) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Users className="size-12 text-gray-300" />
        <p className="mt-4 text-gray-500">Prospect not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/crm/prospects")}>
          <ArrowLeft className="size-4" />
          Back to Prospects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <button
          onClick={() => router.push("/crm/prospects")}
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="size-4" />
          Back to Prospects
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {prospect.firstName} {prospect.lastName}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              {prospect.company && (
                <span className="inline-flex items-center gap-1">
                  <Building2 className="size-3.5" />
                  {prospect.company}
                </span>
              )}
              {prospect.jobTitle && (
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="size-3.5" />
                  {prospect.jobTitle}
                </span>
              )}
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(prospect.status)}`}>
                {statusLabel(prospect.status)}
              </span>
              {prospect.emailVerified && (
                <span className="inline-flex items-center gap-1 text-xs text-green-600">
                  <ShieldCheck className="size-3.5" />
                  Verified
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {prospect.status !== "CONVERTED" && (
              <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
                <DialogTrigger
                  render={
                    <Button>
                      <ArrowUpRight className="size-4" />
                      Convert to Client
                    </Button>
                  }
                />
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Convert Prospect to Client</DialogTitle>
                  </DialogHeader>
                  <ConvertDialog
                    prospect={prospect}
                    onSuccess={fetchProspect}
                    onClose={() => setConvertOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            )}

            {prospect.convertedClient && (
              <Button
                variant="outline"
                onClick={() => router.push(`/crm/clients/${prospect.convertedClient!.id}`)}
              >
                <ExternalLink className="size-4" />
                View Client
              </Button>
            )}

            <Select value={prospect.status} onValueChange={(v) => updateStatus(v ?? "")}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    <span className={`mr-2 inline-block size-2 rounded-full ${s.color.split(" ")[0]}`} />
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="outreach">Outreach History ({prospect.outreachEmails.length})</TabsTrigger>
          <TabsTrigger value="replies">Replies ({prospect.outreachReplies.length})</TabsTrigger>
        </TabsList>

        {/* ================ OVERVIEW TAB ================ */}
        <TabsContent value="overview">
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {/* Left: Profile Info (2/3) */}
            <div className="space-y-4 lg:col-span-2">
              {/* Profile Card */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-gray-900">Profile Information</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500">Email</p>
                    <a href={`mailto:${prospect.email}`} className="mt-0.5 inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline">
                      <Mail className="size-3.5" />
                      {prospect.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Location</p>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-sm text-gray-900">
                      {prospect.location ? <><MapPin className="size-3.5" />{prospect.location}</> : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">LinkedIn</p>
                    {prospect.linkedIn ? (
                      <a href={prospect.linkedIn} target="_blank" rel="noopener noreferrer" className="mt-0.5 inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline">
                        <Linkedin className="size-3.5" />
                        Profile <ExternalLink className="size-3" />
                      </a>
                    ) : (
                      <p className="mt-0.5 text-sm text-gray-900">-</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Industry</p>
                    <p className="mt-0.5 text-sm text-gray-900">{prospect.industry || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Company Size</p>
                    <p className="mt-0.5 text-sm text-gray-900">{prospect.companySize || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Segment</p>
                    <p className="mt-0.5 text-sm text-gray-900">{prospect.segment || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Source</p>
                    <Badge variant="secondary">{prospect.source}</Badge>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Email Verified</p>
                    <p className="mt-0.5 text-sm text-gray-900">
                      {prospect.emailVerified ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <ShieldCheck className="size-3.5" />
                          Yes {prospect.verifiedAt && `(${formatDate(prospect.verifiedAt)})`}
                        </span>
                      ) : "No"}
                    </p>
                  </div>
                  {prospect.technologies && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-medium text-gray-500">Technologies</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {prospect.technologies.split(",").map((tech) => (
                          <span key={tech.trim()} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                            <Cpu className="size-3" />
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
                  {!editingNotes ? (
                    <Button variant="ghost" size="sm" onClick={() => setEditingNotes(true)}>
                      <Edit2 className="size-3.5" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingNotes(false); setNotesDraft(prospect.notes || ""); }}>
                        <X className="size-3.5" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={saveNotes} disabled={savingNotes}>
                        {savingNotes ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                        Save
                      </Button>
                    </div>
                  )}
                </div>
                {editingNotes ? (
                  <Textarea
                    className="mt-2"
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    rows={4}
                    placeholder="Add notes about this prospect..."
                  />
                ) : (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                    {prospect.notes || "No notes yet."}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Quick Actions + Timeline (1/3) */}
            <div className="space-y-4">
              {/* Quick Actions */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Quick Actions</h3>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      window.open(
                        `/crm/emails/new?to=${encodeURIComponent(prospect.email)}&name=${encodeURIComponent(prospect.firstName + " " + prospect.lastName)}`,
                        "_self"
                      );
                    }}
                  >
                    <Send className="size-3.5" />
                    Send Email
                  </Button>

                  <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                    <UserPlus className="size-3.5" />
                    Add to Campaign
                  </Button>

                  {!prospect.emailVerified && (
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={verifyEmail}>
                      <ShieldCheck className="size-3.5" />
                      Verify Email
                    </Button>
                  )}

                  {prospect.status !== "CONVERTED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setConvertOpen(true)}
                    >
                      <ArrowUpRight className="size-3.5" />
                      Convert to Client
                    </Button>
                  )}
                </div>
              </div>

              {/* Outreach Timeline Summary */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Recent Activity</h3>
                {prospect.outreachEmails.length === 0 && prospect.outreachReplies.length === 0 ? (
                  <div className="text-center">
                    <Clock className="mx-auto size-8 text-gray-300" />
                    <p className="mt-2 text-xs text-gray-400">No outreach activity yet</p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {prospect.outreachEmails.slice(0, 5).map((email, idx) => (
                      <div key={email.id} className="flex gap-2">
                        <div className="flex flex-col items-center">
                          <div className="flex size-6 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white">
                            <Mail className="size-3 text-blue-500" />
                          </div>
                          {idx < Math.min(prospect.outreachEmails.length, 5) - 1 && (
                            <div className="w-px flex-1 bg-gray-200" />
                          )}
                        </div>
                        <div className="pb-3">
                          <p className="text-xs font-medium text-gray-900">
                            {email.subject || `Step ${email.sequenceStep} email`}
                          </p>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium ${emailStatusColor(email.status)}`}>
                              {email.status}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {email.sentAt ? relativeTime(email.sentAt) : relativeTime(email.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="mb-2 text-sm font-semibold text-gray-900">Details</h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created</span>
                    <span className="text-gray-700">{formatDate(prospect.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Updated</span>
                    <span className="text-gray-700">{formatDate(prospect.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Contacted</span>
                    <span className="text-gray-700">{formatDate(prospect.lastContactedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Emails Sent</span>
                    <span className="text-gray-700">{prospect.outreachEmails.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Replies</span>
                    <span className="text-gray-700">{prospect.outreachReplies.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ================ OUTREACH HISTORY TAB ================ */}
        <TabsContent value="outreach">
          <div className="mt-4">
            {prospect.outreachEmails.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
                <Mail className="mx-auto size-8 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">No outreach emails sent yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 font-medium text-gray-600">Subject</th>
                      <th className="px-4 py-3 font-medium text-gray-600">Campaign</th>
                      <th className="px-4 py-3 font-medium text-gray-600">Step</th>
                      <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                      <th className="px-4 py-3 font-medium text-gray-600">Sent At</th>
                      <th className="px-4 py-3 font-medium text-gray-600">Opened</th>
                      <th className="px-4 py-3 font-medium text-gray-600">Replied</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prospect.outreachEmails.map((email) => (
                      <tr key={email.id} className="border-b border-gray-100">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {email.subject || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {email.campaign?.name || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          Step {email.sequenceStep}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${emailStatusColor(email.status)}`}>
                            {email.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {formatDate(email.sentAt)}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {email.openedAt ? formatDate(email.openedAt) : "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {email.repliedAt ? formatDate(email.repliedAt) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ================ REPLIES TAB ================ */}
        <TabsContent value="replies">
          <div className="mt-4">
            {prospect.outreachReplies.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
                <MessageSquare className="mx-auto size-8 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">No replies received yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {prospect.outreachReplies.map((reply) => (
                  <div key={reply.id} className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {reply.subject && (
                            <p className="truncate text-sm font-medium text-gray-900">
                              {reply.subject}
                            </p>
                          )}
                          {reply.sentiment && (
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${sentimentColor(reply.sentiment)}`}>
                              {reply.sentiment}
                            </span>
                          )}
                          {reply.aiClassification && (
                            <Badge variant="secondary" className="text-[10px]">
                              {reply.aiClassification}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1.5 whitespace-pre-wrap text-sm text-gray-600 line-clamp-4">
                          {reply.body}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-gray-400">{relativeTime(reply.receivedAt)}</p>
                        {!reply.isRead && (
                          <span className="mt-1 inline-block size-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
