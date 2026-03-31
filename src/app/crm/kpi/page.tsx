"use client";

import { useState, useEffect } from "react";
import {
  PoundSterling,
  Trophy,
  Briefcase,
  Target,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Crown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface KPIData {
  revenue: {
    total: number;
    trend: number;
    avgPlacementFee: number;
    perRecruiter: { id: string; name: string; revenue: number }[];
    pipelineValue: number;
  };
  pipeline: {
    activeJobs: number;
    candidatesInPipeline: number;
    applications: number;
    interviews: number;
    offers: number;
    placements: number;
    placementsTrend: number;
    fillRate: number;
    avgTimeToFill: number;
  };
  funnel: { stage: string; count: number; conversionFromPrev: number }[];
  recruiterPerformance: {
    id: string;
    name: string;
    placements: number;
    revenue: number;
    applications: number;
    interviews: number;
    avgTimeToFill: number;
    fillRate: number;
  }[];
  clients: {
    active: number;
    new: number;
    repeat: number;
    top: { id: string; name: string; revenue: number }[];
  };
  candidates: {
    new: number;
    placed: number;
    active: number;
    sources: { source: string; count: number }[];
  };
  monthlyRevenue: { month: string; revenue: number }[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PERIODS = [
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Quarter", value: "quarter" },
  { label: "This Year", value: "year" },
];

const FUNNEL_COLORS = ["#94A3B8", "#60A5FA", "#818CF8", "#A78BFA", "#FBBF24", "#34D399"];
const PIE_COLORS = ["#4540DB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16", "#6B7280"];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function KPIDashboardPage() {
  const [period, setPeriod] = useState("month");
  const [recruiterId, setRecruiterId] = useState("");
  const [data, setData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recruiters, setRecruiters] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ period });
    if (recruiterId) params.set("recruiterId", recruiterId);
    fetch(`/api/kpi?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        if (d.recruiterPerformance && recruiters.length === 0) {
          setRecruiters(d.recruiterPerformance.map((r: { id: string; name: string }) => ({ id: r.id, name: r.name })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, recruiterId]);

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-bold text-gray-900">KPI Dashboard</h1>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    );
  }

  const { revenue, pipeline, funnel, recruiterPerformance, clients, candidates, monthlyRevenue } = data;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-bold text-gray-900">KPI Dashboard</h1>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg bg-gray-100 p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  period === p.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <select
            value={recruiterId}
            onChange={(e) => setRecruiterId(e.target.value)}
            className="h-7 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700"
          >
            <option value="">All Recruiters</option>
            {recruiters.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 1: Key Metrics */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          label="Revenue"
          value={`£${revenue.total.toLocaleString()}`}
          trend={revenue.trend}
          icon={PoundSterling}
        />
        <MetricCard
          label="Placements"
          value={String(pipeline.placements)}
          trend={pipeline.placementsTrend}
          icon={Trophy}
        />
        <MetricCard
          label="Active Jobs"
          value={String(pipeline.activeJobs)}
          icon={Briefcase}
        />
        <MetricCard
          label="Fill Rate"
          value={`${pipeline.fillRate}%`}
          icon={Target}
        />
        <MetricCard
          label="Avg Time-to-Fill"
          value={pipeline.avgTimeToFill > 0 ? `${pipeline.avgTimeToFill}d` : "N/A"}
          icon={Clock}
        />
        <MetricCard
          label="Pipeline Value"
          value={`£${pipeline.candidatesInPipeline > 0 ? revenue.pipelineValue.toLocaleString() : "0"}`}
          icon={TrendingUp}
        />
      </div>

      {/* Row 2: Conversion Funnel */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-xs font-semibold text-gray-700">Conversion Funnel</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={funnel} layout="vertical" margin={{ left: 10, right: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
            <XAxis type="number" fontSize={10} />
            <YAxis type="category" dataKey="stage" fontSize={10} width={70} />
            <Tooltip
              contentStyle={{ fontSize: 11 }}
              formatter={(value, _name, props) => [
                `${value} (${(props.payload as { conversionFromPrev: number }).conversionFromPrev}%)`,
                "Count",
              ]}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {funnel.map((_, i) => (
                <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {/* Conversion labels */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
          {funnel.map((f, i) => (
            <span key={f.stage} className="flex items-center gap-1 text-[10px] text-gray-500">
              <span className="font-medium text-gray-700">{f.stage}</span>
              <span>({f.count})</span>
              {i < funnel.length - 1 && (
                <>
                  <ArrowRight className="size-3 text-gray-400" />
                  <span className="font-semibold text-indigo-600">{funnel[i + 1].conversionFromPrev}%</span>
                </>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Row 3: Revenue Chart */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-xs font-semibold text-gray-700">Monthly Revenue (Last 12 Months)</h2>
        {monthlyRevenue.some((m) => m.revenue > 0) ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4540DB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4540DB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" fontSize={10} />
              <YAxis fontSize={10} tickFormatter={(v: number) => `£${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ fontSize: 11 }}
                formatter={(value) => [`£${Number(value).toLocaleString()}`, "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#4540DB" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-40 items-center justify-center text-xs text-gray-400">No revenue data yet</div>
        )}
      </div>

      {/* Row 4: Recruiter Leaderboard */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-xs font-semibold text-gray-700">Recruiter Leaderboard</h2>
        {recruiterPerformance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[10px] font-semibold text-gray-500">
                  <th className="pb-2 pr-3">#</th>
                  <th className="pb-2 pr-3">Name</th>
                  <th className="pb-2 pr-3 text-right">Placements</th>
                  <th className="pb-2 pr-3 text-right">Revenue</th>
                  <th className="pb-2 pr-3 text-right">Applications</th>
                  <th className="pb-2 pr-3 text-right">Interviews</th>
                  <th className="pb-2 pr-3 text-right">Avg TTF</th>
                  <th className="pb-2 text-right">Fill Rate</th>
                </tr>
              </thead>
              <tbody>
                {recruiterPerformance.map((r, i) => (
                  <tr
                    key={r.id}
                    className={`border-b border-gray-50 ${i === 0 ? "bg-amber-50/50" : ""}`}
                  >
                    <td className="py-2 pr-3">
                      <span className="flex items-center gap-1">
                        {i === 0 && <Crown className="size-3 text-amber-500" />}
                        <span className="font-medium text-gray-700">{i + 1}</span>
                      </span>
                    </td>
                    <td className="py-2 pr-3 font-medium text-gray-900">{r.name}</td>
                    <td className="py-2 pr-3 text-right text-gray-700">{r.placements}</td>
                    <td className="py-2 pr-3 text-right font-semibold text-gray-900">
                      £{r.revenue.toLocaleString()}
                    </td>
                    <td className="py-2 pr-3 text-right text-gray-700">{r.applications}</td>
                    <td className="py-2 pr-3 text-right text-gray-700">{r.interviews}</td>
                    <td className="py-2 pr-3 text-right text-gray-700">
                      {r.avgTimeToFill > 0 ? `${r.avgTimeToFill}d` : "N/A"}
                    </td>
                    <td className="py-2 text-right text-gray-700">{r.fillRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex h-20 items-center justify-center text-xs text-gray-400">
            No recruiter data for this period
          </div>
        )}
      </div>

      {/* Row 5: Client & Candidate Stats */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top Clients by Revenue */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-xs font-semibold text-gray-700">Top Clients by Revenue</h2>
          {clients.top.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={clients.top} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                <XAxis type="number" fontSize={10} tickFormatter={(v: number) => `£${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" fontSize={10} width={100} />
                <Tooltip
                  contentStyle={{ fontSize: 11 }}
                  formatter={(value) => [`£${Number(value).toLocaleString()}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#4540DB" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-40 items-center justify-center text-xs text-gray-400">
              No client revenue data
            </div>
          )}
          <div className="mt-2 flex gap-4 text-[10px] text-gray-500">
            <span>Active: <span className="font-semibold text-gray-700">{clients.active}</span></span>
            <span>New: <span className="font-semibold text-gray-700">{clients.new}</span></span>
            <span>Repeat: <span className="font-semibold text-gray-700">{clients.repeat}</span></span>
          </div>
        </div>

        {/* Candidate Sources */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-xs font-semibold text-gray-700">Candidate Sources</h2>
          {candidates.sources.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={candidates.sources}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  dataKey="count"
                  nameKey="source"
                  paddingAngle={2}
                >
                  {candidates.sources.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  wrapperStyle={{ fontSize: 10 }}
                  formatter={(value: string) => <span className="text-gray-600">{value}</span>}
                />
                <Tooltip contentStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-40 items-center justify-center text-xs text-gray-400">
              No candidate source data
            </div>
          )}
          <div className="mt-2 flex gap-4 text-[10px] text-gray-500">
            <span>New: <span className="font-semibold text-gray-700">{candidates.new}</span></span>
            <span>Placed: <span className="font-semibold text-gray-700">{candidates.placed}</span></span>
            <span>Active: <span className="font-semibold text-gray-700">{candidates.active}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MetricCard                                                         */
/* ------------------------------------------------------------------ */

function MetricCard({
  label,
  value,
  trend,
  icon: Icon,
}: {
  label: string;
  value: string;
  trend?: number;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium text-gray-500">{label}</p>
        <Icon className="size-3.5 text-gray-400" />
      </div>
      <div className="mt-1 flex items-end gap-2">
        <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
        {trend !== undefined && trend !== 0 && (
          <span
            className={`flex items-center gap-0.5 text-[10px] font-semibold ${
              trend > 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {trend > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
    </div>
  );
}
