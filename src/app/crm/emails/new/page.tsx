"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Send,
  Save,
  AlertTriangle,
  Users,
  Building2,
  Eye,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AVAILABLE_TOKENS, replaceTokens } from "@/lib/email-tokens";
import { wrapEmailHtml } from "@/lib/email-html";

// ── Types ──────────────────────────────────────────────────────────────

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string | null;
}

interface RecipientPreview {
  id: string;
  name: string;
  email: string;
}

// ── Constants ──────────────────────────────────────────────────────────

const CANDIDATE_STATUSES = [
  "ACTIVE",
  "PASSIVE",
  "PLACED",
  "UNAVAILABLE",
  "INACTIVE",
];
const CANDIDATE_SOURCES = [
  "LINKEDIN",
  "REFERRAL",
  "JOB_BOARD",
  "WEBSITE",
  "COLD_OUTREACH",
  "AGENCY",
  "OTHER",
];

const CLIENT_STAGES = [
  "LEAD",
  "PROSPECT",
  "ACTIVE",
  "INACTIVE",
  "LOST",
];
const CLIENT_INDUSTRIES = [
  "Manufacturing",
  "Automotive",
  "Energy",
  "Pharmaceuticals",
  "Food & Beverage",
  "Logistics",
  "Technology",
  "Other",
];
const CLIENT_SOURCES = [
  "REFERRAL",
  "WEBSITE",
  "COLD_OUTREACH",
  "LINKEDIN",
  "EVENT",
  "OTHER",
];

const SAMPLE_TOKEN_DATA: Record<string, string> = {
  "{{firstName}}": "James",
  "{{lastName}}": "Wilson",
  "{{fullName}}": "James Wilson",
  "{{email}}": "james.wilson@example.com",
  "{{location}}": "Birmingham, UK",
  "{{topSkill}}": "PLC Programming",
  "{{skills}}": "PLC Programming, SCADA, HMI Design",
  "{{jobTitle}}": "Senior Controls Engineer",
  "{{jobLocation}}": "Coventry, UK",
  "{{jobSalary}}": "£50,000 - £60,000",
  "{{jobCompany}}": "Siemens",
  "{{jobType}}": "Permanent",
  "{{companyName}}": "Acme Manufacturing",
  "{{contactName}}": "Sarah Collins",
  "{{senderName}}": "Brijin Chacko",
  "{{senderEmail}}": "brijin@oscabe.com",
  "{{unsubscribeLink}}": "#",
};

// ── Step indicator ─────────────────────────────────────────────────────

