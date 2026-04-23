"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Plus,
  Trash2,
  Sparkles,
  Search,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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

interface TemplateStep {
  stepNumber: number;
  delayDays: number;
  subject: string;
  body: string;
  variant: string;
}

interface Prospect {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string | null;
  jobTitle: string | null;
  status: string;
  segment: string | null;
}

const SEGMENTS = [
  { value: "UK_HIRING_MANAGERS", label: "UK Hiring Managers" },
  { value: "AGENCY_OWNERS", label: "Agency Owners" },
  { value: "ENGINEERING_DIRECTORS", label: "Engineering Directors" },
  { value: "CUSTOM", label: "Custom Segment" },
];

const TOKEN_BUTTONS = [
  { label: "First Name", token: "{{firstName}}" },
  { label: "Company", token: "{{company}}" },
  { label: "Job Title", token: "{{jobTitle}}" },
];

const STEPS = ["Details", "Sequence", "Prospects", "Review & Launch"];

// ---------------------------------------------------------------------------
// Step 1: Details
// ---------------------------------------------------------------------------

type SendVia = "resend" | "outlook";

function StepDetails({
  form,
  setForm,
  sendVia,
  setSendVia,
  microsoftConnected,
  microsoftEmail,
}: {
  form: { name: string; description: string; segment: string; dailyLimit: number };
  setForm: (f: typeof form | ((prev: typeof form) => typeof form)) => void;
  sendVia: SendVia;
  setSendVia: (v: SendVia) => void;
  microsoftConnected: boolean;
  microsoftEmail: string | null;
}) {
  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div>
        <Label>
          Campaign Name <span className="text-red-500">*</span>
        </Label>
        <Input
          className="mt-1.5"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="UK Hiring Managers - Q1 Outreach"
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          className="mt-1.5"
          value={form.description}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
          rows={3}
          placeholder="Describe the purpose of this campaign..."
        />
      </div>

      <div>
        <Label>Target Segment</Label>
        <Select
          value={form.segment}
          onValueChange={(v) => setForm((p) => ({ ...p, segment: v ?? "" }))}
        >
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue placeholder="Select a segment" />
          </SelectTrigger>
          <SelectContent>
            {SEGMENTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Daily Send Limit</Label>
        <Input
          className="mt-1.5"
          type="number"
          min={1}
          max={500}
          value={form.dailyLimit}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              dailyLimit: parseInt(e.target.value, 10) || 50,
            }))
          }
        />
        <p className="mt-1 text-xs text-gray-500">
          Maximum emails to send per day (1-500)
        </p>
      </div>

      {/* Sending Account */}
      <div>
        <Label>Sending Account</Label>
        <div className="mt-1.5 space-y-2">
          <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="sendVia"
              value="resend"
              checked={sendVia === "resend"}
              onChange={() => setSendVia("resend")}
              className="mt-0.5"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                Send from OSCABE
              </span>
              <p className="text-xs text-gray-500 mt-0.5">
                Shared sender (noreply@oscabe.com) - good for bulk outreach
              </p>
            </div>
          </label>
          <label
            className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
              microsoftConnected
                ? "border-gray-200 cursor-pointer hover:bg-gray-50"
                : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
            }`}
          >
            <input
              type="radio"
              name="sendVia"
              value="outlook"
              checked={sendVia === "outlook"}
              onChange={() => setSendVia("outlook")}
              disabled={!microsoftConnected}
              className="mt-0.5"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                Send from my Outlook
                {microsoftEmail ? ` (${microsoftEmail})` : ""}
              </span>
              <p className="text-xs text-gray-500 mt-0.5">
                Personal sender - better deliverability and reply tracking
              </p>
              {!microsoftConnected && (
                <p className="text-xs text-amber-600 mt-1">
                  Connect your Microsoft account in Settings to enable this option
                </p>
              )}
              {microsoftConnected && (
                <p className="text-xs text-amber-600 mt-1">
                  Outlook sending is limited to 30 emails/minute
                </p>
              )}
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Sequence
// ---------------------------------------------------------------------------

function StepSequence({
  templates,
  setTemplates,
  segment,
}: {
  templates: TemplateStep[];
  setTemplates: (t: TemplateStep[] | ((prev: TemplateStep[]) => TemplateStep[])) => void;
  segment: string;
}) {
  const [generating, setGenerating] = useState<number | null>(null);

  function addStep() {
    if (templates.length >= 7) return;
    setTemplates((prev) => [
      ...prev,
      {
        stepNumber: prev.length + 1,
        delayDays: prev.length === 0 ? 0 : 3,
        subject: "",
        body: "",
        variant: "A",
      },
    ]);
  }

  function removeStep(index: number) {
    setTemplates((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((t, i) => ({ ...t, stepNumber: i + 1 }))
    );
  }

  function updateStep(index: number, field: string, value: string | number) {
    setTemplates((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
  }

  function insertToken(index: number, token: string) {
    setTemplates((prev) =>
      prev.map((t, i) =>
        i === index ? { ...t, body: t.body + token } : t
      )
    );
  }

  async function generateWithAI(index: number) {
    setGenerating(index);
    try {
      const res = await fetch("/api/ai/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segment,
          stepNumber: templates[index].stepNumber,
          purpose: segment
            ? `Outreach to ${segment.replace(/_/g, " ").toLowerCase()}`
            : "B2B recruitment outreach",
        }),
      });

      if (!res.ok) {
        // Fallback: generate a basic template
        const step = templates[index].stepNumber;
        const subject =
          step === 1
            ? "Quick question, {{firstName}}"
            : `Following up, {{firstName}}`;
        const body =
          step === 1
            ? `Hi {{firstName}},\n\nI came across {{company}} and was impressed by what your team is doing. As someone in the {{jobTitle}} space, I thought you might be interested in how we help companies like yours find top automation talent.\n\nWould you be open to a quick chat this week?\n\nBest regards`
            : `Hi {{firstName}},\n\nJust wanted to follow up on my previous message. I understand you are busy, I would love to share how we have helped similar companies reduce their time-to-hire by 40%.\n\nWorth a 15-minute call?\n\nBest regards`;
        updateStep(index, "subject", subject);
        updateStep(index, "body", body);
        toast.success("Template generated");
        return;
      }

      const data = await res.json();
      if (data.subject) updateStep(index, "subject", data.subject);
      if (data.body) updateStep(index, "body", data.body);
      toast.success("AI copy generated");
    } catch {
      toast.error("Failed to generate copy");
    } finally {
      setGenerating(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          Email Sequence ({templates.length}/7 steps)
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={addStep}
          disabled={templates.length >= 7}
        >
          <Plus className="size-3.5" />
          Add Step
        </Button>
      </div>

      {templates.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-500">
            No email steps yet. Add your first step to get started.
          </p>
          <Button className="mt-3" variant="outline" size="sm" onClick={addStep}>
            <Plus className="size-3.5" />
            Add First Step
          </Button>
        </div>
      )}

      {templates.map((step, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {step.stepNumber}
              </span>
              <span className="text-sm font-medium text-gray-900">
                Step {step.stepNumber}
              </span>
              {index > 0 && (
                <span className="text-xs text-gray-500">
                  (delay: {step.delayDays} days)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={step.variant}
                onValueChange={(v) => updateStep(index, "variant", v ?? "A")}
              >
                <SelectTrigger className="h-7 w-20 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Variant A</SelectItem>
                  <SelectItem value="B">Variant B</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="xs"
                onClick={() => generateWithAI(index)}
                disabled={generating === index}
              >
                {generating === index ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Sparkles className="size-3" />
                )}
                Generate with AI
              </Button>
              {templates.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeStep(index)}
                >
                  <Trash2 className="size-3 text-red-500" />
                </Button>
              )}
            </div>
          </div>

          {index > 0 && (
            <div className="mb-3">
              <Label className="text-xs">Delay (days)</Label>
              <Input
                className="mt-1 h-7 w-20 text-xs"
                type="number"
                min={1}
                max={30}
                value={step.delayDays}
                onChange={(e) =>
                  updateStep(index, "delayDays", parseInt(e.target.value, 10) || 1)
                }
              />
            </div>
          )}

          <div className="mb-3">
            <Label className="text-xs">Subject Line</Label>
            <Input
              className="mt-1"
              value={step.subject}
              onChange={(e) => updateStep(index, "subject", e.target.value)}
              placeholder="Quick question, {{firstName}}"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <Label className="text-xs">Email Body</Label>
              <div className="flex gap-1">
                {TOKEN_BUTTONS.map((tb) => (
                  <button
                    key={tb.token}
                    type="button"
                    onClick={() => insertToken(index, tb.token)}
                    className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 hover:bg-gray-200"
                  >
                    {tb.label}
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              value={step.body}
              onChange={(e) => updateStep(index, "body", e.target.value)}
              rows={5}
              placeholder="Hi {{firstName}},\n\nI came across {{company}} and..."
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3: Prospects
// ---------------------------------------------------------------------------

function StepProspects({
  selectedIds,
  setSelectedIds,
  segment,
}: {
  selectedIds: string[];
  setSelectedIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  segment: string;
}) {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  const fetchProspects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ pageSize: "50" });
      if (search) params.set("search", search);
      if (segment && segment !== "CUSTOM") params.set("segment", segment);
      const res = await fetch(`/api/prospects?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProspects(data.prospects);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load prospects");
    } finally {
      setLoading(false);
    }
  }, [search, segment]);

  useEffect(() => {
    const timer = setTimeout(fetchProspects, 300);
    return () => clearTimeout(timer);
  }, [fetchProspects]);

  function toggleProspect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  }

  function toggleAll() {
    const allIds = prospects.map((p) => p.id);
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...allIds])]);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          Select Prospects ({selectedIds.length} selected)
        </h3>
        <Badge variant="secondary">{total} total prospects</Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <Input
          className="pl-9"
          placeholder="Search prospects by name, email, company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="size-6 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-3 py-2.5">
                  <Checkbox
                    checked={
                      prospects.length > 0 &&
                      prospects.every((p) => selectedIds.includes(p.id))
                    }
                    onCheckedChange={toggleAll}
                  />
                </th>
                <th className="px-3 py-2.5 text-xs font-medium text-gray-600">
                  Name
                </th>
                <th className="px-3 py-2.5 text-xs font-medium text-gray-600">
                  Email
                </th>
                <th className="px-3 py-2.5 text-xs font-medium text-gray-600">
                  Company
                </th>
                <th className="px-3 py-2.5 text-xs font-medium text-gray-600">
                  Job Title
                </th>
                <th className="px-3 py-2.5 text-xs font-medium text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {prospects.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-8 text-center text-gray-400"
                  >
                    No prospects found.
                  </td>
                </tr>
              )}
              {prospects.map((p) => (
                <tr
                  key={p.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${
                    selectedIds.includes(p.id) ? "bg-indigo-50/50" : ""
                  }`}
                >
                  <td className="px-3 py-2.5">
                    <Checkbox
                      checked={selectedIds.includes(p.id)}
                      onCheckedChange={() => toggleProspect(p.id)}
                    />
                  </td>
                  <td className="px-3 py-2.5 font-medium text-gray-900">
                    {p.firstName} {p.lastName}
                  </td>
                  <td className="px-3 py-2.5 text-gray-600">{p.email}</td>
                  <td className="px-3 py-2.5 text-gray-600">
                    {p.company || "-"}
                  </td>
                  <td className="px-3 py-2.5 text-gray-600">
                    {p.jobTitle || "-"}
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant="secondary" className="text-[10px]">
                      {p.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4: Review & Launch
// ---------------------------------------------------------------------------

function StepReview({
  form,
  templates,
  prospectCount,
  liaChecked,
  setLiaChecked,
  suppressionChecked,
  setSuppressionChecked,
  sendVia,
}: {
  form: { name: string; description: string; segment: string; dailyLimit: number };
  templates: TemplateStep[];
  prospectCount: number;
  liaChecked: boolean;
  setLiaChecked: (v: boolean) => void;
  suppressionChecked: boolean;
  setSuppressionChecked: (v: boolean) => void;
  sendVia: SendVia;
}) {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Campaign Summary */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-900">Campaign Details</h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Name</dt>
            <dd className="font-medium text-gray-900">{form.name || "-"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Segment</dt>
            <dd className="font-medium text-gray-900">
              {SEGMENTS.find((s) => s.value === form.segment)?.label || "-"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Daily Limit</dt>
            <dd className="font-medium text-gray-900">{form.dailyLimit}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Sending Account</dt>
            <dd className="font-medium text-gray-900">
              {sendVia === "outlook" ? "My Outlook" : "OSCABE (Resend)"}
            </dd>
          </div>
        </dl>
      </div>

      {/* Sequence Preview */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Email Sequence ({templates.length} steps)
        </h3>
        <div className="mt-3 space-y-2">
          {templates.map((t, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-md bg-gray-50 px-3 py-2 text-sm"
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                {t.stepNumber}
              </span>
              <span className="flex-1 truncate text-gray-700">
                {t.subject || "(No subject)"}
              </span>
              <Badge variant="secondary" className="text-[10px]">
                {t.variant}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Prospects */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-900">Prospects</h3>
        <p className="mt-1 text-sm text-gray-600">
          <span className="font-medium text-indigo-600">{prospectCount}</span>{" "}
          prospects selected for this campaign.
        </p>
      </div>

      {/* Compliance */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-amber-800">
          Compliance Checklist
        </h3>
        <div className="mt-3 space-y-3">
          <label className="flex items-start gap-2">
            <Checkbox
              checked={liaChecked}
              onCheckedChange={(v) => setLiaChecked(v === true)}
              className="mt-0.5"
            />
            <span className="text-sm text-amber-700">
              Legitimate Interest Assessment (LIA) has been completed and
              documented for this campaign segment.
            </span>
          </label>
          <label className="flex items-start gap-2">
            <Checkbox
              checked={suppressionChecked}
              onCheckedChange={(v) => setSuppressionChecked(v === true)}
              className="mt-0.5"
            />
            <span className="text-sm text-amber-700">
              Suppression list will be checked before sending. Unsubscribed
              contacts will not receive emails.
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Wizard
// ---------------------------------------------------------------------------

export default function NewCampaignPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    segment: "",
    dailyLimit: 50,
  });

  const [templates, setTemplates] = useState<TemplateStep[]>([
    {
      stepNumber: 1,
      delayDays: 0,
      subject: "",
      body: "",
      variant: "A",
    },
  ]);

  const [selectedProspectIds, setSelectedProspectIds] = useState<string[]>([]);
  const [liaChecked, setLiaChecked] = useState(false);
  const [suppressionChecked, setSuppressionChecked] = useState(false);
  const [sendVia, setSendVia] = useState<SendVia>("resend");
  const [microsoftConnected, setMicrosoftConnected] = useState(false);
  const [microsoftEmail, setMicrosoftEmail] = useState<string | null>(null);

  // Fetch user's Microsoft connection status
  useEffect(() => {
    async function fetchMicrosoftStatus() {
      try {
        const res = await fetch("/api/user/me");
        if (res.ok) {
          const data = await res.json();
          setMicrosoftConnected(data.microsoftConnected ?? false);
          setMicrosoftEmail(data.microsoftEmail ?? null);
        }
      } catch {
        // Ignore - default to not connected
      }
    }
    fetchMicrosoftStatus();
  }, []);

  function canProceed(): boolean {
    if (currentStep === 0) return form.name.trim().length > 0;
    if (currentStep === 1)
      return templates.length > 0 && templates.every((t) => t.subject && t.body);
    if (currentStep === 2) return true; // prospects optional
    if (currentStep === 3) return liaChecked && suppressionChecked;
    return false;
  }

  async function handleLaunch() {
    setSaving(true);
    try {
      // 1. Create campaign
      const campRes = await fetch("/api/outreach/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sendVia }),
      });
      if (!campRes.ok) {
        const err = await campRes.json();
        throw new Error(err.error || "Failed to create campaign");
      }
      const campaign = await campRes.json();

      // 2. Add templates
      for (const t of templates) {
        await fetch(`/api/outreach/campaigns/${campaign.id}/templates`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stepNumber: t.stepNumber,
            subject: t.subject,
            body: t.body,
            variant: t.variant,
          }),
        });
      }

      // 3. Add prospects
      if (selectedProspectIds.length > 0) {
        await fetch(`/api/outreach/campaigns/${campaign.id}/prospects`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prospectIds: selectedProspectIds }),
        });
      }

      // 4. Start campaign
      const sendRes = await fetch(
        `/api/outreach/campaigns/${campaign.id}/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sendVia }),
        }
      );
      if (sendRes.ok) {
        const sendData = await sendRes.json();
        toast.success(
          `Campaign launched! ${sendData.queued} emails queued.`
        );
      } else {
        toast.success("Campaign created as draft.");
      }

      router.push(`/crm/outreach/${campaign.id}`);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create campaign"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push("/crm/outreach")}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-lg font-bold text-gray-900">New Campaign</h1>
      </div>

      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (i < currentStep) setCurrentStep(i);
                }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  i === currentStep
                    ? "bg-indigo-100 text-indigo-700"
                    : i < currentStep
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {i < currentStep ? (
                  <Check className="size-3" />
                ) : (
                  <span className="flex size-4 items-center justify-center rounded-full bg-current/10 text-[10px]">
                    {i + 1}
                  </span>
                )}
                {label}
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-px w-8 ${
                    i < currentStep ? "bg-emerald-300" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        {currentStep === 0 && (
          <StepDetails
            form={form}
            setForm={setForm}
            sendVia={sendVia}
            setSendVia={setSendVia}
            microsoftConnected={microsoftConnected}
            microsoftEmail={microsoftEmail}
          />
        )}
        {currentStep === 1 && (
          <StepSequence
            templates={templates}
            setTemplates={setTemplates}
            segment={form.segment}
          />
        )}
        {currentStep === 2 && (
          <StepProspects
            selectedIds={selectedProspectIds}
            setSelectedIds={setSelectedProspectIds}
            segment={form.segment}
          />
        )}
        {currentStep === 3 && (
          <StepReview
            form={form}
            templates={templates}
            prospectCount={selectedProspectIds.length}
            liaChecked={liaChecked}
            setLiaChecked={setLiaChecked}
            suppressionChecked={suppressionChecked}
            setSuppressionChecked={setSuppressionChecked}
            sendVia={sendVia}
          />
        )}
      </div>

      {/* Navigation footer */}
      <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
        <Button
          variant="outline"
          onClick={() =>
            currentStep === 0
              ? router.push("/crm/outreach")
              : setCurrentStep((s) => s - 1)
          }
        >
          <ArrowLeft className="size-4" />
          {currentStep === 0 ? "Cancel" : "Back"}
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button
            onClick={() => setCurrentStep((s) => s + 1)}
            disabled={!canProceed()}
          >
            Next
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button onClick={handleLaunch} disabled={!canProceed() || saving}>
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Rocket className="size-4" />
            )}
            Launch Campaign
          </Button>
        )}
      </div>
    </div>
  );
}
