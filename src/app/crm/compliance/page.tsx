"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Shield,
  FileCheck,
  Ban,
  ClipboardList,
  Loader2,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  Trash2,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { StatCard } from "@/components/shared/stat-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────────

interface OverviewData {
  complianceScore: number;
  optOutProcessingTimeAvg: number;
  suppressionListSize: number;
  activeLIACount: number;
  totalLIACount: number;
  spamComplaintRate: number;
  dataRetention: {
    totalProspects: number;
    staleProspects: number;
    retentionCompliant: boolean;
  };
  totalEmailsSent: number;
  totalOptOuts: number;
}

interface LIADoc {
  id: string;
  campaignName: string;
  campaignId: string | null;
  legitimateInterest: string;
  necessityAnalysis: string;
  balancingTest: string;
  safeguards: string;
  status: string;
  createdBy: string | null;
  createdAt: string;
  approvedAt: string | null;
}

interface SuppressionEntry {
  id: string;
  email: string;
  reason: string;
  source: string | null;
  addedAt: string;
}

interface SuppressionData {
  entries: SuppressionEntry[];
  total: number;
  page: number;
  totalPages: number;
}

interface AuditEntry {
  id: string;
  type: string;
  title: string;
  content: string | null;
  user: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
  metadata: string | null;
}

// ── Page Component ─────────────────────────────────────────────────────

export default function CompliancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Compliance Centre
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          GDPR compliance management, suppression lists, and audit trails
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">
            <Shield className="size-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="lia">
            <FileCheck className="size-4" />
            LIA Documents
          </TabsTrigger>
          <TabsTrigger value="suppression">
            <Ban className="size-4" />
            Suppression List
          </TabsTrigger>
          <TabsTrigger value="audit">
            <ClipboardList className="size-4" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="lia" className="mt-6">
          <LIATab />
        </TabsContent>
        <TabsContent value="suppression" className="mt-6">
          <SuppressionTab />
        </TabsContent>
        <TabsContent value="audit" className="mt-6">
          <AuditTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Overview Tab ───────────────────────────────────────────────────────

