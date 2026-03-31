"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PoundSterling,
  Trophy,
  Briefcase,
  Users,
  Calendar,
  Clock,
  FileText,
  Phone,
  Mail,
  MessageSquare,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
} from "lucide-react";
import { AttendanceDashboardCard } from "@/components/crm/attendance-dashboard-card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DashboardStats {
  revenueThisMonth: number;
  placementsThisMonth: number;
  activeJobs: number;
  candidatesInPipeline: number;
  interviewsThisWeek: number;
  avgTimeToFill: number;
}

interface RevenueData {
  month: string;
  [source: string]: string | number;
}

interface PipelineStage {
  stage: string;
  count: number;
  color: string;
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  content: string | null;
  createdAt: string;
  user?: { firstName: string | null; lastName: string | null } | null;
}

interface StaleJob {
  id: string;
  title: string;
  companyName: string | null;
  client: { companyName: string } | null;
  createdAt: string;
  _count: { applications: number };
}

interface QuickKPIs {
  revenue: { total: number; trend: number; pipelineValue: number };
  pipeline: {
    placements: number;
    placementsTrend: number;
    activeJobs: number;
    fillRate: number;
    avgTimeToFill: number;
    candidatesInPipeline: number;
  };
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <Icon className="size-5 text-gray-400" />
      </div>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Activity Icon                                                      */
/* ------------------------------------------------------------------ */

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case "NOTE":
      return <FileText className="size-4 text-gray-500" />;
    case "CALL":
      return <Phone className="size-4 text-green-500" />;
    case "EMAIL":
      return <Mail className="size-4 text-blue-500" />;
    case "MEETING":
      return <Calendar className="size-4 text-purple-500" />;
    case "STATUS_CHANGE":
      return <RefreshCw className="size-4 text-orange-500" />;
    default:
      return <MessageSquare className="size-4 text-gray-400" />;
  }
}

/* ------------------------------------------------------------------ */
/*  Relative time                                                      */
/* ------------------------------------------------------------------ */

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/* ------------------------------------------------------------------ */
/*  Pipeline funnel                                                    */
/* ------------------------------------------------------------------ */

const PIPELINE_STAGES: PipelineStage[] = [
  { stage: "Sourced", count: 0, color: "bg-gray-400" },
  { stage: "Screening", count: 0, color: "bg-blue-400" },
  { stage: "Submitted", count: 0, color: "bg-indigo-400" },
  { stage: "Interview", count: 0, color: "bg-purple-400" },
  { stage: "Offer", count: 0, color: "bg-yellow-400" },
  { stage: "Placed", count: 0, color: "bg-green-400" },
];

const SOURCE_COLORS: Record<string, string> = {
  DIRECT: "#4540DB",
  HIRING_HUB: "#10B981",
  TEAM_NETWORK: "#F59E0B",
  SPLITFEE: "#EF4444",
  GIIG: "#8B5CF6",
  RECXCHANGE: "#EC4899",
  RECRUITING_HUB: "#06B6D4",
  PARAFORM: "#84CC16",
  OTHER: "#6B7280",
};

/* ------------------------------------------------------------------ */
/*  Dashboard Page                                                     */
/* ------------------------------------------------------------------ */

