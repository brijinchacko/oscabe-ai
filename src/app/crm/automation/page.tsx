"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Bot,
  Play,
  Search,
  ShieldCheck,
  Mail,
  MessageSquare,
  BarChart3,
  RefreshCw,
  Loader2,
  Clock,
  Users,
  Zap,
  ThumbsUp,
  Settings,
  Plus,
  X,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface IcpConfig {
  jobTitles: string[];
  industries: string[];
  companySizeMin: number;
  companySizeMax: number;
  locations: string[];
  dailyEmailLimit: number;
  followUpIntervalDays: number;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  content: string | null;
  createdAt: string;
}

interface Stats {
  prospectsToday: number;
  emailsToday: number;
  repliesToday: number;
  positiveToday: number;
}

// ---------------------------------------------------------------------------
// Schedule data
// ---------------------------------------------------------------------------

const SCHEDULE = [
  { time: "08:00", task: "discover", label: "Lead Discovery", days: "Monday" },
  { time: "08:30", task: "verify", label: "Email Verification", days: "Mon-Fri" },
  { time: "09:30", task: "outreach", label: "Outreach", days: "Mon-Fri" },
  { time: "14:00", task: "followup", label: "Follow-ups", days: "Mon-Fri" },
  { time: "15:00", task: "classify", label: "Reply Classification", days: "Mon-Fri" },
  { time: "17:00", task: "report", label: "Daily Report", days: "Mon-Fri" },
];

