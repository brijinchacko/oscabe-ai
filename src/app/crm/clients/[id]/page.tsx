"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { FollowUpManager } from "@/components/crm/follow-up-manager";
import {
  ArrowLeft,
  Building2,
  Globe,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Briefcase,
  DollarSign,
  Users,
  Trophy,
  Plus,
  Loader2,
  MessageSquare,
  GitBranch,
  Clock,
  FileText,
  Star,
  ExternalLink,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { CLIENT_PIPELINE_STAGES } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  linkedIn: string | null;
  isPrimary: boolean;
  createdAt: string;
}

interface Job {
  id: string;
  title: string;
  status: string;
  salary: string | null;
  feePercent: number | null;
  createdAt: string;
  _count: {
    applications: number;
  };
}

interface Placement {
  id: string;
  fee: number | null;
  startDate: string | null;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Activity {
  id: string;
  type: string;
  title: string;
  content: string | null;
  createdAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
}

interface ClientDetail {
  id: string;
  companyName: string;
  industry: string | null;
  companySize: string | null;
  website: string | null;
  location: string | null;
  address: string | null;
  feeAgreement: string | null;
  paymentTerms: string | null;
  defaultFeePercent: number | null;
  source: string | null;
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
  contacts: Contact[];
  jobs: Job[];
  placements: Placement[];
  activities: Activity[];
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

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysOpen(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

function activityIcon(type: string) {
  switch (type) {
    case "CLIENT_CREATED":
      return <Building2 className="size-4 text-indigo-500" />;
    case "STAGE_CHANGED":
      return <GitBranch className="size-4 text-purple-500" />;
    case "NOTE":
      return <MessageSquare className="size-4 text-blue-500" />;
    case "EMAIL":
      return <Mail className="size-4 text-green-500" />;
    case "CALL":
      return <Phone className="size-4 text-orange-500" />;
    default:
      return <FileText className="size-4 text-gray-400" />;
  }
}

const JOB_STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-200 text-gray-600",
  ON_HOLD: "bg-yellow-100 text-yellow-800",
  FILLED: "bg-blue-100 text-blue-800",
  CANCELLED: "bg-red-100 text-red-800",
};

// ---------------------------------------------------------------------------
// Add Contact Form
// ---------------------------------------------------------------------------

function AddContactForm({
  clientId,
  onSuccess,
  onClose,
}: {
  clientId: string;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobTitle: "",
    linkedIn: "",
    isPrimary: false,
  });

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) return;

