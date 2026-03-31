"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Loader2,
  Clock,
  Calendar,
  Download,
  FileText,
  ChevronRight,
  Search,
  RefreshCw,
  BarChart3,
  CheckCircle2,
  Timer,
  X,
} from "lucide-react";
import { toast } from "sonner";

// --------------- Types ---------------

interface TeamMember {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
  currentStatus: "CHECKED_IN" | "ON_BREAK" | "IDLE" | "OFFLINE";
  workLocation?: string;
  checkInTime?: string;
  totalActiveMinutes?: number;
  totalBreakMinutes?: number;
  totalIdleMinutes?: number;
  breakCount?: number;
  lastCheckIn?: string;
}

interface TimelineEvent {
  id: string;
  type:
    | "CHECK_IN"
    | "CHECK_OUT"
    | "BREAK_START"
    | "BREAK_END"
    | "IDLE_START"
    | "IDLE_END"
    | "LOG";
  timestamp: string;
  description?: string;
}

interface DaySummary {
  date: string;
  checkInAt?: string;
  checkOutAt?: string;
  activeMinutes: number;
  breakMinutes: number;
  idleMinutes: number;
  totalMinutes: number;
}

interface WorkLog {
  id: string;
  description: string;
  type: string;
  createdAt: string;
}

interface MemberDetail {
  member: TeamMember;
  timeline: TimelineEvent[];
  history: DaySummary[];
  logs: WorkLog[];
  stats: {
    avgHoursPerDay: number;
    daysWorked: number;
    onTimeRate: number;
  };
}

interface ReportEntry {
  id: string;
  date: string;
  userName: string;
  email: string;
  checkIn: string;
  checkOut: string | null;
  location: string;
  totalHours: string;
  activeHours: string;
  breakHours: string;
  idleHours: string;
}

// --------------- Constants ---------------

const STATUS_COLORS: Record<string, string> = {
  CHECKED_IN: "bg-[#22C55E]",
  ON_BREAK: "bg-[#F59E0B]",
  IDLE: "bg-[#EF4444]",
  OFFLINE: "bg-gray-400",
};

const STATUS_TEXT_COLORS: Record<string, string> = {
  CHECKED_IN: "text-[#22C55E]",
  ON_BREAK: "text-[#F59E0B]",
  IDLE: "text-[#EF4444]",
  OFFLINE: "text-gray-400",
};

const STATUS_LABELS: Record<string, string> = {
  CHECKED_IN: "Active",
  ON_BREAK: "Break",
  IDLE: "Idle",
  OFFLINE: "Offline",
};

const LOCATION_EMOJI: Record<string, string> = {
  HOME: "\uD83C\uDFE0",
  OFFICE: "\uD83C\uDFE2",
  REMOTE: "\uD83C\uDF10",
};

const EVENT_COLORS: Record<string, string> = {
  CHECK_IN: "border-[#22C55E] bg-[#22C55E]/10",
  CHECK_OUT: "border-gray-400 bg-gray-100",
  BREAK_START: "border-[#F59E0B] bg-[#F59E0B]/10",
  BREAK_END: "border-[#F59E0B] bg-[#F59E0B]/10",
  IDLE_START: "border-[#EF4444] bg-[#EF4444]/10",
  IDLE_END: "border-[#EF4444] bg-[#EF4444]/10",
  LOG: "border-indigo-400 bg-indigo-50",
};

const EVENT_DOT_COLORS: Record<string, string> = {
  CHECK_IN: "bg-[#22C55E]",
  CHECK_OUT: "bg-gray-400",
  BREAK_START: "bg-[#F59E0B]",
  BREAK_END: "bg-[#F59E0B]",
  IDLE_START: "bg-[#EF4444]",
  IDLE_END: "bg-[#EF4444]",
  LOG: "bg-indigo-500",
};

const FILTER_TABS = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "CHECKED_IN" },
  { label: "Break", value: "ON_BREAK" },
  { label: "Idle", value: "IDLE" },
  { label: "Offline", value: "OFFLINE" },
];

const LOG_TYPES = [
  "General",
  "Meeting",
  "Development",
  "Review",
  "Support",
  "Admin",
  "Other",
];

// --------------- Helpers ---------------

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// --------------- Component ---------------

