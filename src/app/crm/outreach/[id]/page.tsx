"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Pause,
  Play,
  Square,
  Send,
  Eye,
  MessageSquare,
  AlertTriangle,
  Percent,
  Loader2,
  Trash2,
  Plus,
  Sparkles,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatCard } from "@/components/shared/stat-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  segment: string | null;
  status: string;
  dailyLimit: number;
  startDate: string | null;
  endDate: string | null;
  totalSent: number;
  totalOpened: number;
  totalReplied: number;
  totalBounced: number;
  openRate: number;
  replyRate: number;
  prospectCount: number;
  sendVia: string | null;
  createdAt: string;
  templates: Template[];
  metrics: Metric[];
}

interface Template {
  id: string;
  stepNumber: number;
  subject: string;
  body: string;
  variant: string;
  openRate: number | null;
  replyRate: number | null;
  isActive: boolean;
}

interface Metric {
  id: string;
  date: string;
  emailsSent: number;
  emailsOpened: number;
  emailsReplied: number;
  emailsBounced: number;
}

interface ProspectRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string | null;
  jobTitle: string | null;
  status: string;
  emailStatus: string;
  currentStep: number;
}

interface Reply {
  id: string;
  subject: string | null;
  body: string;
  receivedAt: string;
  sentiment: string | null;
  isRead: boolean;
  prospect: {
    firstName: string;
    lastName: string;
    company: string | null;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  PAUSED: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-blue-100 text-blue-700",
};

const EMAIL_STATUS_COLORS: Record<string, string> = {
  QUEUED: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  OPENED: "bg-indigo-100 text-indigo-700",
  REPLIED: "bg-emerald-100 text-emerald-700",
  BOUNCED: "bg-red-100 text-red-700",
};

const SENTIMENT_COLORS: Record<string, string> = {
  INTERESTED: "bg-emerald-100 text-emerald-700",
  NOT_INTERESTED: "bg-red-100 text-red-700",
  OOO: "bg-gray-100 text-gray-700",
  WRONG_PERSON: "bg-orange-100 text-orange-700",
  MEETING_REQUEST: "bg-purple-100 text-purple-700",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Overview Tab
// ---------------------------------------------------------------------------

function OverviewTab({ campaign }: { campaign: Campaign }) {
  const chartData = [...campaign.metrics].reverse().map((m) => ({
    date: formatDate(m.date),
    Sent: m.emailsSent,
    Opened: m.emailsOpened,
    Replied: m.emailsReplied,
    Bounced: m.emailsBounced,
  }));

  // Funnel data from templates
  const funnelSteps = campaign.templates
    .filter((t) => t.variant === "A")
    .sort((a, b) => a.stepNumber - b.stepNumber);

  return (
    <div className="space-y-6">
      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Metrics Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Sent"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Opened"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Replied"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Bounced"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
          No metrics data yet. Metrics will appear once emails start sending.
        </div>
      )}

      {/* Sequence Funnel */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          Sequence Step Funnel
        </h3>
        {funnelSteps.length > 0 ? (
          <div className="space-y-2">
            {funnelSteps.map((step) => (
              <div key={step.id} className="flex items-center gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {step.stepNumber}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-gray-700">
                    {step.subject}
                  </p>
                  <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                    <span>
                      Open: {step.openRate != null ? `${step.openRate}%` : "-"}
                    </span>
                    <span>
                      Reply: {step.replyRate != null ? `${step.replyRate}%` : "-"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No sequence steps configured.</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sequence Tab
// ---------------------------------------------------------------------------

function SequenceTab({
  campaign,
  onRefresh,
}: {
  campaign: Campaign;
  onRefresh: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [saving, setSaving] = useState(false);

  function startEdit(t: Template) {
    setEditingId(t.id);
    setEditSubject(t.subject);
    setEditBody(t.body);
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/outreach/campaigns/${campaign.id}/templates`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            subject: editSubject,
            body: editBody,
          }),
        }
      );
      if (!res.ok) throw new Error();
      toast.success("Template updated");
      setEditingId(null);
      onRefresh();
    } catch {
      toast.error("Failed to save template");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTemplate(templateId: string) {
    try {
      const res = await fetch(
        `/api/outreach/campaigns/${campaign.id}/templates?templateId=${templateId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      toast.success("Template removed");
      onRefresh();
    } catch {
      toast.error("Failed to delete template");
    }
  }

  return (
    <div className="space-y-4">
      {campaign.templates.map((t) => (
        <div
          key={t.id}
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {t.stepNumber}
              </span>
              <span className="text-sm font-medium text-gray-900">
                Step {t.stepNumber}
              </span>
              <Badge variant="secondary" className="text-[10px]">
                {t.variant}
              </Badge>
              {!t.isActive && (
                <Badge variant="destructive" className="text-[10px]">
                  Inactive
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {editingId === t.id ? (
                <>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </Button>
                  <Button size="xs" onClick={saveEdit} disabled={saving}>
                    {saving && <Loader2 className="size-3 animate-spin" />}
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => startEdit(t)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => deleteTemplate(t.id)}
                  >
                    <Trash2 className="size-3 text-red-500" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {editingId === t.id ? (
            <div className="mt-3 space-y-3">
              <div>
                <Label className="text-xs">Subject</Label>
                <Input
                  className="mt-1"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Body</Label>
                <Textarea
                  className="mt-1"
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={5}
                />
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700">{t.subject}</p>
              <p className="mt-1 whitespace-pre-wrap text-xs text-gray-500">
                {t.body.length > 200 ? t.body.slice(0, 200) + "..." : t.body}
              </p>
              <div className="mt-2 flex gap-4 text-xs text-gray-400">
                <span>
                  Open Rate: {t.openRate != null ? `${t.openRate}%` : "-"}
                </span>
                <span>
                  Reply Rate: {t.replyRate != null ? `${t.replyRate}%` : "-"}
                </span>
              </div>
            </div>
          )}
        </div>
      ))}

      {campaign.templates.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
          No email steps configured for this campaign.
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Prospects Tab
// ---------------------------------------------------------------------------

function ProspectsTab({ campaignId }: { campaignId: string }) {
  const [prospects, setProspects] = useState<ProspectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch(
          `/api/outreach/campaigns/${campaignId}/prospects?pageSize=50`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProspects(data.prospects);
        setTotal(data.total);
      } catch {
        toast.error("Failed to load prospects");
      } finally {
        setLoading(false);
      }
    }
    fetch_();
  }, [campaignId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-sm text-gray-500">{total} prospects</p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-2.5 text-xs font-medium text-gray-600">
                Name
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-gray-600">
                Email
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-gray-600">
                Company
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-gray-600">
                Step
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-gray-600">
                Email Status
              </th>
            </tr>
          </thead>
          <tbody>
            {prospects.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  No prospects in this campaign.
                </td>
              </tr>
            )}
            {prospects.map((p) => (
              <tr
                key={p.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-2.5 font-medium text-gray-900">
                  {p.firstName} {p.lastName}
                </td>
                <td className="px-4 py-2.5 text-gray-600">{p.email}</td>
                <td className="px-4 py-2.5 text-gray-600">
                  {p.company || "-"}
                </td>
                <td className="px-4 py-2.5 text-gray-600">{p.currentStep}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${EMAIL_STATUS_COLORS[p.emailStatus] || EMAIL_STATUS_COLORS.QUEUED}`}
                  >
                    {p.emailStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Replies Tab
// ---------------------------------------------------------------------------

function RepliesTab({ campaignId }: { campaignId: string }) {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch(
          `/api/outreach/inbox?campaignId=${campaignId}&pageSize=50`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setReplies(data.replies);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetch_();
  }, [campaignId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {replies.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
          No replies yet for this campaign.
        </div>
      )}
      {replies.map((r) => (
        <div
          key={r.id}
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {r.prospect.firstName} {r.prospect.lastName}
                {r.prospect.company && (
                  <span className="ml-1 text-gray-500">
                    at {r.prospect.company}
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                {formatDateTime(r.receivedAt)}
              </p>
            </div>
            {r.sentiment && (
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${SENTIMENT_COLORS[r.sentiment] || ""}`}
              >
                {r.sentiment.replace(/_/g, " ")}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {r.body.length > 300 ? r.body.slice(0, 300) + "..." : r.body}
          </p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Settings Tab
// ---------------------------------------------------------------------------

function SettingsTab({ campaign, onRefresh }: { campaign: Campaign; onRefresh: () => void }) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(campaign.name);
  const [description, setDescription] = useState(campaign.description || "");
  const [dailyLimit, setDailyLimit] = useState(String(campaign.dailyLimit || 30));
  const [sendVia, setSendVia] = useState(campaign.sendVia || "resend");

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/outreach/campaigns/${campaign.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          dailyLimit: parseInt(dailyLimit) || 30,
          sendVia,
        }),
      });
      if (res.ok) {
        toast.success("Campaign settings saved");
        onRefresh();
      } else {
        toast.error("Failed to save settings");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Campaign Settings</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-xs">Campaign Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" rows={3} />
          </div>
          <div>
            <Label className="text-xs">Daily Email Limit</Label>
            <Input type="number" value={dailyLimit} onChange={(e) => setDailyLimit(e.target.value)} className="mt-1 w-32" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Sending Account</h3>
        <div className="space-y-2">
          <label className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${sendVia === "resend" ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:bg-gray-50"}`}>
            <input type="radio" name="sendVia" value="resend" checked={sendVia === "resend"} onChange={() => setSendVia("resend")} className="accent-indigo-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">OSCABE (noreply@oscabe.com)</p>
              <p className="text-xs text-gray-500">Shared sending via Resend. Good for bulk campaigns.</p>
            </div>
          </label>
          <label className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${sendVia === "outlook" ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:bg-gray-50"}`}>
            <input type="radio" name="sendVia" value="outlook" checked={sendVia === "outlook"} onChange={() => setSendVia("outlook")} className="accent-indigo-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Your Outlook (connected Microsoft 365)</p>
              <p className="text-xs text-gray-500">Personal sending. Better deliverability. Replies go to your inbox. Limited to 30/min.</p>
            </div>
          </label>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 text-white hover:bg-indigo-700">
        {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
        Save Settings
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function CampaignDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchCampaign = useCallback(async () => {
    try {
      const res = await fetch(`/api/outreach/campaigns/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCampaign(data);
    } catch {
      toast.error("Failed to load campaign");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  async function updateStatus(newStatus: string) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/outreach/campaigns/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Campaign ${newStatus.toLowerCase()}`);
      fetchCampaign();
    } catch {
      toast.error("Failed to update campaign");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-gray-500">Campaign not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/crm/outreach")}
        >
          Back to Campaigns
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push("/crm/outreach")}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-bold text-gray-900">
              {campaign.name}
            </h1>
            <span
              className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[campaign.status] || STATUS_COLORS.DRAFT}`}
            >
              {campaign.status}
            </span>
          </div>
          {campaign.description && (
            <p className="mt-0.5 text-sm text-gray-500">
              {campaign.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {campaign.status === "ACTIVE" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateStatus("PAUSED")}
              disabled={updating}
            >
              <Pause className="size-3.5" />
              Pause
            </Button>
          )}
          {campaign.status === "PAUSED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateStatus("ACTIVE")}
              disabled={updating}
            >
              <Play className="size-3.5" />
              Resume
            </Button>
          )}
          {(campaign.status === "ACTIVE" || campaign.status === "PAUSED") && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => updateStatus("COMPLETED")}
              disabled={updating}
            >
              <Square className="size-3.5" />
              Stop
            </Button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-6">
        <StatCard label="Sent" value={campaign.totalSent} icon={Send} />
        <StatCard label="Opened" value={campaign.totalOpened} icon={Eye} />
        <StatCard
          label="Replied"
          value={campaign.totalReplied}
          icon={MessageSquare}
        />
        <StatCard
          label="Bounced"
          value={campaign.totalBounced}
          icon={AlertTriangle}
        />
        <StatCard
          label="Open Rate"
          value={`${campaign.openRate}%`}
          icon={Percent}
        />
        <StatCard
          label="Reply Rate"
          value={`${campaign.replyRate}%`}
          icon={Percent}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="flex-1">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sequence">Sequence</TabsTrigger>
          <TabsTrigger value="prospects">
            Prospects ({campaign.prospectCount})
          </TabsTrigger>
          <TabsTrigger value="replies">Replies</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab campaign={campaign} />
        </TabsContent>

        <TabsContent value="sequence" className="mt-4">
          <SequenceTab campaign={campaign} onRefresh={fetchCampaign} />
        </TabsContent>

        <TabsContent value="prospects" className="mt-4">
          <ProspectsTab campaignId={campaign.id} />
        </TabsContent>

        <TabsContent value="replies" className="mt-4">
          <RepliesTab campaignId={campaign.id} />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <SettingsTab campaign={campaign} onRefresh={fetchCampaign} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