function StepIndicator({
  currentStep,
  onStepClick,
}: {
  currentStep: number;
  onStepClick: (step: number) => void;
}) {
  const steps = [
    { num: 1, label: "Details" },
    { num: 2, label: "Compose" },
    { num: 3, label: "Recipients" },
    { num: 4, label: "Review" },
  ];

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center gap-2">
          <button
            onClick={() => onStepClick(step.num)}
            disabled={step.num > currentStep}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              step.num === currentStep
                ? "bg-indigo-600 text-white"
                : step.num < currentStep
                  ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                  : "bg-gray-100 text-gray-400"
            }`}
          >
            {step.num < currentStep ? (
              <Check className="size-3" />
            ) : (
              <span>{step.num}</span>
            )}
            {step.label}
          </button>
          {i < steps.length - 1 && (
            <div
              className={`h-px w-6 ${
                step.num < currentStep ? "bg-indigo-300" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1 - Details
  const [name, setName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  // Step 2 - Compose
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [composeTab, setComposeTab] = useState("edit");

  // Step 3 - Recipients
  const [recipientType, setRecipientType] = useState<"CANDIDATES" | "CLIENTS">(
    "CANDIDATES"
  );
  // Candidate filters
  const [candStatuses, setCandStatuses] = useState<string[]>([]);
  const [candSkills, setCandSkills] = useState("");
  const [candLocation, setCandLocation] = useState("");
  const [candSource, setCandSource] = useState("");
  // Client filters
  const [clientStages, setClientStages] = useState<string[]>([]);
  const [clientIndustry, setClientIndustry] = useState("");
  const [clientSource, setClientSource] = useState("");

  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [recipientPreviews, setRecipientPreviews] = useState<
    RecipientPreview[]
  >([]);
  const [recipientsLoading, setRecipientsLoading] = useState(false);

  // Step 4 - Sending
  const [isSending, setIsSending] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // ── Fetch templates ────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/emails/templates");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setTemplates(data.templates ?? []);
      } catch (err) {
        console.error("Error loading templates:", err);
      } finally {
        setTemplatesLoading(false);
      }
    }
    load();
  }, []);

  // ── Template selection ─────────────────────────────────────────────

  function handleTemplateSelect(templateId: string) {
    setSelectedTemplateId(templateId);
    if (templateId) {
      const tmpl = templates.find((t) => t.id === templateId);
      if (tmpl) {
        setSubject(tmpl.subject);
        setBody(tmpl.body);
      }
    }
  }

  // ── Recipient count fetch ──────────────────────────────────────────

  const recipientQuery = useMemo(() => {
    const query: Record<string, string> = {};
    if (recipientType === "CANDIDATES") {
      if (candStatuses.length > 0) query.status = candStatuses.join(",");
      if (candSkills) query.skills = candSkills;
      if (candLocation) query.location = candLocation;
      if (candSource) query.source = candSource;
    } else {
      if (clientStages.length > 0) query.stage = clientStages.join(",");
      if (clientIndustry) query.industry = clientIndustry;
      if (clientSource) query.source = clientSource;
    }
    return query;
  }, [
    recipientType,
    candStatuses,
    candSkills,
    candLocation,
    candSource,
    clientStages,
    clientIndustry,
    clientSource,
  ]);

  const fetchRecipientCount = useCallback(async () => {
    setRecipientsLoading(true);
    try {
      const endpoint =
        recipientType === "CANDIDATES" ? "/api/candidates" : "/api/clients";
      const params = new URLSearchParams();
      params.set("pageSize", "10");
      params.set("page", "1");
      Object.entries(recipientQuery).forEach(([k, v]) => params.set(k, v));

      const res = await fetch(`${endpoint}?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      const total = data.total ?? 0;
      setRecipientCount(total);

      const items =
        recipientType === "CANDIDATES"
          ? (data.candidates ?? [])
          : (data.clients ?? []);

      setRecipientPreviews(
        items.slice(0, 10).map((item: Record<string, string>) => ({
          id: item.id,
          name:
            recipientType === "CANDIDATES"
              ? `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim()
              : item.companyName ?? item.name ?? "",
          email: item.email ?? "",
        }))
      );
    } catch (err) {
      console.error("Error fetching recipients:", err);
      setRecipientCount(0);
      setRecipientPreviews([]);
    } finally {
      setRecipientsLoading(false);
    }
  }, [recipientType, recipientQuery]);

  useEffect(() => {
    if (step === 3) {
      fetchRecipientCount();
    }
  }, [step, fetchRecipientCount]);

  // ── Preview HTML ───────────────────────────────────────────────────

  const previewHtml = useMemo(() => {
    const rendered = replaceTokens(body, SAMPLE_TOKEN_DATA);
    return wrapEmailHtml(rendered);
  }, [body]);

  // ── Navigation ─────────────────────────────────────────────────────

  function canProceed(): boolean {
    switch (step) {
      case 1:
        return name.trim().length > 0;
      case 2:
        return subject.trim().length > 0 && body.trim().length > 0;
      case 3:
        return (recipientCount ?? 0) > 0;
      default:
        return true;
    }
  }

  function handleNext() {
    if (canProceed() && step < 4) {
      setStep(step + 1);
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep(step - 1);
    }
  }

  // ── Save / Send ────────────────────────────────────────────────────

  async function saveCampaign(
    status: "DRAFT" | "SENDING"
  ): Promise<string | null> {
    try {
      const res = await fetch("/api/emails/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          templateId: selectedTemplateId || undefined,
          subject,
          body,
          recipientType,
          recipientQuery: JSON.stringify(recipientQuery),
          status,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save campaign");
      }
      const campaign = await res.json();
      return campaign.id;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save campaign"
      );
      return null;
    }
  }

  async function handleSaveDraft() {
    setIsSavingDraft(true);
    const id = await saveCampaign("DRAFT");
    setIsSavingDraft(false);
    if (id) {
      toast.success("Campaign saved as draft");
      router.push("/crm/emails");
    }
  }

  async function handleSendNow() {
    setIsSending(true);
    const id = await saveCampaign("SENDING");
    if (id) {
      try {
        const res = await fetch(`/api/emails/campaign/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "SENDING" }),
        });
        if (!res.ok) throw new Error("Failed to send campaign");
        toast.success("Campaign is being sent!");
        router.push("/crm/emails");
      } catch (err) {
        toast.error("Campaign created but failed to start sending");
      }
    }
    setIsSending(false);
  }

  // ── Toggle helpers ─────────────────────────────────────────────────

  function toggleCandStatus(s: string) {
    setCandStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function toggleClientStage(s: string) {
    setClientStages((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function copyToken(token: string) {
    navigator.clipboard.writeText(token);
    toast.success(`Copied ${token}`);
  }

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/crm/emails">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="size-3.5" />
              Campaigns
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            New Campaign
          </h1>
        </div>
        <StepIndicator currentStep={step} onStepClick={(s) => s <= step && setStep(s)} />
      </div>

      <div className="rounded-lg border bg-white p-6">
        {/* ── STEP 1: Campaign Details ─────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Campaign Details
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Name your campaign and optionally pick a template to get
                started.
              </p>
            </div>

            <div className="max-w-lg space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="campaign-name">Campaign Name *</Label>
                <Input
                  id="campaign-name"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                  placeholder="e.g. Q1 PLC Engineer Outreach"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Start from a Template</Label>
                <Select
                  value={selectedTemplateId}
                  onValueChange={(v) => handleTemplateSelect(v ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        templatesLoading
                          ? "Loading templates..."
                          : "Write from scratch"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Write from scratch</SelectItem>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Selecting a template will pre-fill the subject and body.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Compose ──────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Compose Email
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Write your email content. Use tokens for personalisation.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <div className="space-y-1.5">
                  <Label htmlFor="campaign-subject">Subject Line *</Label>
                  <Input
                    id="campaign-subject"
                    value={subject}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSubject(e.target.value)
                    }
                    placeholder="e.g. {{firstName}}, exciting opportunity in {{jobLocation}}"
                  />
                </div>

                <Tabs
                  value={composeTab}
                  onValueChange={(v) => setComposeTab(String(v ?? "edit"))}
                >
                  <TabsList>
                    <TabsTrigger value="edit">
                      <FileText className="size-3" />
                      Edit
                    </TabsTrigger>
                    <TabsTrigger value="preview">
                      <Eye className="size-3" />
                      Preview
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit">
                    <Textarea
                      value={body}
                      onChange={(
                        e: React.ChangeEvent<HTMLTextAreaElement>
                      ) => setBody(e.target.value)}
                      rows={18}
                      placeholder="Write your email body here..."
                      className="font-mono text-sm"
                    />
                  </TabsContent>
                  <TabsContent value="preview">
                    <div className="rounded-lg border bg-gray-50 p-4">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        Preview with sample data:
                      </p>
                      <iframe
                        srcDoc={previewHtml}
                        className="w-full rounded border bg-white"
                        style={{ height: "450px" }}
                        title="Email preview"
                        sandbox=""
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Token sidebar */}
              <div className="rounded-lg border bg-gray-50 p-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Tokens
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Click to copy a token.
                </p>
                <Separator className="my-3" />
                <div className="max-h-[500px] space-y-1 overflow-y-auto">
                  {Object.entries(AVAILABLE_TOKENS).map(([token, desc]) => (
                    <button
                      key={token}
                      type="button"
                      onClick={() => copyToken(token)}
                      className="flex w-full items-start gap-2 rounded px-2 py-1 text-left transition-colors hover:bg-gray-100"
                    >
                      <code className="shrink-0 rounded bg-white px-1 py-0.5 text-[10px] font-medium text-indigo-600 border">
                        {token}
                      </code>
                      <span className="text-[10px] text-muted-foreground">
                        {desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Select Recipients ────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Select Recipients
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose who will receive this campaign.
              </p>
            </div>

            {/* Recipient type toggle */}
            <div className="flex gap-2">
              <Button
                variant={
                  recipientType === "CANDIDATES" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setRecipientType("CANDIDATES")}
              >
                <Users className="size-3.5" />
                Candidates
              </Button>
              <Button
                variant={recipientType === "CLIENTS" ? "default" : "outline"}
                size="sm"
                onClick={() => setRecipientType("CLIENTS")}
              >
                <Building2 className="size-3.5" />
                Clients
              </Button>
            </div>

            <Separator />

            {/* Filters */}
            {recipientType === "CANDIDATES" ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </Label>
                  <div className="space-y-1.5">
                    {CANDIDATE_STATUSES.map((s) => (
                      <label
                        key={s}
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <Checkbox
                          checked={candStatuses.includes(s)}
                          onCheckedChange={() => toggleCandStatus(s)}
                        />
                        <span className="text-sm">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Skills
                  </Label>
                  <Input
                    placeholder="e.g. PLC, SCADA"
                    value={candSkills}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCandSkills(e.target.value)
                    }
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Comma-separated skill names
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Location
                  </Label>
                  <Input
                    placeholder="e.g. Birmingham"
                    value={candLocation}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCandLocation(e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Source
                  </Label>
                  <Select
                    value={candSource}
                    onValueChange={(v) => setCandSource(v ?? "")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All sources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All sources</SelectItem>
                      {CANDIDATE_SOURCES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Pipeline Stage
                  </Label>
                  <div className="space-y-1.5">
                    {CLIENT_STAGES.map((s) => (
                      <label
                        key={s}
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <Checkbox
                          checked={clientStages.includes(s)}
                          onCheckedChange={() => toggleClientStage(s)}
                        />
                        <span className="text-sm">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Industry
                  </Label>
                  <Select
                    value={clientIndustry}
                    onValueChange={(v) => setClientIndustry(v ?? "")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All industries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All industries</SelectItem>
                      {CLIENT_INDUSTRIES.map((ind) => (
                        <SelectItem key={ind} value={ind}>
                          {ind}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Source
                  </Label>
                  <Select
                    value={clientSource}
                    onValueChange={(v) => setClientSource(v ?? "")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All sources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All sources</SelectItem>
                      {CLIENT_SOURCES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={fetchRecipientCount}
              disabled={recipientsLoading}
            >
              {recipientsLoading ? "Counting..." : "Refresh Count"}
            </Button>

            {/* Recipient count */}
            {recipientCount !== null && (
              <div className="rounded-lg border bg-indigo-50 p-4">
                <p className="text-sm font-medium text-indigo-900">
                  This campaign will send to{" "}
                  <span className="text-lg font-bold">{recipientCount}</span>{" "}
                  {recipientType === "CANDIDATES" ? "candidates" : "clients"}
                </p>
              </div>
            )}

            {/* Recipient preview */}
            {recipientPreviews.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700">
                  Preview (first {recipientPreviews.length})
                </h3>
                <div className="mt-2 rounded border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-3 py-2 text-left font-medium text-gray-600">
                          Name
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">
                          Email
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipientPreviews.map((r) => (
                        <tr key={r.id} className="border-b last:border-0">
                          <td className="px-3 py-2">{r.name}</td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {r.email}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* GDPR notice */}
            <div className="flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <AlertTriangle className="size-5 shrink-0 text-yellow-600" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">
                  GDPR Compliance
                </h4>
                <p className="mt-1 text-xs text-yellow-700">
                  Ensure all recipients have given consent to receive marketing
                  emails. An unsubscribe link will be automatically included in
                  the email footer. Recipients who have withdrawn consent will be
                  excluded from the send.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: Review & Send ────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Review & Send
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Review your campaign before sending.
              </p>
            </div>

            <div className="max-w-lg space-y-4">
              <div className="rounded-lg border bg-gray-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Campaign Name
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {name}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Recipients
                  </span>
                  <Badge variant="secondary">
                    {recipientCount ?? 0}{" "}
                    {recipientType === "CANDIDATES"
                      ? "candidates"
                      : "clients"}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Subject
                  </span>
                  <span className="max-w-xs truncate text-sm text-gray-900">
                    {subject}
                  </span>
                </div>
                <Separator />
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Body Preview
                  </span>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                    {body.slice(0, 300)}
                    {body.length > 300 ? "..." : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSavingDraft || isSending}
              >
                <Save className="size-3.5" />
                {isSavingDraft ? "Saving..." : "Save as Draft"}
              </Button>
              <Button
                onClick={handleSendNow}
                disabled={isSending || isSavingDraft}
              >
                <Send className="size-3.5" />
                {isSending ? "Sending..." : "Send Now"}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step navigation ──────────────────────────────────────── */}
        {step < 4 && (
          <>
            <Separator className="mt-6" />
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
              >
                <ArrowLeft className="size-3.5" />
                Back
              </Button>
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
