"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  Loader2,
  Mail,
  TrendingUp,
  PoundSterling,
  Target,
  Briefcase,
  Globe,
  Shield,
  Bot,
  Send,
  Eye,
  MessageSquare,
  AlertCircle,
  Clock,
  Users,
  CheckCircle2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { StatCard } from "@/components/shared/stat-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────────

interface ExecutiveData {
  emailsSentToday: number;
  emailsSentWeek: number;
  emailsSentMonth: number;
  replyRate: number;
  pipelineValue: number;
  revenueMTD: number;
  replyRateTrend: { date: string; replyRate: number; sent: number; replied: number }[];
  topIndustries: { name: string; responseRate: number; count: number }[];
  followUps: { id: string; prospect: string; company: string; scheduledAt: string | null; step: number }[];
}

interface OutreachData {
  deliveryRate: number;
  openRate: number;
  replyRate: number;
  bounceRate: number;
  dailyVolume: { date: string; sent: number; opened: number; replied: number; bounced: number }[];
  bestSubjectLines: { subject: string; step: number; openRate: number; replyRate: number }[];
  sequenceFunnel: { step: string; sent: number; replied: number }[];
  campaignPerformance: { id: string; name: string; status: string; sent: number; opened: number; replied: number; bounced: number; openRate: number; replyRate: number }[];
  suppressionGrowth: number;
}

interface PipelineData {
  pipelineStages: { stage: string; count: number }[];
  avgTimeToPlace: number;
  conversionFunnel: { stage: string; count: number }[];
  placementsByMonth: { month: string; count: number }[];
  jobsBreakdown: { name: string; value: number; color: string }[];
}

interface RevenueData {
  revenueMTD: number;
  revenueQTD: number;
  revenueYTD: number;
  avgPlacementFee: number;
  revenueByStream: { name: string; value: number; color: string }[];
  monthlyTrend: { month: string; amount: number }[];
  outstandingInvoices: { count: number; amount: number };
}

interface MarketData {
  demandByTech: { name: string; count: number }[];
  demandByRegion: { name: string; count: number }[];
  salaryBenchmarks: { role: string; avgMin: number; avgMax: number; count: number }[];
  supplyDemand: { candidates: number; activeJobs: number; ratio: number };
  responseByIndustry: { name: string; responseRate: number }[];
}

interface ComplianceReportData {
  complianceScore: number;
  optOutRate: number;
  spamComplaintRate: number;
  suppressionListSize: number;
  liaStatus: { approved: number; total: number };
  optOutProcessingTime: number;
  suppressionGrowth: { date: string; total: number }[];
}

interface AgentsData {
  agents: { name: string; description: string; status: string; weeklyActions: number; metric: string }[];
  apiUsage: { service: string; estimatedCalls: number; costEstimate: string }[];
}

type TabKey = "executive" | "outreach" | "pipeline" | "revenue" | "market" | "compliance" | "agents";

function formatCurrency(v: number) {
  return `£${v.toLocaleString()}`;
}