export default function CRMDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    revenueThisMonth: 0,
    placementsThisMonth: 0,
    activeJobs: 0,
    candidatesInPipeline: 0,
    interviewsThisWeek: 0,
    avgTimeToFill: 0,
  });
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [pipeline, setPipeline] = useState<PipelineStage[]>(PIPELINE_STAGES);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [staleJobs, setStaleJobs] = useState<StaleJob[]>([]);
  const [quickKpis, setQuickKpis] = useState<QuickKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, activitiesRes, kpiRes] = await Promise.all([
          fetch("/api/dashboard"),
          fetch("/api/activities?pageSize=15"),
          fetch("/api/kpi?period=month"),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.stats ?? stats);
          setRevenueData(data.revenueChart ?? []);
          setPipeline(data.pipeline ?? PIPELINE_STAGES);
          setStaleJobs(data.staleJobs ?? []);
        }

        if (activitiesRes.ok) {
          const data = await activitiesRes.json();
          setActivities(data.activities ?? []);
        }

        if (kpiRes.ok) {
          const kpiData = await kpiRes.json();
          setQuickKpis({
            revenue: kpiData.revenue,
            pipeline: kpiData.pipeline,
          });
        }
      } catch {
        // silently fail - dashboard will show zeros
      } finally {
        setLoading(false);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxPipeline = Math.max(...pipeline.map((s) => s.count), 1);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <div className="h-80 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-80 animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Attendance Check-In Card */}
      <AttendanceDashboardCard />

      {/* Quick KPIs */}
      {quickKpis && (
        <div className="grid gap-2 grid-cols-3 lg:grid-cols-6">
          <MiniKPI
            label="Revenue"
            value={`£${quickKpis.revenue.total.toLocaleString()}`}
            trend={quickKpis.revenue.trend}
            icon={PoundSterling}
          />
          <MiniKPI
            label="Placements"
            value={String(quickKpis.pipeline.placements)}
            trend={quickKpis.pipeline.placementsTrend}
            icon={Trophy}
          />
          <MiniKPI
            label="Active Jobs"
            value={String(quickKpis.pipeline.activeJobs)}
            icon={Briefcase}
          />
          <MiniKPI
            label="Fill Rate"
            value={`${quickKpis.pipeline.fillRate}%`}
            icon={Target}
          />
          <MiniKPI
            label="Avg TTF"
            value={quickKpis.pipeline.avgTimeToFill > 0 ? `${quickKpis.pipeline.avgTimeToFill}d` : "N/A"}
            icon={Clock}
          />
          <MiniKPI
            label="Pipeline"
            value={`£${quickKpis.revenue.pipelineValue.toLocaleString()}`}
            icon={TrendingUp}
          />
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Revenue This Month"
          value={`£${stats.revenueThisMonth.toLocaleString()}`}
          icon={PoundSterling}
        />
        <StatCard
          label="Placements This Month"
          value={String(stats.placementsThisMonth)}
          icon={Trophy}
        />
        <StatCard
          label="Active Jobs"
          value={String(stats.activeJobs)}
          icon={Briefcase}
        />
        <StatCard
          label="Candidates in Pipeline"
          value={String(stats.candidatesInPipeline)}
          icon={Users}
        />
        <StatCard
          label="Interviews This Week"
          value={String(stats.interviewsThisWeek)}
          icon={Calendar}
        />
        <StatCard
          label="Avg Time-to-Fill"
          value={stats.avgTimeToFill > 0 ? `${stats.avgTimeToFill}d` : "N/A"}
          icon={Clock}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        {/* Revenue chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">
            Revenue by Source (Last 6 Months)
          </h2>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v: number) => `£${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value) => [`£${Number(value).toLocaleString()}`, ""]}
                />
                <Legend />
                {Object.keys(SOURCE_COLORS).map((source) => (
                  <Bar
                    key={source}
                    dataKey={source}
                    fill={SOURCE_COLORS[source]}
                    radius={[2, 2, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-gray-400">
              No revenue data yet
            </div>
          )}
        </div>

        {/* Pipeline funnel */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">
            Recruiting Pipeline
          </h2>
          <div className="space-y-3">
            {pipeline.map((stage) => (
              <div key={stage.stage} className="flex items-center gap-3">
                <span className="w-20 text-right text-xs font-medium text-gray-500">
                  {stage.stage}
                </span>
                <div className="flex-1">
                  <div
                    className={`h-7 rounded ${stage.color} flex items-center px-2 text-xs font-semibold text-white transition-all`}
                    style={{
                      width: `${Math.max((stage.count / maxPipeline) * 100, 8)}%`,
                    }}
                  >
                    {stage.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent activity */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">
            Recent Activity
          </h2>
          {activities.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-gray-100">
                    <ActivityIcon type={activity.type} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900">{activity.title}</p>
                    {activity.content && (
                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {activity.content}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-gray-400">
                      {activity.user?.firstName
                        ? `${activity.user.firstName} ${activity.user.lastName ?? ""}`
                        : "System"}{" "}
                      · {relativeTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No activity yet</p>
          )}
        </div>

        {/* Stale jobs */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <AlertTriangle className="size-4 text-amber-500" />
            Jobs Needing Attention
          </h2>
          {staleJobs.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {staleJobs.map((job) => {
                const daysOpen = Math.floor(
                  (Date.now() - new Date(job.createdAt).getTime()) / 86400000
                );
                return (
                  <Link
                    key={job.id}
                    href={`/crm/jobs/${job.id}`}
                    className="block rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {job.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {job.client?.companyName ?? job.companyName ?? "No client"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-semibold ${daysOpen > 14 ? "text-red-600" : "text-gray-500"}`}>
                          {daysOpen}d open
                        </p>
                        <p className="text-xs text-gray-400">
                          {job._count.applications} candidates
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400">All jobs are on track</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mini KPI Card for Quick KPIs section                               */
/* ------------------------------------------------------------------ */

function MiniKPI({
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
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
      <Icon className="size-3.5 shrink-0 text-gray-400" />
      <div className="min-w-0">
        <p className="truncate text-[10px] text-gray-500">{label}</p>
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-gray-900">{value}</span>
          {trend !== undefined && trend !== 0 && (
            <span
              className={`flex items-center text-[9px] font-semibold ${
                trend > 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              {trend > 0 ? <TrendingUp className="size-2.5" /> : <TrendingDown className="size-2.5" />}
              {trend > 0 ? "+" : ""}
              {trend}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