function OverviewTab() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/compliance?tab=overview")
      .then((r) => r.json())
      .then(setData)
      .catch(() => toast.error("Failed to load overview"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return null;

  const scoreColor =
    data.complianceScore >= 80
      ? "#10B981"
      : data.complianceScore >= 60
        ? "#F59E0B"
        : "#EF4444";

  const spamColor =
    data.spamComplaintRate < 0.1
      ? "#10B981"
      : data.spamComplaintRate < 0.3
        ? "#F59E0B"
        : "#EF4444";

  const gaugeData = [
    { value: data.complianceScore },
    { value: 100 - data.complianceScore },
  ];

  const spamGaugeData = [
    { value: Math.min(data.spamComplaintRate * 1000, 100) },
    { value: 100 - Math.min(data.spamComplaintRate * 1000, 100) },
  ];

  return (
    <div className="space-y-6">
      {/* Top KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Compliance Score"
          value={`${data.complianceScore}%`}
          icon={Shield}
          changeType={data.complianceScore >= 80 ? "up" : "down"}
          change={data.complianceScore >= 80 ? "Compliant" : "Needs attention"}
        />
        <StatCard
          label="Opt-out Processing"
          value={`${data.optOutProcessingTimeAvg}h avg`}
          icon={Clock}
          changeType={data.optOutProcessingTimeAvg <= 24 ? "up" : "down"}
          change={data.optOutProcessingTimeAvg <= 24 ? "Within SLA" : "Over SLA"}
        />
        <StatCard
          label="Suppression List"
          value={data.suppressionListSize.toLocaleString()}
          icon={Ban}
        />
        <StatCard
          label="Active LIA Docs"
          value={`${data.activeLIACount} / ${data.totalLIACount}`}
          icon={FileCheck}
          changeType={data.activeLIACount === data.totalLIACount ? "up" : "down"}
          change={
            data.activeLIACount === data.totalLIACount
              ? "All approved"
              : `${data.totalLIACount - data.activeLIACount} pending`
          }
        />
      </div>

      {/* Gauges row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Compliance Score Gauge */}
        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-2 text-sm font-semibold text-foreground">
            GDPR Compliance Score
          </h3>
          <div className="flex items-center justify-center">
            <div className="relative" style={{ width: 200, height: 120 }}>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={gaugeData}
                    cx="50%"
                    cy="100%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    <Cell fill={scoreColor} />
                    <Cell fill="#E5E7EB" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-x-0 bottom-0 text-center">
                <span className="text-3xl font-bold" style={{ color: scoreColor }}>
                  {data.complianceScore}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Spam Complaint Rate Gauge */}
        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-2 text-sm font-semibold text-foreground">
            Spam Complaint Rate
          </h3>
          <p className="mb-2 text-xs text-muted-foreground">Target: &lt; 0.1%</p>
          <div className="flex items-center justify-center">
            <div className="relative" style={{ width: 200, height: 120 }}>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={spamGaugeData}
                    cx="50%"
                    cy="100%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    <Cell fill={spamColor} />
                    <Cell fill="#E5E7EB" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-x-0 bottom-0 text-center">
                <span className="text-3xl font-bold" style={{ color: spamColor }}>
                  {data.spamComplaintRate}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Retention */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Data Retention Status
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Total Prospects</p>
            <p className="mt-1 text-xl font-bold">
              {data.dataRetention.totalProspects.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
              Stale Records (&gt;6 months)
            </p>
            <p className={`mt-1 text-xl font-bold ${data.dataRetention.staleProspects > 0 ? "text-amber-600" : "text-emerald-600"}`}>
              {data.dataRetention.staleProspects.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Retention Status</p>
            <div className="mt-1 flex items-center gap-2">
              {data.dataRetention.retentionCompliant ? (
                <>
                  <CheckCircle2 className="size-5 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-600">Compliant</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="size-5 text-amber-600" />
                  <span className="text-sm font-medium text-amber-600">Review needed</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── LIA Tab ────────────────────────────────────────────────────────────

function LIATab() {
  const [documents, setDocuments] = useState<LIADoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    legitimateInterest: "",
    necessityAnalysis: "",
    balancingTest: "",
    safeguards: "",
    campaignId: "",
  });

  const fetchDocs = useCallback(() => {
    setLoading(true);
    fetch("/api/compliance?tab=lia")
      .then((r) => r.json())
      .then(setDocuments)
      .catch(() => toast.error("Failed to load LIA documents"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch("/api/compliance/lia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legitimateInterest: form.legitimateInterest,
          necessityAnalysis: form.necessityAnalysis,
          balancingTest: form.balancingTest,
          safeguards: form.safeguards,
          campaignId: form.campaignId || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to create");
      toast.success("LIA document created");
      setDialogOpen(false);
      setForm({
        legitimateInterest: "",
        necessityAnalysis: "",
        balancingTest: "",
        safeguards: "",
        campaignId: "",
      });
      fetchDocs();
    } catch {
      toast.error("Failed to create LIA document");
    } finally {
      setCreating(false);
    }
  }

  async function handleApprove(id: string) {
    try {
      const res = await fetch("/api/compliance/lia", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "APPROVED" }),
      });
      if (!res.ok) throw new Error("Failed to approve");
      toast.success("LIA document approved");
      fetchDocs();
    } catch {
      toast.error("Failed to approve document");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Legitimate Interest Assessments ({documents.length})
        </h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={<Button size="sm" />}
          >
            <Plus className="size-4" />
            Create LIA
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create LIA Document</DialogTitle>
              <DialogDescription>
                Complete a Legitimate Interest Assessment for GDPR compliance
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Legitimate Interest</label>
                <textarea
                  className="mt-1 w-full rounded-md border p-2 text-sm"
                  rows={3}
                  value={form.legitimateInterest}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, legitimateInterest: e.target.value }))
                  }
                  placeholder="Describe the legitimate interest pursued..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Necessity Analysis</label>
                <textarea
                  className="mt-1 w-full rounded-md border p-2 text-sm"
                  rows={3}
                  value={form.necessityAnalysis}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, necessityAnalysis: e.target.value }))
                  }
                  placeholder="Explain why this processing is necessary..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Balancing Test</label>
                <textarea
                  className="mt-1 w-full rounded-md border p-2 text-sm"
                  rows={3}
                  value={form.balancingTest}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, balancingTest: e.target.value }))
                  }
                  placeholder="Weigh the interests against the individual's rights..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Safeguards</label>
                <textarea
                  className="mt-1 w-full rounded-md border p-2 text-sm"
                  rows={3}
                  value={form.safeguards}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, safeguards: e.target.value }))
                  }
                  placeholder="Describe safeguards to protect individuals..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreate}
                disabled={
                  creating ||
                  !form.legitimateInterest ||
                  !form.necessityAnalysis ||
                  !form.balancingTest ||
                  !form.safeguards
                }
              >
                {creating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                Create Document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <FileCheck className="mx-auto size-12 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">
            No LIA documents yet. Create one to start.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Approved</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {doc.campaignName}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        doc.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {doc.approvedAt
                      ? new Date(doc.approvedAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {doc.status === "DRAFT" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove(doc.id)}
                      >
                        <CheckCircle2 className="size-3.5" />
                        Approve
                      </Button>
                    )}
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

// ── Suppression Tab ────────────────────────────────────────────────────

function SuppressionTab() {
  const [data, setData] = useState<SuppressionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState({ email: "", reason: "OPT_OUT", source: "MANUAL" });
  const [adding, setAdding] = useState(false);

  const fetchData = useCallback((searchTerm: string, pageNum: number) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    params.set("page", String(pageNum));

    fetch(`/api/compliance/suppression?${params}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => toast.error("Failed to load suppression list"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData(search, page);
  }, [fetchData, search, page]);

  async function handleAdd() {
    setAdding(true);
    try {
      const res = await fetch("/api/compliance/suppression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add");
      }
      toast.success("Email added to suppression list");
      setAddDialogOpen(false);
      setAddForm({ email: "", reason: "OPT_OUT", source: "MANUAL" });
      fetchData(search, page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add email");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(id: string, email: string) {
    if (!confirm(`Remove ${email} from suppression list?`)) return;
    try {
      const res = await fetch("/api/compliance/suppression", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, reason: "Manual removal" }),
      });
      if (!res.ok) throw new Error("Failed to remove");
      toast.success("Removed from suppression list");
      fetchData(search, page);
    } catch {
      toast.error("Failed to remove entry");
    }
  }

  const reasonBadgeClass: Record<string, string> = {
    OPT_OUT: "bg-red-50 text-red-700",
    BOUNCE: "bg-orange-50 text-orange-700",
    COMPLAINT: "bg-amber-50 text-amber-700",
    MANUAL: "bg-gray-50 text-gray-700",
    INVALID: "bg-purple-50 text-purple-700",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by email..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex gap-2">
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger render={<Button size="sm" />}>
              <Plus className="size-4" />
              Add Email
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add to Suppression List</DialogTitle>
                <DialogDescription>
                  Add an email address to prevent future outreach
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    className="mt-1"
                    type="email"
                    value={addForm.email}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Reason</label>
                  <select
                    className="mt-1 w-full rounded-md border p-2 text-sm"
                    value={addForm.reason}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, reason: e.target.value }))
                    }
                  >
                    <option value="OPT_OUT">Opt-out</option>
                    <option value="BOUNCE">Bounce</option>
                    <option value="COMPLAINT">Complaint</option>
                    <option value="MANUAL">Manual</option>
                    <option value="INVALID">Invalid email</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleAdd}
                  disabled={adding || !addForm.email}
                >
                  {adding ? <Loader2 className="size-4 animate-spin" /> : null}
                  Add to List
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button size="sm" variant="outline">
            <Upload className="size-4" />
            Bulk Upload
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : !data || data.entries.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <Ban className="mx-auto size-12 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">
            {search ? "No matching entries found" : "Suppression list is empty"}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Reason</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Date Added</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.entries.map((entry) => (
                  <tr key={entry.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {entry.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          reasonBadgeClass[entry.reason] || "bg-gray-50 text-gray-700"
                        }`}
                      >
                        {entry.reason}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {entry.source || "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(entry.addedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemove(entry.id, entry.email)}
                      >
                        <Trash2 className="size-3.5 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {data.entries.length} of {data.total} entries
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Audit Tab ──────────────────────────────────────────────────────────

function AuditTab() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    fetch("/api/compliance?tab=audit")
      .then((r) => r.json())
      .then(setEntries)
      .catch(() => toast.error("Failed to load audit log"))
      .finally(() => setLoading(false));
  }, []);

  const filteredEntries = entries.filter((e) => {
    const matchesSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.user.toLowerCase().includes(search.toLowerCase()) ||
      e.type.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || e.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const actionTypes = [...new Set(entries.map((e) => e.type))].sort();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search audit log..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-md border px-3 py-2 text-sm"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All types</option>
          {actionTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <ClipboardList className="mx-auto size-12 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">
            No audit log entries found
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Entity</th>
                <th className="px-4 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="border-b last:border-0">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {new Date(entry.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {entry.user}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {entry.entityType}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                    {entry.title}
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