// ── Page Component ──────────────────────────────────────────────────────

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("executive");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>>({});

  const fetchTab = useCallback(async (tab: TabKey) => {
    if (data[tab]) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?tab=${tab}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const result = await res.json();
      setData((prev) => ({ ...prev, [tab]: result }));
    } catch {
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    fetchTab(activeTab);
  }, [activeTab, fetchTab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Reports
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Comprehensive reporting dashboard across all business areas
        </p>
      </div>

      <Tabs defaultValue="executive" onValueChange={(v) => { if (v) setActiveTab(v as TabKey); }}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="executive">
            <BarChart3 className="size-4" />
            Executive
          </TabsTrigger>
          <TabsTrigger value="outreach">
            <Mail className="size-4" />
            Outreach
          </TabsTrigger>
          <TabsTrigger value="pipeline">
            <Briefcase className="size-4" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="revenue">
            <PoundSterling className="size-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="market">
            <Globe className="size-4" />
            Market
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <Shield className="size-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="agents">
            <Bot className="size-4" />
            AI Agents
          </TabsTrigger>
        </TabsList>

        {loading && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && (
          <>
            <TabsContent value="executive" className="mt-6">
              {data.executive ? <ExecutiveTab data={data.executive as ExecutiveData} /> : null}
            </TabsContent>
            <TabsContent value="outreach" className="mt-6">
              {data.outreach ? <OutreachTab data={data.outreach as OutreachData} /> : null}
            </TabsContent>
            <TabsContent value="pipeline" className="mt-6">
              {data.pipeline ? <PipelineTab data={data.pipeline as PipelineData} /> : null}
            </TabsContent>
            <TabsContent value="revenue" className="mt-6">
              {data.revenue ? <RevenueTab data={data.revenue as RevenueData} /> : null}
            </TabsContent>
            <TabsContent value="market" className="mt-6">
              {data.market ? <MarketTab data={data.market as MarketData} /> : null}
            </TabsContent>
            <TabsContent value="compliance" className="mt-6">
              {data.compliance ? <ComplianceTab data={data.compliance as ComplianceReportData} /> : null}
            </TabsContent>
            <TabsContent value="agents" className="mt-6">
              {data.agents ? <AgentsTab data={data.agents as AgentsData} /> : null}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

// ── Tab 1: Executive Overview ───────────────────────────────────────────

function ExecutiveTab({ data }: { data: ExecutiveData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Emails Sent Today"
          value={data.emailsSentToday.toLocaleString()}
          icon={Send}
          change={`${data.emailsSentWeek.toLocaleString()} this week`}
        />
        <StatCard
          label="Reply Rate"
          value={`${data.replyRate}%`}
          icon={MessageSquare}
          changeType={data.replyRate > 5 ? "up" : "down"}
          change={data.replyRate > 5 ? "Above target" : "Below target"}
        />
        <StatCard
          label="Pipeline Value"
          value={formatCurrency(data.pipelineValue)}
          icon={Target}
        />
        <StatCard
          label="Revenue MTD"
          value={formatCurrency(data.revenueMTD)}
          icon={PoundSterling}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Reply Rate Trend */}
        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Reply Rate Trend (30 days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.replyRateTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${Number(v)}%`} />
              <Tooltip formatter={(value) => [`${Number(value)}%`, "Reply Rate"]} />
              <Line type="monotone" dataKey="replyRate" stroke="#4540DB" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Responding Industries */}
        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Top Responding Industries
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topIndustries} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `${Number(v)}%`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
              <Tooltip formatter={(value) => [`${Number(value)}%`, "Response Rate"]} />
              <Bar dataKey="responseRate" fill="#4540DB" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Upcoming Follow-ups */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Upcoming Follow-ups
        </h3>
        {data.followUps.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming follow-ups</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Prospect</th>
                <th className="pb-3 pr-4 font-medium">Company</th>
                <th className="pb-3 pr-4 font-medium">Scheduled</th>
                <th className="pb-3 font-medium">Step</th>
              </tr>
            </thead>
            <tbody>
              {data.followUps.map((f) => (
                <tr key={f.id} className="border-b last:border-0">
                  <td className="py-2.5 pr-4 font-medium text-foreground">{f.prospect}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{f.company}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">
                    {f.scheduledAt ? new Date(f.scheduledAt).toLocaleString() : "-"}
                  </td>
                  <td className="py-2.5">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      Step {f.step}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Tab 2: Outreach Analytics ───────────────────────────────────────────

function OutreachTab({ data }: { data: OutreachData }) {
  return (
    <div className="space-y-6">
      {/* Rate cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Delivery Rate"
          value={`${data.deliveryRate}%`}
          icon={Send}
          changeType={data.deliveryRate >= 95 ? "up" : "down"}
          change={data.deliveryRate >= 95 ? "Healthy" : "Needs attention"}
        />
        <StatCard
          label="Open Rate"
          value={`${data.openRate}%`}
          icon={Eye}
          changeType={data.openRate >= 40 ? "up" : "down"}
          change={data.openRate >= 40 ? "Above benchmark" : "Below benchmark"}
        />
        <StatCard
          label="Reply Rate"
          value={`${data.replyRate}%`}
          icon={MessageSquare}
          changeType={data.replyRate >= 5 ? "up" : "down"}
          change={data.replyRate >= 5 ? "Above target" : "Below target"}
        />
        <StatCard
          label="Bounce Rate"
          value={`${data.bounceRate}%`}
          icon={AlertCircle}
          changeType={data.bounceRate <= 3 ? "up" : "down"}
          change={data.bounceRate <= 3 ? "Healthy" : "Too high"}
        />
      </div>

      {/* Email Volume Area Chart */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Email Volume (30 days)
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data.dailyVolume}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => Number(value)} />
            <Legend />
            <Area type="monotone" dataKey="sent" stackId="1" fill="#4540DB" fillOpacity={0.3} stroke="#4540DB" name="Sent" />
            <Area type="monotone" dataKey="opened" stackId="2" fill="#10B981" fillOpacity={0.3} stroke="#10B981" name="Opened" />
            <Area type="monotone" dataKey="replied" stackId="3" fill="#F59E0B" fillOpacity={0.3} stroke="#F59E0B" name="Replied" />
            <Area type="monotone" dataKey="bounced" stackId="4" fill="#EF4444" fillOpacity={0.3} stroke="#EF4444" name="Bounced" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Best Subject Lines */}
        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Best Subject Lines
          </h3>
          {data.bestSubjectLines.length === 0 ? (
            <p className="text-sm text-muted-foreground">No subject line data yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Subject</th>
                  <th className="pb-3 pr-4 font-medium text-right">Open</th>
                  <th className="pb-3 font-medium text-right">Reply</th>
                </tr>
              </thead>
              <tbody>
                {data.bestSubjectLines.map((s, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-foreground max-w-xs truncate">
                      {s.subject}
                    </td>
                    <td className="py-2.5 pr-4 text-right text-muted-foreground">{s.openRate}%</td>
                    <td className="py-2.5 text-right text-muted-foreground">{s.replyRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Sequence Funnel */}
        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Sequence Step Funnel
          </h3>
          {data.sequenceFunnel.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sequence data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.sequenceFunnel}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="step" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => Number(value)} />
                <Legend />
                <Bar dataKey="sent" fill="#4540DB" name="Sent" radius={[4, 4, 0, 0]} />
                <Bar dataKey="replied" fill="#10B981" name="Replied" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Campaign Performance Table */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Campaign Performance
        </h3>
        {data.campaignPerformance.length === 0 ? (
          <p className="text-sm text-muted-foreground">No campaigns yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Campaign</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium text-right">Sent</th>
                  <th className="pb-3 pr-4 font-medium text-right">Opened</th>
                  <th className="pb-3 pr-4 font-medium text-right">Replied</th>
                  <th className="pb-3 pr-4 font-medium text-right">Open %</th>
                  <th className="pb-3 font-medium text-right">Reply %</th>
                </tr>
              </thead>
              <tbody>
                {data.campaignPerformance.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-foreground">{c.name}</td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          c.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : c.status === "PAUSED"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-gray-50 text-gray-700"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-right text-muted-foreground">{c.sent}</td>
                    <td className="py-2.5 pr-4 text-right text-muted-foreground">{c.opened}</td>
                    <td className="py-2.5 pr-4 text-right text-muted-foreground">{c.replied}</td>
                    <td className="py-2.5 pr-4 text-right text-muted-foreground">{c.openRate}%</td>
                    <td className="py-2.5 text-right text-muted-foreground">{c.replyRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab 3: Pipeline & Placements ────────────────────────────────────────

function PipelineTab({ data }: { data: PipelineData }) {
  const STAGE_COLORS: Record<string, string> = {
    SOURCED: "#6B7280",
    SCREENING: "#4540DB",
    INTERVIEW: "#F59E0B",
    OFFERED: "#8B5CF6",
    PLACED: "#10B981",
  };

  return (
    <div className="space-y-6">
      {/* Pipeline Stage Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {data.pipelineStages.map((s) => (
          <div key={s.stage} className="rounded-xl border bg-white p-4">
            <div
              className="mb-2 h-1 w-8 rounded-full"
              style={{ backgroundColor: STAGE_COLORS[s.stage] || "#6B7280" }}
            />
            <p className="text-xs text-muted-foreground">{s.stage}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{s.count}</p>
          </div>
        ))}
      </div>

      {/* KPI + Funnel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Conversion Funnel */}
        <div className="rounded-xl border bg-white p-6 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Conversion Funnel
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.conversionFunnel}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => Number(value)} />
              <Bar dataKey="count" fill="#4540DB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* KPIs + Pie */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-white p-6">
            <p className="text-sm text-muted-foreground">Avg Time to Place</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {data.avgTimeToPlace} <span className="text-lg font-normal text-muted-foreground">days</span>
            </p>
          </div>
          <div className="rounded-xl border bg-white p-6">
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              Active vs Filled
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={data.jobsBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.jobsBreakdown.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => Number(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Placements by Month */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Placements by Month
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.placementsByMonth}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip formatter={(value) => Number(value)} />
            <Bar dataKey="count" fill="#10B981" name="Placements" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Tab 4: Revenue & Finance ────────────────────────────────────────────

function RevenueTab({ data }: { data: RevenueData }) {
  return (
    <div className="space-y-6">
      {/* Large Counters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-6">
          <p className="text-sm text-muted-foreground">Revenue MTD</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {formatCurrency(data.revenueMTD)}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-6">
          <p className="text-sm text-muted-foreground">Revenue QTD</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {formatCurrency(data.revenueQTD)}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-6">
          <p className="text-sm text-muted-foreground">Revenue YTD</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {formatCurrency(data.revenueYTD)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly Trend */}
        <div className="rounded-xl border bg-white p-6 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Monthly Revenue Trend (12 months)
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `£${(Number(v) / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Revenue"]} />
              <Line type="monotone" dataKey="amount" stroke="#4540DB" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Stream */}
        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Revenue by Stream
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.revenueByStream}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }: { name?: string; percent?: number }) =>
                  `${name || ""} ${((percent || 0) * 100).toFixed(0)}%`
                }
              >
                {data.revenueByStream.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatCurrency(Number(value)), ""]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Outstanding Invoices + Avg Fee */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-white p-6">
          <p className="text-sm text-muted-foreground">Outstanding Invoices</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">
            {data.outstandingInvoices.count} invoices
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatCurrency(data.outstandingInvoices.amount)} total
          </p>
        </div>
        <div className="rounded-xl border bg-white p-6">
          <p className="text-sm text-muted-foreground">Avg Placement Fee</p>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {formatCurrency(data.avgPlacementFee)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Tab 5: Market Intelligence ──────────────────────────────────────────

function MarketTab({ data }: { data: MarketData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Demand by Technology */}
        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Demand by Technology
          </h3>
          {data.demandByTech.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.demandByTech} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                <Tooltip formatter={(value) => Number(value)} />
                <Bar dataKey="count" fill="#4540DB" radius={[0, 4, 4, 0]} name="Jobs" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Response Rate by Industry */}
        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Response Rate by Industry
          </h3>
          {data.responseByIndustry.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.responseByIndustry} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `${Number(v)}%`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                <Tooltip formatter={(value) => [`${Number(value)}%`, "Response Rate"]} />
                <Bar dataKey="responseRate" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Salary Benchmarks */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Salary Benchmarks by Role
        </h3>
        {data.salaryBenchmarks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No salary data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Role</th>
                  <th className="pb-3 pr-4 font-medium text-right">Avg Min</th>
                  <th className="pb-3 pr-4 font-medium text-right">Avg Max</th>
                  <th className="pb-3 font-medium text-right">Range</th>
                </tr>
              </thead>
              <tbody>
                {data.salaryBenchmarks.map((s) => (
                  <tr key={s.role} className="border-b last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-foreground">{s.role}</td>
                    <td className="py-2.5 pr-4 text-right text-muted-foreground">
                      {formatCurrency(s.avgMin)}
                    </td>
                    <td className="py-2.5 pr-4 text-right text-muted-foreground">
                      {formatCurrency(s.avgMax)}
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="text-xs font-medium text-indigo-600">
                        {formatCurrency(s.avgMin)} - {formatCurrency(s.avgMax)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Supply vs Demand */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-6">
          <p className="text-sm text-muted-foreground">Candidate Supply</p>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {data.supplyDemand.candidates.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-6">
          <p className="text-sm text-muted-foreground">Active Jobs (Demand)</p>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {data.supplyDemand.activeJobs.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-6">
          <p className="text-sm text-muted-foreground">Supply/Demand Ratio</p>
          <p className={`mt-2 text-2xl font-bold ${data.supplyDemand.ratio > 3 ? "text-emerald-600" : data.supplyDemand.ratio > 1 ? "text-amber-600" : "text-red-600"}`}>
            {data.supplyDemand.ratio}:1
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Tab 6: Compliance & GDPR ────────────────────────────────────────────

function ComplianceTab({ data }: { data: ComplianceReportData }) {
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-6">
          <p className="text-sm text-muted-foreground">Compliance Score</p>
          <p className="mt-2 text-4xl font-bold" style={{ color: scoreColor }}>
            {data.complianceScore}%
          </p>
        </div>
        <StatCard
          label="Opt-out Processing"
          value={`${data.optOutProcessingTime}h`}
          icon={Clock}
          changeType={data.optOutProcessingTime <= 24 ? "up" : "down"}
          change="Average time"
        />
        <div className="rounded-xl border bg-white p-6">
          <p className="text-sm text-muted-foreground">Spam Complaint Rate</p>
          <p className="mt-2 text-2xl font-bold" style={{ color: spamColor }}>
            {data.spamComplaintRate}%
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Target: &lt; 0.1%</p>
        </div>
        <StatCard
          label="Suppression List"
          value={data.suppressionListSize.toLocaleString()}
          icon={Shield}
        />
      </div>

      {/* LIA Status */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">LIA Document Status</h3>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-600" />
            <span className="text-sm">
              <span className="font-bold">{data.liaStatus.approved}</span> Approved
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-amber-600" />
            <span className="text-sm">
              <span className="font-bold">{data.liaStatus.total - data.liaStatus.approved}</span> Pending
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {data.liaStatus.total} total documents
          </div>
        </div>
      </div>

      {/* Suppression List Growth */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Suppression List Growth (30 days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.suppressionGrowth}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => Number(value)} />
            <Line type="monotone" dataKey="total" stroke="#EF4444" strokeWidth={2} dot={{ r: 2 }} name="Total" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Tab 7: AI Agent Performance ─────────────────────────────────────────

function AgentsTab({ data }: { data: AgentsData }) {
  const statusColors: Record<string, string> = {
    healthy: "bg-emerald-500",
    degraded: "bg-amber-500",
    down: "bg-red-500",
  };

  const agentColors: Record<string, string> = {
    SCOUT: "#4540DB",
    PROBE: "#00D4FF",
    BRIDGE: "#10B981",
    PULSE: "#F59E0B",
    ENGAGE: "#8B5CF6",
    COMPLY: "#EF4444",
    OUTREACH: "#EC4899",
  };

  return (
    <div className="space-y-6">
      {/* Agent Status Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.agents.map((agent) => (
          <div key={agent.name} className="rounded-xl border bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="flex size-8 items-center justify-center rounded-lg text-white text-xs font-bold"
                  style={{ backgroundColor: agentColors[agent.name] || "#6B7280" }}
                >
                  {agent.name.slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">{agent.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`size-2.5 rounded-full ${statusColors[agent.status] || "bg-gray-500"}`} />
                <span className="text-xs capitalize text-muted-foreground">{agent.status}</span>
              </div>
            </div>
            <div className="mt-4 border-t pt-3">
              <p className="text-xs text-muted-foreground">This week</p>
              <p className="text-lg font-bold text-foreground">{agent.weeklyActions.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{agent.metric}</p>
            </div>
          </div>
        ))}
      </div>

      {/* API Usage Table */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          API Usage Estimates (This Week)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Service</th>
                <th className="pb-3 pr-4 font-medium text-right">Estimated Calls</th>
                <th className="pb-3 font-medium text-right">Est. Cost</th>
              </tr>
            </thead>
            <tbody>
              {data.apiUsage.map((api) => (
                <tr key={api.service} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-medium text-foreground">{api.service}</td>
                  <td className="py-3 pr-4 text-right text-muted-foreground">
                    {api.estimatedCalls.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-muted-foreground">{api.costEstimate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