const TASK_BUTTONS = [
  { task: "discover", label: "Discover", icon: Search, color: "bg-blue-500 hover:bg-blue-600" },
  { task: "verify", label: "Verify", icon: ShieldCheck, color: "bg-emerald-500 hover:bg-emerald-600" },
  { task: "outreach", label: "Outreach", icon: Mail, color: "bg-violet-500 hover:bg-violet-600" },
  { task: "followup", label: "Follow-up", icon: RefreshCw, color: "bg-amber-500 hover:bg-amber-600" },
  { task: "classify", label: "Classify", icon: MessageSquare, color: "bg-rose-500 hover:bg-rose-600" },
  { task: "report", label: "Report", icon: BarChart3, color: "bg-cyan-500 hover:bg-cyan-600" },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AutomationPage() {
  const [config, setConfig] = useState<IcpConfig | null>(null);
  const [editingConfig, setEditingConfig] = useState(false);
  const [editConfig, setEditConfig] = useState<IcpConfig | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<Stats>({
    prospectsToday: 0,
    emailsToday: 0,
    repliesToday: 0,
    positiveToday: 0,
  });
  const [runningTask, setRunningTask] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newIndustry, setNewIndustry] = useState("");

  // Load config, activities, and stats
  const loadData = useCallback(async () => {
    try {
      const [configRes, activitiesRes] = await Promise.all([
        fetch("/api/automation/config"),
        fetch("/api/activities?type=AUTOMATION&pageSize=20"),
      ]);

      if (configRes.ok) {
        const data = await configRes.json();
        setConfig(data.config);
      }

      if (activitiesRes.ok) {
        const data = await activitiesRes.json();
        setActivities(Array.isArray(data) ? data : data.activities || []);
      }

      // Compute today stats from activities
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      // Also try to get the latest daily report
      const reportRes = await fetch("/api/activities?type=DAILY_REPORT&pageSize=1");
      if (reportRes.ok) {
        const reportData = await reportRes.json();
        const reports = Array.isArray(reportData) ? reportData : reportData.activities || [];
        if (reports.length > 0 && reports[0].metadata) {
          try {
            const meta = JSON.parse(reports[0].metadata);
            setStats({
              prospectsToday: meta.prospectsToday ?? meta.prospects ?? 0,
              emailsToday: meta.emailsSentToday ?? meta.emails ?? 0,
              repliesToday: meta.repliesToday ?? meta.replies ?? 0,
              positiveToday: meta.positiveToday ?? meta.positive ?? 0,
            });
          } catch {
            /* ignore parse error */
          }
        }
      }
    } catch {
      // Silently handle load errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Run a task
  const runTask = async (task: string) => {
    setRunningTask(task);
    try {
      const res = await fetch("/api/automation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${task} completed successfully`);
        loadData();
      } else {
        toast.error(data.error || `${task} failed`);
      }
    } catch {
      toast.error(`Failed to run ${task}`);
    } finally {
      setRunningTask(null);
    }
  };

  // Seed sequences
  const seedSequences = async () => {
    try {
      const res = await fetch("/api/sequences/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Sequences seeded");
      } else {
        toast.error(data.error || "Failed to seed sequences");
      }
    } catch {
      toast.error("Failed to seed sequences");
    }
  };

  // Save ICP config
  const saveConfig = async () => {
    if (!editConfig) return;
    try {
      const res = await fetch("/api/automation/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editConfig),
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setEditingConfig(false);
        toast.success("ICP configuration saved");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save config");
      }
    } catch {
      toast.error("Failed to save config");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-100">
            <Bot className="size-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Automation Engine
            </h1>
            <p className="text-sm text-gray-500">
              Automated lead discovery, outreach, and follow-up pipeline
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <span className="mr-1.5 inline-block size-1.5 rounded-full bg-green-500" />
            Running
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={seedSequences}
            className="text-xs"
          >
            <Zap className="mr-1 size-3" />
            Seed Sequences
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-2">
          {TASK_BUTTONS.map(({ task, label, icon: Icon, color }) => (
            <Button
              key={task}
              size="sm"
              disabled={runningTask !== null}
              onClick={() => runTask(task)}
              className={`text-xs text-white ${runningTask === task ? "opacity-70" : color}`}
            >
              {runningTask === task ? (
                <Loader2 className="mr-1 size-3 animate-spin" />
              ) : (
                <Icon className="mr-1 size-3" />
              )}
              {label}
            </Button>
          ))}
          <Button
            size="sm"
            disabled={runningTask !== null}
            onClick={() => runTask("all")}
            className={`text-xs text-white ${runningTask === "all" ? "opacity-70" : "bg-gray-800 hover:bg-gray-900"}`}
          >
            {runningTask === "all" ? (
              <Loader2 className="mr-1 size-3 animate-spin" />
            ) : (
              <Play className="mr-1 size-3" />
            )}
            Run All
          </Button>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Users className="size-3.5" />
            Prospects Today
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {stats.prospectsToday}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Mail className="size-3.5" />
            Emails Today
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {stats.emailsToday}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MessageSquare className="size-3.5" />
            Replies Today
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {stats.repliesToday}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ThumbsUp className="size-3.5" />
            Positive Responses
          </div>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {stats.positiveToday}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ICP Configuration */}
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              <Settings className="mr-1 inline size-3.5" />
              ICP Configuration
            </h2>
            {!editingConfig ? (
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => {
                  setEditConfig(config ? { ...config } : null);
                  setEditingConfig(true);
                }}
              >
                Edit
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => setEditingConfig(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="text-xs"
                  onClick={saveConfig}
                >
                  <Save className="mr-1 size-3" />
                  Save
                </Button>
              </div>
            )}
          </div>

          {!editingConfig && config ? (
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-medium text-gray-600">Job Titles</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {config.jobTitles.map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="text-[10px]"
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-600">Industries</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {config.industries.map((i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="text-[10px]"
                    >
                      {i}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="font-medium text-gray-600">Company Size</p>
                  <p className="text-gray-900">
                    {config.companySizeMin} - {config.companySizeMax}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">
                    Daily Email Limit
                  </p>
                  <p className="text-gray-900">{config.dailyEmailLimit}</p>
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-600">Locations</p>
                <p className="text-gray-900">
                  {config.locations.join(", ")}
                </p>
              </div>
            </div>
          ) : editConfig ? (
            <div className="space-y-3 text-xs">
              <div>
                <p className="mb-1 font-medium text-gray-600">Job Titles</p>
                <div className="flex flex-wrap gap-1 mb-1">
                  {editConfig.jobTitles.map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="text-[10px]"
                    >
                      {t}
                      <button
                        className="ml-1"
                        onClick={() =>
                          setEditConfig({
                            ...editConfig,
                            jobTitles: editConfig.jobTitles.filter(
                              (x) => x !== t
                            ),
                          })
                        }
                      >
                        <X className="size-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-1">
                  <Input
                    className="h-7 text-xs"
                    placeholder="Add job title..."
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        newJobTitle.trim()
                      ) {
                        setEditConfig({
                          ...editConfig,
                          jobTitles: [
                            ...editConfig.jobTitles,
                            newJobTitle.trim(),
                          ],
                        });
                        setNewJobTitle("");
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2"
                    onClick={() => {
                      if (newJobTitle.trim()) {
                        setEditConfig({
                          ...editConfig,
                          jobTitles: [
                            ...editConfig.jobTitles,
                            newJobTitle.trim(),
                          ],
                        });
                        setNewJobTitle("");
                      }
                    }}
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="mb-1 font-medium text-gray-600">Industries</p>
                <div className="flex flex-wrap gap-1 mb-1">
                  {editConfig.industries.map((i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="text-[10px]"
                    >
                      {i}
                      <button
                        className="ml-1"
                        onClick={() =>
                          setEditConfig({
                            ...editConfig,
                            industries: editConfig.industries.filter(
                              (x) => x !== i
                            ),
                          })
                        }
                      >
                        <X className="size-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-1">
                  <Input
                    className="h-7 text-xs"
                    placeholder="Add industry..."
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        newIndustry.trim()
                      ) {
                        setEditConfig({
                          ...editConfig,
                          industries: [
                            ...editConfig.industries,
                            newIndustry.trim(),
                          ],
                        });
                        setNewIndustry("");
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2"
                    onClick={() => {
                      if (newIndustry.trim()) {
                        setEditConfig({
                          ...editConfig,
                          industries: [
                            ...editConfig.industries,
                            newIndustry.trim(),
                          ],
                        });
                        setNewIndustry("");
                      }
                    }}
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="mb-1 font-medium text-gray-600">
                    Min Company Size
                  </p>
                  <Input
                    type="number"
                    className="h-7 text-xs"
                    value={editConfig.companySizeMin}
                    onChange={(e) =>
                      setEditConfig({
                        ...editConfig,
                        companySizeMin: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <p className="mb-1 font-medium text-gray-600">
                    Max Company Size
                  </p>
                  <Input
                    type="number"
                    className="h-7 text-xs"
                    value={editConfig.companySizeMax}
                    onChange={(e) =>
                      setEditConfig({
                        ...editConfig,
                        companySizeMax: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <p className="mb-1 font-medium text-gray-600">
                  Daily Email Limit
                </p>
                <Input
                  type="number"
                  className="h-7 text-xs"
                  value={editConfig.dailyEmailLimit}
                  onChange={(e) =>
                    setEditConfig({
                      ...editConfig,
                      dailyEmailLimit: parseInt(e.target.value) || 50,
                    })
                  }
                />
              </div>
            </div>
          ) : null}
        </Card>

        {/* Schedule Card */}
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            <Clock className="mr-1 inline size-3.5" />
            Daily Schedule (UK Time)
          </h2>
          <div className="space-y-2">
            {SCHEDULE.map((s) => (
              <div
                key={s.task}
                className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-medium text-gray-900">
                    {s.time}
                  </span>
                  <span className="text-xs text-gray-600">{s.label}</span>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {s.days}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity Log */}
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">
            Recent Automation Activity
          </h2>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs"
            onClick={loadData}
          >
            <RefreshCw className="mr-1 size-3" />
            Refresh
          </Button>
        </div>
        {activities.length === 0 ? (
          <p className="py-8 text-center text-xs text-gray-400">
            No automation activity yet. Run a task to get started.
          </p>
        ) : (
          <div className="space-y-2">
            {activities.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 rounded-md bg-gray-50 px-3 py-2"
              >
                <div
                  className={`mt-0.5 size-2 shrink-0 rounded-full ${
                    a.type === "DAILY_REPORT"
                      ? "bg-cyan-500"
                      : a.type === "AUTOMATION"
                        ? "bg-indigo-500"
                        : "bg-gray-400"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-900">
                    {a.title}
                  </p>
                  {a.content && (
                    <p className="mt-0.5 truncate text-[11px] text-gray-500">
                      {a.content}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-[10px] text-gray-400">
                  {new Date(a.createdAt).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
