"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Loader2,
  Search,
  Sparkles,
  FileEdit,
  CheckCircle,
  Info,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

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

const JOB_STATUSES = ["ACTIVE", "ON_HOLD", "DRAFT"] as const;

const CONTRACT_TYPES = ["PERMANENT", "CONTRACT", "FIXED_TERM"] as const;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ClientOption {
  id: string;
  companyName: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatSource(source: string): string {
  return source.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ------------------------------------------------------------------ */
/*  Manual Entry Form                                                  */
/* ------------------------------------------------------------------ */

function ManualEntryForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Client search
  const [clientSearch, setClientSearch] = useState("");
  const [clientOptions, setClientOptions] = useState<ClientOption[]>([]);
  const [clientLoading, setClientLoading] = useState(false);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: "",
    clientId: "",
    clientName: "",
    description: "",
    location: "",
    remote: false,
    salaryMin: "",
    salaryMax: "",
    dayRateMin: "",
    dayRateMax: "",
    contractType: "",
    industry: "",
    feePercent: "",
    feeAmount: "",
    source: "",
    status: "ACTIVE",
    notes: "",
  });

  const searchClients = useCallback(async (query: string) => {
    if (query.length < 2) {
      setClientOptions([]);
      return;
    }
    setClientLoading(true);
    try {
      const res = await fetch(
        `/api/clients?search=${encodeURIComponent(query)}&pageSize=10`
      );
      if (res.ok) {
        const data = await res.json();
        setClientOptions(data.clients ?? []);
      }
    } catch {
      // silently fail
    } finally {
      setClientLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchClients(clientSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [clientSearch, searchClients]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.description.trim()) {
      toast.error("Description is required");
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        location: form.location || undefined,
        remote: form.remote,
        contractType: form.contractType || undefined,
        industry: form.industry || undefined,
        source: form.source || undefined,
        status: form.status,
        notes: form.notes || undefined,
      };

      if (form.clientId) body.clientId = form.clientId;
      if (form.salaryMin) body.salaryMin = parseFloat(form.salaryMin);
      if (form.salaryMax) body.salaryMax = parseFloat(form.salaryMax);
      if (form.dayRateMin) body.dayRateMin = parseFloat(form.dayRateMin);
      if (form.dayRateMax) body.dayRateMax = parseFloat(form.dayRateMax);
      if (form.feePercent) body.feePercent = parseFloat(form.feePercent);
      if (form.feeAmount) body.feeAmount = parseFloat(form.feeAmount);

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create job");
      }

      const job = await res.json();
      toast.success("Job created successfully");
      router.push(`/crm/jobs/${job.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create job"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <Label htmlFor="title">
          Job Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g. Senior Software Engineer"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>

      {/* Client search */}
      <div className="relative">
        <Label>Client</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search clients..."
            value={form.clientId ? form.clientName : clientSearch}
            onChange={(e) => {
              setClientSearch(e.target.value);
              setForm({ ...form, clientId: "", clientName: "" });
              setShowClientDropdown(true);
            }}
            onFocus={() => setShowClientDropdown(true)}
            className="pl-9"
          />
        </div>
        {form.clientId && (
          <button
            type="button"
            className="mt-1 text-xs text-gray-400 hover:text-gray-600"
            onClick={() => {
              setForm({ ...form, clientId: "", clientName: "" });
              setClientSearch("");
            }}
          >
            Clear selection
          </button>
        )}
        {showClientDropdown && !form.clientId && clientSearch.length >= 2 && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
            {clientLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="size-4 animate-spin text-gray-400" />
              </div>
            ) : clientOptions.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">
                No clients found
              </p>
            ) : (
              clientOptions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                  onClick={() => {
                    setForm({
                      ...form,
                      clientId: c.id,
                      clientName: c.companyName,
                    });
                    setShowClientDropdown(false);
                    setClientSearch("");
                  }}
                >
                  {c.companyName}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">
          Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Full job description..."
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          rows={6}
        />
      </div>

      {/* Location + Remote */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="e.g. London, UK"
            value={form.location}
            onChange={(e) =>
              setForm({ ...form, location: e.target.value })
            }
          />
        </div>
        <div className="flex items-end gap-3 pb-1">
          <Switch
            checked={form.remote}
            onCheckedChange={(checked) =>
              setForm({ ...form, remote: !!checked })
            }
          />
          <Label className="pb-0.5">Remote</Label>
        </div>
      </div>

      {/* Salary */}
      <div>
        <Label>Salary Range (Annual)</Label>
        <div className="mt-1 grid grid-cols-2 gap-3">
          <Input
            type="number"
            placeholder="Min"
            value={form.salaryMin}
            onChange={(e) =>
              setForm({ ...form, salaryMin: e.target.value })
            }
          />
          <Input
            type="number"
            placeholder="Max"
            value={form.salaryMax}
            onChange={(e) =>
              setForm({ ...form, salaryMax: e.target.value })
            }
          />
        </div>
      </div>

      {/* Day Rate */}
      <div>
        <Label>Day Rate</Label>
        <div className="mt-1 grid grid-cols-2 gap-3">
          <Input
            type="number"
            placeholder="Min"
            value={form.dayRateMin}
            onChange={(e) =>
              setForm({ ...form, dayRateMin: e.target.value })
            }
          />
          <Input
            type="number"
            placeholder="Max"
            value={form.dayRateMax}
            onChange={(e) =>
              setForm({ ...form, dayRateMax: e.target.value })
            }
          />
        </div>
      </div>

      {/* Contract + Industry */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              {CONTRACT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            placeholder="e.g. Technology"
            value={form.industry}
            onChange={(e) =>
              setForm({ ...form, industry: e.target.value })
            }
          />
        </div>
      </div>

      {/* Fee */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="feePercent">Fee %</Label>
          <Input
            id="feePercent"
            type="number"
            step="0.5"
            placeholder="e.g. 20"
            value={form.feePercent}
            onChange={(e) =>
              setForm({ ...form, feePercent: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="feeAmount">Fee Amount (GBP)</Label>
          <Input
            id="feeAmount"
            type="number"
            placeholder="e.g. 15000"
            value={form.feeAmount}
            onChange={(e) =>
              setForm({ ...form, feeAmount: e.target.value })
            }
          />
        </div>
      </div>

      {/* Source + Status */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            onValueChange={(v) => setForm({ ...form, status: v ?? "ACTIVE" })}
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

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Internal notes about this job..."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
        <Link href="/crm/jobs">
          <Button variant="outline" type="button">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Job"
          )}
        </Button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  AI Parsed Type                                                      */
/* ------------------------------------------------------------------ */

interface AIParsedJob {
  title?: string;
  description?: string;
  location?: string;
  remote?: boolean;
  contractType?: string;
  salaryMin?: number;
  salaryMax?: number;
  dayRateMin?: number;
  dayRateMax?: number;
  industry?: string;
  requiredSkills?: Array<{ name: string; minProficiency?: number }>;
  preferredSkills?: Array<{ name: string }>;
  salaryBenchmark?: string;
  estimatedTimeToFill?: string;
  difficultyRating?: string;
}

/* ------------------------------------------------------------------ */
/*  AI Assisted Tab                                                     */
/* ------------------------------------------------------------------ */

function AIAssistedTab() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<AIParsedJob | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Editable form from parsed data
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    remote: false,
    contractType: "",
    salaryMin: "",
    salaryMax: "",
    dayRateMin: "",
    dayRateMax: "",
    industry: "",
    source: "",
    status: "ACTIVE",
    notes: "",
  });

  async function handleParse() {
    if (!description.trim()) {
      toast.error("Please describe the role first");
      return;
    }
    setParsing(true);
    setError("");
    setParsed(null);
    try {
      const res = await fetch("/api/ai/parse-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to parse");
      }
      const data = await res.json();
      const p = data.parsed;
      setParsed(p);
      setForm({
        title: p.title || "",
        description: p.description || "",
        location: p.location || "",
        remote: p.remote || false,
        contractType: p.contractType || "",
        salaryMin: p.salaryMin ? String(p.salaryMin) : "",
        salaryMax: p.salaryMax ? String(p.salaryMax) : "",
        dayRateMin: p.dayRateMin ? String(p.dayRateMin) : "",
        dayRateMax: p.dayRateMax ? String(p.dayRateMax) : "",
        industry: p.industry || "",
        source: "",
        status: "ACTIVE",
        notes: "",
      });
      toast.success("Job spec generated by AI");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse");
    } finally {
      setParsing(false);
    }
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        location: form.location || undefined,
        remote: form.remote,
        contractType: form.contractType || undefined,
        industry: form.industry || undefined,
        source: form.source || undefined,
        status: form.status,
        notes: form.notes || undefined,
        aiParsedData: JSON.stringify(parsed),
      };
      if (form.salaryMin) body.salaryMin = parseFloat(form.salaryMin);
      if (form.salaryMax) body.salaryMax = parseFloat(form.salaryMax);
      if (form.dayRateMin) body.dayRateMin = parseFloat(form.dayRateMin);
      if (form.dayRateMax) body.dayRateMax = parseFloat(form.dayRateMax);

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create job");
      }
      const job = await res.json();
      toast.success("Job created successfully");
      router.push(`/crm/jobs/${job.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create job");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Input */}
      {!parsed && (
        <>
          <div>
            <Label htmlFor="ai-description">
              Describe the role in plain English
            </Label>
            <Textarea
              id="ai-description"
              placeholder="We need a Siemens PLC programmer with pharma experience for a 6-month contract in Manchester, paying around £400/day. They should know TIA Portal V18, WinCC, and ideally have GAMP5 experience..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={10}
              className="mt-1"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          <Button
            onClick={handleParse}
            disabled={parsing || !description.trim()}
            className="w-full"
          >
            {parsing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                OSCABE AI is generating your job spec...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Parse with AI
              </>
            )}
          </Button>
        </>
      )}

      {/* Parsed result - editable form */}
      {parsed && (
        <>
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            <CheckCircle className="size-4" />
            AI has generated a job spec. Review and edit below, then save.
          </div>

          {/* Salary benchmark */}
          {parsed.salaryBenchmark && (
            <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
              <Info className="mt-0.5 size-4 shrink-0" />
              <span>{String(parsed.salaryBenchmark)}</span>
            </div>
          )}

          {/* Difficulty + time to fill */}
          <div className="flex gap-3">
            {parsed.difficultyRating && (
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                parsed.difficultyRating === "EASY" ? "bg-green-100 text-green-700" :
                parsed.difficultyRating === "MODERATE" ? "bg-yellow-100 text-yellow-700" :
                parsed.difficultyRating === "HARD" ? "bg-orange-100 text-orange-700" :
                "bg-red-100 text-red-700"
              }`}>
                Difficulty: {String(parsed.difficultyRating).replace(/_/g, " ")}
              </span>
            )}
            {parsed.estimatedTimeToFill && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                Est. time to fill: {String(parsed.estimatedTimeToFill)}
              </span>
            )}
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="ai-title">Job Title</Label>
            <Input
              id="ai-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="ai-desc">Description</Label>
            <Textarea
              id="ai-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={6}
            />
          </div>

          {/* Location + Remote */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="flex items-end gap-3 pb-1">
              <Switch
                checked={form.remote}
                onCheckedChange={(checked) => setForm({ ...form, remote: !!checked })}
              />
              <Label>Remote</Label>
            </div>
          </div>

          {/* Salary */}
          <div>
            <Label>Salary Range</Label>
            <div className="mt-1 grid grid-cols-2 gap-3">
              <Input type="number" placeholder="Min" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
              <Input type="number" placeholder="Max" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} />
            </div>
          </div>

          {/* Day Rate */}
          <div>
            <Label>Day Rate</Label>
            <div className="mt-1 grid grid-cols-2 gap-3">
              <Input type="number" placeholder="Min" value={form.dayRateMin} onChange={(e) => setForm({ ...form, dayRateMin: e.target.value })} />
              <Input type="number" placeholder="Max" value={form.dayRateMax} onChange={(e) => setForm({ ...form, dayRateMax: e.target.value })} />
            </div>
          </div>

          {/* Contract Type + Industry */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Contract Type</Label>
              <Select value={form.contractType} onValueChange={(v) => setForm({ ...form, contractType: v ?? "" })}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {CONTRACT_TYPES.map((t) => (<SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Industry</Label>
              <Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
            </div>
          </div>

          {/* Skills from AI */}
          {Array.isArray(parsed.requiredSkills) && (
            <div>
              <Label>Required Skills (from AI)</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {parsed.requiredSkills.map((s, i) => (
                  <span key={i} className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {Array.isArray(parsed.preferredSkills) && parsed.preferredSkills.length > 0 && (
            <div>
              <Label>Preferred Skills (from AI)</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {parsed.preferredSkills.map((s, i) => (
                  <span key={i} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <Button variant="outline" onClick={() => setParsed(null)}>
              Start Over
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Job"
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function NewJobPage() {
  return (
    <div className="mx-auto max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/crm/jobs" className="hover:text-indigo-600">
          Jobs
        </Link>
        <ChevronRight className="size-3.5" />
        <span>New Job</span>
      </div>

      <h1 className="mt-3 text-2xl font-bold text-gray-900">Create New Job</h1>
      <p className="mt-1 text-sm text-gray-500">
        Add a new role to your pipeline
      </p>

      <div className="mt-6">
        <Tabs defaultValue="manual">
          <TabsList>
            <TabsTrigger value="manual">
              <FileEdit className="size-3.5" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles className="size-3.5" />
              AI Assisted
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="mt-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <ManualEntryForm />
            </div>
          </TabsContent>

          <TabsContent value="ai" className="mt-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <AIAssistedTab />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
