"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Clock,
  Target,
  Activity,
  Loader2,
  PoundSterling,
  CalendarDays,
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
} from "recharts";
import { StatCard } from "@/components/shared/stat-card";

// ── Types ───────────────────────────────────────────────────────────────

interface RevenueData {
  monthlyRevenue: Record<string, unknown>[];
  revenueBySource: { name: string; value: number; color: string }[];
  pipeline: { pending: number; active: number };
  stats: {
    revenueThisMonth: number;
    revenueThisQuarter: number;
    revenueYTD: number;
    avgFeePerPlacement: number;
  };
  sources: string[];
}

interface ActivityData {
  weeklyData: {
    week: string;
    jobs: number;
    candidates: number;
    submissions: number;
    interviews: number;
    offers: number;
  }[];
  monthlyPlacements: Record<string, number>;
}

interface PerformanceData {
  stats: {
    avgTimeToFill: number;
    submitToInterview: number;
    interviewToOffer: number;
    offerAcceptance: number;
  };
  fillRateByClient: {
    client: string;
    jobs: number;
    filled: number;
    fillRate: number;
  }[];
}

type Tab = "revenue" | "activity" | "performance" | "market";

const TABS: { key: Tab; label: string }[] = [
  { key: "revenue", label: "Revenue" },
  { key: "activity", label: "Activity" },
  { key: "performance", label: "Performance" },
  { key: "market", label: "Market" },
];

const SOURCE_COLORS: Record<string, string> = {
  DIRECT: "#4540DB",
  HIRING_HUB: "#00D4FF",
  TEAM_NETWORK: "#10B981",
  SPLITFEE: "#F59E0B",
  GIIG: "#8B5CF6",
  OTHER: "#6B7280",
};

const SOURCE_LABELS: Record<string, string> = {
  DIRECT: "Direct",
  HIRING_HUB: "Hiring Hub",
  TEAM_NETWORK: "Team Network",
  SPLITFEE: "Split Fee",
  GIIG: "Giig",
  OTHER: "Other",
};

function formatCurrency(v: number) {
  return `£${v.toLocaleString()}`;
}

// ── Activity line config ────────────────────────────────────────────────

const ACTIVITY_LINES = [
  { key: "jobs", label: "Jobs added", color: "#4540DB" },
  { key: "candidates", label: "Candidates added", color: "#00D4FF" },
  { key: "submissions", label: "CV submissions", color: "#10B981" },
  { key: "interviews", label: "Interviews", color: "#F59E0B" },
  { key: "offers", label: "Offers", color: "#8B5CF6" },
] as const;