export default function AttendancePage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(
    null
  );
  const [detail, setDetail] = useState<MemberDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<"today" | "history" | "logs">(
    "today"
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [newLogDesc, setNewLogDesc] = useState("");
  const [newLogType, setNewLogType] = useState("General");
  const [logSubmitting, setLogSubmitting] = useState(false);

  // Reports tab state
  const [pageTab, setPageTab] = useState<"team" | "reports">("team");
  const [reports, setReports] = useState<ReportEntry[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportFrom, setReportFrom] = useState("");
  const [reportTo, setReportTo] = useState("");

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/attendance/team");
      if (res.ok) {
        const data = await res.json();
        setMembers(data.team || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
    const interval = setInterval(fetchMembers, 30000);
    return () => clearInterval(interval);
  }, [fetchMembers]);

  const fetchDetail = useCallback(
    async (memberId: string) => {
      setDetailLoading(true);
      try {
        const params = new URLSearchParams();
        if (dateFrom) params.set("from", dateFrom);
        if (dateTo) params.set("to", dateTo);
        const res = await fetch(
          `/api/attendance/team/${memberId}?${params}`
        );
        if (res.ok) {
          const data = await res.json();
          setDetail(data);
        }
      } catch {
        toast.error("Failed to load member details");
      } finally {
        setDetailLoading(false);
      }
    },
    [dateFrom, dateTo]
  );

  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const params = new URLSearchParams();
      if (reportFrom) params.set("from", reportFrom);
      if (reportTo) params.set("to", reportTo);
      const res = await fetch(`/api/attendance/reports?${params}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setReportsLoading(false);
    }
  }, [reportFrom, reportTo]);

  useEffect(() => {
    if (pageTab === "reports") {
      fetchReports();
    }
  }, [pageTab, fetchReports]);

  function openDetail(memberId: string) {
    setSelectedMemberId(memberId);
    setDetailTab("today");
    fetchDetail(memberId);
  }

  function closeDetail() {
    setSelectedMemberId(null);
    setDetail(null);
  }

  async function handleAddLog() {
    if (!newLogDesc.trim() || !selectedMemberId) return;
    setLogSubmitting(true);
    try {
      const res = await fetch(
        `/api/attendance/team/${selectedMemberId}/logs`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: newLogDesc,
            type: newLogType,
          }),
        }
      );
      if (res.ok) {
        toast.success("Work log added");
        setNewLogDesc("");
        setNewLogType("General");
        fetchDetail(selectedMemberId);
      } else {
        toast.error("Failed to add log");
      }
    } catch {
      toast.error("Failed to add log");
    } finally {
      setLogSubmitting(false);
    }
  }

  function handleDownloadCSV() {
    if (!detail?.history.length) return;
    const header =
      "Date,Check In,Check Out,Active (min),Break (min),Idle (min),Total (min)\n";
    const rows = detail.history
      .map(
        (d) =>
          `${d.date},${d.checkInAt || ""},${d.checkOutAt || ""},${d.activeMinutes},${d.breakMinutes},${d.idleMinutes},${d.totalMinutes}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${detail.member.name.replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadReportsCSV() {
    if (!reports.length) return;
    const header =
      "Date,Name,Email,Check In,Check Out,Location,Total (hrs),Active (hrs),Break (hrs),Idle (hrs)\n";
    const rows = reports
      .map(
        (r) =>
          `${r.date},"${r.userName}",${r.email},${r.checkIn},${r.checkOut || ""},${r.location},${r.totalHours},${r.activeHours},${r.breakHours},${r.idleHours}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance-reports.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = members.filter((m) => {
    if (filter !== "ALL" && m.currentStatus !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return m.name.toLowerCase().includes(q);
    }
    return true;
  });

  const statusCounts = members.reduce(
    (acc, m) => {
      acc[m.currentStatus] = (acc[m.currentStatus] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Team Attendance
          </h1>
          <p className="text-sm text-gray-500">
            Monitor your team&apos;s work sessions and activity in
            real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchMembers}>
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Page-level tabs: Team / Reports */}
      <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        <button
          onClick={() => setPageTab("team")}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            pageTab === "team"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Team Activity
        </button>
        <button
          onClick={() => setPageTab("reports")}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            pageTab === "reports"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <BarChart3 className="size-3.5" />
            Reports
          </span>
        </button>
      </div>

      {pageTab === "team" && (
        <>
          {/* Filter tabs and search */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
              {FILTER_TABS.map((tab) => {
                const count =
                  tab.value === "ALL"
                    ? members.length
                    : statusCounts[tab.value] || 0;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setFilter(tab.value)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      filter === tab.value
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                    <span className="ml-1.5 text-xs text-gray-400">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Team grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-8 animate-spin text-gray-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-gray-400">No team members found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((member) => (
                <button
                  key={member.id}
                  onClick={() => openDetail(member.id)}
                  className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left transition-all hover:border-indigo-200 hover:shadow-md"
                >
                  {/* Avatar */}
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt=""
                      className="size-10 shrink-0 rounded-full"
                    />
                  ) : (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                      {getInitials(member.name)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {member.name}
                      </p>
                      <span
                        className={`size-2 shrink-0 rounded-full ${STATUS_COLORS[member.currentStatus] || "bg-gray-400"}`}
                      />
                    </div>
                    {member.role && (
                      <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                        {member.role}
                      </span>
                    )}
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span
                        className={
                          STATUS_TEXT_COLORS[member.currentStatus] ||
                          "text-gray-400"
                        }
                      >
                        {STATUS_LABELS[member.currentStatus] || "Offline"}
                      </span>
                      {member.workLocation && (
                        <span>
                          {LOCATION_EMOJI[member.workLocation] || ""}{" "}
                          {member.workLocation}
                        </span>
                      )}
                      {member.checkInTime && (
                        <span className="flex items-center gap-0.5">
                          <Clock className="size-3" />
                          {formatTime(member.checkInTime)}
                        </span>
                      )}
                      {member.currentStatus !== "OFFLINE" &&
                        member.totalActiveMinutes !== undefined && (
                          <span className="flex items-center gap-0.5">
                            <Timer className="size-3" />
                            {formatMinutes(member.totalActiveMinutes)}
                          </span>
                        )}
                      {member.currentStatus === "OFFLINE" &&
                        member.lastCheckIn && (
                          <span className="flex items-center gap-0.5 text-gray-400">
                            <Calendar className="size-3" />
                            Last: {formatDate(member.lastCheckIn)}
                          </span>
                        )}
                    </div>
                  </div>

                  <ChevronRight className="size-4 shrink-0 text-gray-300 transition-colors group-hover:text-indigo-400" />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {pageTab === "reports" && (
        <div>
          {/* Date range and export */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Input
              type="date"
              value={reportFrom}
              onChange={(e) => setReportFrom(e.target.value)}
              className="w-40"
            />
            <span className="text-xs text-gray-400">to</span>
            <Input
              type="date"
              value={reportTo}
              onChange={(e) => setReportTo(e.target.value)}
              className="w-40"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={fetchReports}
            >
              <Search className="size-3.5" />
              Search
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadReportsCSV}
              disabled={!reports.length}
            >
              <Download className="size-3.5" />
              Export CSV
            </Button>
          </div>

          {reportsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-8 animate-spin text-gray-400" />
            </div>
          ) : reports.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-gray-400">
                No reports found. Select a date range and search.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-gray-500">
                    <th className="px-3 py-2.5 font-medium">Date</th>
                    <th className="px-3 py-2.5 font-medium">Name</th>
                    <th className="px-3 py-2.5 font-medium">
                      Location
                    </th>
                    <th className="px-3 py-2.5 font-medium">
                      Check In
                    </th>
                    <th className="px-3 py-2.5 font-medium">
                      Check Out
                    </th>
                    <th className="px-3 py-2.5 font-medium">
                      Total (hrs)
                    </th>
                    <th className="px-3 py-2.5 font-medium">
                      Active (hrs)
                    </th>
                    <th className="px-3 py-2.5 font-medium">
                      Break (hrs)
                    </th>
                    <th className="px-3 py-2.5 font-medium">
                      Idle (hrs)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="px-3 py-2 font-medium text-gray-700">
                        {r.date}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {r.userName}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {LOCATION_EMOJI[r.location] || ""} {r.location}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {formatTime(r.checkIn)}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {r.checkOut ? formatTime(r.checkOut) : "-"}
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-800">
                        {r.totalHours}
                      </td>
                      <td className="px-3 py-2 text-[#22C55E]">
                        {r.activeHours}
                      </td>
                      <td className="px-3 py-2 text-[#F59E0B]">
                        {r.breakHours}
                      </td>
                      <td className="px-3 py-2 text-[#EF4444]">
                        {r.idleHours}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Detail slide-over panel */}
      <Sheet
        open={!!selectedMemberId}
        onOpenChange={(open) => {
          if (!open) closeDetail();
        }}
      >
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>
              {detail?.member.name || "Team Member"}
            </SheetTitle>
            <SheetDescription>
              Attendance details and work logs
            </SheetDescription>
          </SheetHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-6 animate-spin text-gray-400" />
            </div>
          ) : detail ? (
            <div className="px-6 pb-6">
              {/* Stats cards */}
              <div className="mb-4 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-indigo-50 p-3 text-center">
                  <p className="text-xs text-gray-500">Avg Hours/Day</p>
                  <p className="text-lg font-bold text-indigo-700">
                    {detail.stats.avgHoursPerDay.toFixed(1)}
                  </p>
                </div>
                <div className="rounded-lg bg-green-50 p-3 text-center">
                  <p className="text-xs text-gray-500">Days Worked</p>
                  <p className="text-lg font-bold text-green-700">
                    {detail.stats.daysWorked}
                  </p>
                </div>
                <div className="rounded-lg bg-amber-50 p-3 text-center">
                  <p className="text-xs text-gray-500">On-Time Rate</p>
                  <p className="text-lg font-bold text-amber-700">
                    {detail.stats.onTimeRate}%
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1">
                {(["today", "history", "logs"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setDetailTab(tab)}
                    className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                      detailTab === tab
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Today tab - Timeline */}
              {detailTab === "today" && (
                <div className="space-y-0">
                  {detail.timeline.length === 0 ? (
                    <p className="py-8 text-center text-sm text-gray-400">
                      No events today.
                    </p>
                  ) : (
                    <div className="relative ml-4 border-l-2 border-gray-200 pl-6">
                      {detail.timeline.map((event) => (
                        <div
                          key={event.id}
                          className="relative mb-4 last:mb-0"
                        >
                          {/* Dot */}
                          <div
                            className={`absolute -left-[31px] top-1 size-3 rounded-full border-2 border-white ${
                              EVENT_DOT_COLORS[event.type] ||
                              "bg-gray-400"
                            }`}
                          />
                          {/* Card */}
                          <div
                            className={`rounded-lg border-l-2 p-3 ${
                              EVENT_COLORS[event.type] ||
                              "border-gray-300 bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-700">
                                {event.type.replace(/_/g, " ")}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatTime(event.timestamp)}
                              </span>
                            </div>
                            {event.description && (
                              <p className="mt-1 text-xs text-gray-600">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* History tab */}
              {detailTab === "history" && (
                <div>
                  {/* Date range picker */}
                  <div className="mb-4 flex items-center gap-2">
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-400">to</span>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (selectedMemberId)
                          fetchDetail(selectedMemberId);
                      }}
                    >
                      <Search className="size-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadCSV}
                      disabled={!detail.history.length}
                    >
                      <Download className="size-3" />
                      CSV
                    </Button>
                  </div>

                  {/* Summary table */}
                  {detail.history.length === 0 ? (
                    <p className="py-8 text-center text-sm text-gray-400">
                      No history data found.
                    </p>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b bg-gray-50 text-left text-gray-500">
                            <th className="px-3 py-2 font-medium">
                              Date
                            </th>
                            <th className="px-3 py-2 font-medium">
                              In
                            </th>
                            <th className="px-3 py-2 font-medium">
                              Out
                            </th>
                            <th className="px-3 py-2 font-medium">
                              Active
                            </th>
                            <th className="px-3 py-2 font-medium">
                              Break
                            </th>
                            <th className="px-3 py-2 font-medium">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.history.map((day) => (
                            <tr
                              key={day.date}
                              className="border-b border-gray-100 last:border-0"
                            >
                              <td className="px-3 py-2 font-medium text-gray-700">
                                {day.date}
                              </td>
                              <td className="px-3 py-2 text-gray-600">
                                {day.checkInAt
                                  ? formatTime(day.checkInAt)
                                  : "-"}
                              </td>
                              <td className="px-3 py-2 text-gray-600">
                                {day.checkOutAt
                                  ? formatTime(day.checkOutAt)
                                  : "-"}
                              </td>
                              <td className="px-3 py-2 text-[#22C55E]">
                                {formatMinutes(day.activeMinutes)}
                              </td>
                              <td className="px-3 py-2 text-[#F59E0B]">
                                {formatMinutes(day.breakMinutes)}
                              </td>
                              <td className="px-3 py-2 font-medium text-gray-800">
                                {formatMinutes(day.totalMinutes)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Logs tab */}
              {detailTab === "logs" && (
                <div>
                  {/* Add log form */}
                  <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="mb-2 text-xs font-medium text-gray-600">
                      Add Work Log
                    </p>
                    <Textarea
                      placeholder="What did you work on?"
                      value={newLogDesc}
                      onChange={(e) => setNewLogDesc(e.target.value)}
                      className="mb-2"
                    />
                    <div className="flex items-center gap-2">
                      <select
                        value={newLogType}
                        onChange={(e) => setNewLogType(e.target.value)}
                        className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                      >
                        {LOG_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleAddLog}
                        disabled={logSubmitting || !newLogDesc.trim()}
                      >
                        {logSubmitting ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <FileText className="size-3.5" />
                        )}
                        Add Log
                      </Button>
                    </div>
                  </div>

                  {/* Log entries */}
                  {detail.logs.length === 0 ? (
                    <p className="py-8 text-center text-sm text-gray-400">
                      No work logs yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {detail.logs.map((log) => (
                        <div
                          key={log.id}
                          className="rounded-lg border border-gray-200 bg-white p-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                              {log.type}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {formatTime(log.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-700">
                            {log.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