    setSaving(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        clientId,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      };
      if (form.email) body.email = form.email;
      if (form.phone) body.phone = form.phone;
      if (form.jobTitle) body.jobTitle = form.jobTitle;
      if (form.linkedIn) body.linkedIn = form.linkedIn;
      if (form.isPrimary) body.isPrimary = true;

      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add contact");
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input
            className="mt-1.5"
            value={form.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            required
          />
        </div>
        <div>
          <Label>
            Last Name <span className="text-red-500">*</span>
          </Label>
          <Input
            className="mt-1.5"
            value={form.lastName}
            onChange={(e) => set("lastName", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Email</Label>
          <Input
            className="mt-1.5"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            className="mt-1.5"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Job Title</Label>
          <Input
            className="mt-1.5"
            value={form.jobTitle}
            onChange={(e) => set("jobTitle", e.target.value)}
          />
        </div>
        <div>
          <Label>LinkedIn</Label>
          <Input
            className="mt-1.5"
            value={form.linkedIn}
            onChange={(e) => set("linkedIn", e.target.value)}
            placeholder="https://linkedin.com/in/..."
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isPrimary}
          onChange={(e) => set("isPrimary", e.target.checked)}
          className="size-4 rounded border-gray-300"
        />
        Primary contact
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            saving || !form.firstName.trim() || !form.lastName.trim()
          }
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          Add Contact
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const fetchClient = useCallback(async () => {
    try {
      const res = await fetch(`/api/clients/${clientId}`);
      if (!res.ok) throw new Error("Not found");
      const data: ClientDetail = await res.json();
      setClient(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  async function updateStage(newStage: string) {
    if (!client || client.pipelineStage === newStage) return;
    // Optimistic
    setClient((prev) =>
      prev ? { ...prev, pipelineStage: newStage } : prev
    );
    try {
      await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pipelineStage: newStage }),
      });
      fetchClient();
    } catch {
      // revert
      fetchClient();
    }
  }

  async function addNote() {
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "NOTE",
          title: "Note added",
          content: noteText.trim(),
          clientId,
        }),
      });
      if (res.ok) {
        setNoteText("");
        fetchClient();
      }
    } catch {
      // silent
    } finally {
      setAddingNote(false);
    }
  }

  // ---- Loading ----
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Building2 className="size-12 text-gray-300" />
        <p className="mt-4 text-gray-500">Client not found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/crm/clients")}
        >
          <ArrowLeft className="size-4" />
          Back to Clients
        </Button>
      </div>
    );
  }

  const stage = stageInfo(client.pipelineStage);
  const primaryContact = client.contacts.find((c) => c.isPrimary);
  const totalRevenue = client.placements.reduce(
    (sum, p) => sum + (p.fee ?? 0),
    0
  );
  const activeJobs = client.jobs.filter(
    (j) => j.status === "OPEN" || j.status === "ACTIVE"
  ).length;

  return (
    <div className="space-y-6">
      {/* Back link + header */}
      <div>
        <button
          onClick={() => router.push("/crm/clients")}
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="size-4" />
          Back to Clients
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {client.companyName}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              {client.industry && (
                <Badge variant="secondary">{client.industry}</Badge>
              )}
              {client.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {client.location}
                </span>
              )}
              {client.website && (
                <a
                  href={
                    client.website.startsWith("http")
                      ? client.website
                      : `https://${client.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                >
                  <Globe className="size-3.5" />
                  Website
                  <ExternalLink className="size-3" />
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
          {/* Send Email button */}
          {primaryContact?.email && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.open(
                  `/crm/emails/new?to=${encodeURIComponent(primaryContact.email!)}&name=${encodeURIComponent(primaryContact.firstName + " " + primaryContact.lastName)}`,
                  "_self"
                );
              }}
            >
              <Send className="mr-1 size-3.5" />
              Send Email
            </Button>
          )}

          {/* Pipeline stage dropdown */}
          <Select
            value={client.pipelineStage}
            onValueChange={(v) => updateStage(v ?? "")}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CLIENT_PIPELINE_STAGES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  <span
                    className={`mr-2 inline-block size-2 rounded-full ${s.color.split(" ")[0]}`}
                  />
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">
            Contacts ({client.contacts.length})
          </TabsTrigger>
          <TabsTrigger value="jobs">Jobs ({client.jobs.length})</TabsTrigger>
          <TabsTrigger value="followups">Follow-ups</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* ================ OVERVIEW TAB ================ */}
        <TabsContent value="overview">
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {/* Stat cards */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <DollarSign className="size-4" />
                Total Revenue
              </div>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {totalRevenue > 0
                  ? `£${totalRevenue.toLocaleString()}`
                  : "£0"}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Briefcase className="size-4" />
                Active Jobs
              </div>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {activeJobs}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Trophy className="size-4" />
                Total Placements
              </div>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {client.placements.length}
              </p>
            </div>

            {/* Company details */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 lg:col-span-2">
              <h3 className="text-sm font-semibold text-gray-900">
                Company Details
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-gray-500">Industry</p>
                  <p className="mt-0.5 text-sm text-gray-900">
                    {client.industry || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Location</p>
                  <p className="mt-0.5 text-sm text-gray-900">
                    {client.location || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Website</p>
                  <p className="mt-0.5 text-sm text-gray-900">
                    {client.website || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Source</p>
                  <p className="mt-0.5 text-sm text-gray-900">
                    {client.source || "-"}
                  </p>
                </div>
                {client.notes && (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium text-gray-500">Notes</p>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm text-gray-700">
                      {client.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Fee agreement */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Fee Agreement
              </h3>
              <div className="mt-3 space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Fee Percentage
                  </p>
                  <p className="mt-0.5 text-lg font-bold text-indigo-600">
                    {client.defaultFeePercent != null
                      ? `${client.defaultFeePercent}%`
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Agreement Type
                  </p>
                  <p className="mt-0.5 text-sm text-gray-900">
                    {client.feeAgreement || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Payment Terms
                  </p>
                  <p className="mt-0.5 text-sm text-gray-900">
                    {client.paymentTerms || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Primary contact */}
            {primaryContact && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 lg:col-span-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Primary Contact
                </h3>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex size-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                    {primaryContact.firstName[0]}
                    {primaryContact.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {primaryContact.firstName} {primaryContact.lastName}
                    </p>
                    {primaryContact.jobTitle && (
                      <p className="text-gray-500">
                        {primaryContact.jobTitle}
                      </p>
                    )}
                  </div>
                  {primaryContact.email && (
                    <a
                      href={`mailto:${primaryContact.email}`}
                      className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                    >
                      <Mail className="size-3.5" />
                      {primaryContact.email}
                    </a>
                  )}
                  {primaryContact.phone && (
                    <span className="inline-flex items-center gap-1 text-gray-600">
                      <Phone className="size-3.5" />
                      {primaryContact.phone}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ================ CONTACTS TAB ================ */}
        <TabsContent value="contacts">
          <div className="mt-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Contacts ({client.contacts.length})
              </h3>
              <Dialog
                open={contactDialogOpen}
                onOpenChange={setContactDialogOpen}
              >
                <DialogTrigger
                  render={
                    <Button variant="outline" size="sm">
                      <Plus className="size-3.5" />
                      Add Contact
                    </Button>
                  }
                />
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add Contact</DialogTitle>
                  </DialogHeader>
                  <AddContactForm
                    clientId={clientId}
                    onSuccess={fetchClient}
                    onClose={() => setContactDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {client.contacts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
                <Users className="mx-auto size-8 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">
                  No contacts yet. Add your first contact.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 font-medium text-gray-600">
                        Name
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-600">
                        Email
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-600">
                        Phone
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-600">
                        Job Title
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-600">
                        LinkedIn
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-600">
                        Primary
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {client.contacts.map((contact) => (
                      <tr
                        key={contact.id}
                        className="border-b border-gray-100"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {contact.email ? (
                            <a
                              href={`mailto:${contact.email}`}
                              className="text-indigo-600 hover:underline"
                            >
                              {contact.email}
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {contact.phone || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {contact.jobTitle || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {contact.linkedIn ? (
                            <a
                              href={contact.linkedIn}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                            >
                              <Linkedin className="size-3.5" />
                              Profile
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {contact.isPrimary && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                              <Star className="size-3" />
                              Primary
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ================ JOBS TAB ================ */}
        <TabsContent value="jobs">
          <div className="mt-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Jobs ({client.jobs.length})
            </h3>

            {client.jobs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
                <Briefcase className="mx-auto size-8 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">
                  No jobs linked to this client yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 font-medium text-gray-600">
                        Title
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-600">
                        Status
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-600">
                        Fee %
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-600">
                        Candidates
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-600">
                        Days Open
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {client.jobs.map((job) => {
                      const statusColor =
                        JOB_STATUS_COLORS[job.status] ??
                        "bg-gray-200 text-gray-600";
                      return (
                        <tr
                          key={job.id}
                          onClick={() => router.push(`/crm/jobs/${job.id}`)}
                          className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {job.title}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}
                            >
                              {job.status.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {job.feePercent != null
                              ? `${job.feePercent}%`
                              : "-"}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {job._count.applications}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {daysOpen(job.createdAt)}d
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ================ FOLLOW-UPS TAB ================ */}
        <TabsContent value="followups">
          <div className="mt-4">
            <FollowUpManager clientId={client.id} />
          </div>
        </TabsContent>

        {/* ================ ACTIVITY TAB ================ */}
        <TabsContent value="activity">
          <div className="mt-4 space-y-4">
            {/* Add note form */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">
                Add a Note
              </h3>
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={3}
                placeholder="Write a note about this client..."
                className="mb-2"
              />
              <div className="flex justify-end">
                <Button
                  onClick={addNote}
                  disabled={addingNote || !noteText.trim()}
                  size="sm"
                >
                  {addingNote ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Send className="size-3.5" />
                  )}
                  Add Note
                </Button>
              </div>
            </div>

            {/* Activity timeline */}
            {client.activities.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
                <Clock className="mx-auto size-8 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">
                  No activity recorded yet.
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                {client.activities.map((activity, idx) => (
                  <div key={activity.id} className="flex gap-3">
                    {/* Timeline line + icon */}
                    <div className="flex flex-col items-center">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white">
                        {activityIcon(activity.type)}
                      </div>
                      {idx < client.activities.length - 1 && (
                        <div className="w-px flex-1 bg-gray-200" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="pb-6">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      {activity.content && (
                        <p className="mt-0.5 whitespace-pre-wrap text-sm text-gray-600">
                          {activity.content}
                        </p>
                      )}
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                        {activity.user && (
                          <span>
                            {activity.user.firstName ?? ""}{" "}
                            {activity.user.lastName ?? ""}
                          </span>
                        )}
                        <span>{relativeTime(activity.createdAt)}</span>
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