// ── Page Component ──────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("revenue");
  const [loading, setLoading] = useState(false);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>({
    jobs: true,
    candidates: true,
    submissions: true,
    interviews: true,
    offers: true,
  });

  const fetchData = useCallback(async (tab: Tab) => {
    if (tab === "market") return;
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?tab=${tab}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (tab === "revenue") setRevenueData(data);
      else if (tab === "activity") setActivityData(data);
      else if (tab === "performance") setPerformanceData(data);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  const toggleLine = (key: string) => {
    setVisibleLines((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track revenue, activity, and recruitment performance
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Revenue Tab */}
      {!loading && activeTab === "revenue" && revenueData && (
        <RevenueTab data={revenueData} />
      )}

      {/* Activity Tab */}
      {!loading && activeTab === "activity" && activityData && (
        <ActivityTab
          data={activityData}
          visibleLines={visibleLines}
          toggleLine={toggleLine}
        />
      )}

      {/* Performance Tab */}
      {!loading && activeTab === "performance" && performanceData && (
        <PerformanceTab data={performanceData} />
      )}

      {/* Market Tab */}
      {!loading && activeTab === "market" && <MarketTab />}
    </div>
  );
}

// ── Revenue Tab ─────────────────────────────────────────────────────────

function RevenueTab({ data }: { data: RevenueData }) {
  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue This Month"
          value={formatCurrency(data.stats.revenueThisMonth)}
          icon={PoundSterling}
        />
        <StatCard
          label="Revenue This Quarter"
          value={formatCurrency(data.stats.revenueThisQuarter)}
          icon={CalendarDays}
        />
        <StatCard
          label="Revenue YTD"
          value={formatCurrency(data.stats.revenueYTD)}
          icon={TrendingUp}
        />
        <StatCard
          label="Avg Fee / Placement"
          value={formatCurrency(data.stats.avgFeePerPlacement)}
          icon={DollarSign}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Bar Chart */}
        <div className="rounded-xl border bg-white p-6 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Revenue by Month
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => [
                  `£${Number(value).toLocaleString()}`,
                  "",
                ]}
              />
              <Legend
                formatter={(value) => SOURCE_LABELS[String(value)] || String(value)}
              />
              {(data.sources || Object.keys(SOURCE_COLORS)).map((src) => (
                <Bar
                  key={src}
                  dataKey={src}
                  stackId="revenue"
                  fill={SOURCE_COLORS[src] || "#6B7280"}
                  name={src}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Revenue by Source
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={data.revenueBySource}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }: { name?: string; percent?: number }) =>
                  `${SOURCE_LABELS[name || ""] || name || ""} ${((percent || 0) * 100).toFixed(0)}%`
                }
              >
                {data.revenueBySource.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [
                  `£${Number(value).toLocaleString()}`,
                  "",
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pipeline */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-white p-6">
          <p className="text-sm text-muted-foreground">Pending Pipeline</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">
            {formatCurrency(data.pipeline.pending)}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-6">
          <p className="text-sm text-muted-foreground">Active Pipeline</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {formatCurrency(data.pipeline.active)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Activity Tab ────────────────────────────────────────────────────────

function ActivityTab({
  data,
  visibleLines,
  toggleLine,
}: {
  data: ActivityData;
  visibleLines: Record<string, boolean>;
  toggleLine: (key: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Weekly Activity (last 12 weeks)
        </h3>

        {/* Legend toggles */}
        <div className="mb-4 flex flex-wrap gap-4">
          {ACTIVITY_LINES.map((line) => (
            <label
              key={line.key}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={visibleLines[line.key] ?? true}
                onChange={() => toggleLine(line.key)}
                className="rounded"
              />
              <span
                className="inline-block size-3 rounded-full"
                style={{ backgroundColor: line.color }}
              />
              {line.label}
            </label>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data.weeklyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            {ACTIVITY_LINES.map((line) =>
              visibleLines[line.key] ? (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  stroke={line.color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name={line.label}
                />
              ) : null
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly placements */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Placements per Month (last 12 months)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={Object.entries(data.monthlyPlacements).map(
              ([month, count]) => ({ month, count })
            )}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#EF4444" name="Placements" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Performance Tab ─────────────────────────────────────────────────────

function PerformanceTab({ data }: { data: PerformanceData }) {
  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Avg Time to Fill"
          value={`${data.stats.avgTimeToFill} days`}
          icon={Clock}
        />
        <StatCard
          label="Submit to Interview"
          value={`${data.stats.submitToInterview}%`}
          icon={Target}
        />
        <StatCard
          label="Interview to Offer"
          value={`${data.stats.interviewToOffer}%`}
          icon={Activity}
        />
        <StatCard
          label="Offer Acceptance"
          value={`${data.stats.offerAcceptance}%`}
          icon={CheckCircle2}
        />
      </div>

      {/* Fill rate table */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Fill Rate by Client
        </h3>
        {data.fillRateByClient.length === 0 ? (
          <p className="text-sm text-muted-foreground">No client data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Client</th>
                  <th className="pb-3 pr-4 font-medium text-right">Jobs</th>
                  <th className="pb-3 pr-4 font-medium text-right">Filled</th>
                  <th className="pb-3 font-medium text-right">Fill Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.fillRateByClient.map((row) => (
                  <tr key={row.client} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {row.client}
                    </td>
                    <td className="py-3 pr-4 text-right text-muted-foreground">
                      {row.jobs}
                    </td>
                    <td className="py-3 pr-4 text-right text-muted-foreground">
                      {row.filled}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          row.fillRate >= 75
                            ? "bg-emerald-50 text-emerald-700"
                            : row.fillRate >= 50
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-700"
                        }`}
                      >
                        {row.fillRate}%
                      </span>
                    </td>
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

// ── Market Tab ──────────────────────────────────────────────────────────

function MarketTab() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
      <BarChart3 className="size-16 text-muted-foreground" />
      <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">
        Market Intelligence
      </h2>
      <p className="mt-2 text-sm font-medium text-indigo-600">Coming Soon</p>
      <ul className="mt-6 max-w-sm space-y-2 text-left text-sm text-muted-foreground">
        <li className="flex items-start gap-2">
          <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-indigo-500" />
          Most requested skills across open roles
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-indigo-500" />
          Salary trends by role and seniority
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-indigo-500" />
          Demand heatmap by region
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-indigo-500" />
          Company hiring activity tracker
        </li>
      </ul>
    </div>
  );
}
