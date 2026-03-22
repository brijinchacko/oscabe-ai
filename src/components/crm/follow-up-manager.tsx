"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Phone,
  Mail,
  Users,
  Linkedin,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Bell,
  Loader2,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FollowUp {
  id: string;
  clientId: string;
  contactId: string | null;
  title: string;
  description: string | null;
  channel: string;
  priority: string;
  status: string;
  dueDate: string;
  dueTime: string | null;
  completedAt: string | null;
  completedNote: string | null;
  outcome: string | null;
  reminderAt: string | null;
  reminderSent: boolean;
  createdAt: string;
  client?: { id: string; companyName: string };
}

interface Stats {
  total: number;
  pending: number;
  overdue: number;
  completedThisWeek: number;
  todayCount: number;
}

const CHANNEL_CONFIG: Record<string, { icon: LucideIcon; label: string; color: string }> = {
  CALL: { icon: Phone, label: "Call", color: "#22C55E" },
  EMAIL: { icon: Mail, label: "Email", color: "#4540DB" },
  MEETING: { icon: Users, label: "Meeting", color: "#8B5CF6" },
  LINKEDIN: { icon: Linkedin, label: "LinkedIn", color: "#0A66C2" },
  WHATSAPP: { icon: MessageCircle, label: "WhatsApp", color: "#25D366" },
  OTHER: { icon: MoreHorizontal, label: "Other", color: "#6B7280" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  LOW: { label: "Low", color: "text-gray-600", bg: "bg-gray-100" },
  MEDIUM: { label: "Medium", color: "text-blue-700", bg: "bg-blue-50" },
  HIGH: { label: "High", color: "text-orange-700", bg: "bg-orange-50" },
  URGENT: { label: "Urgent", color: "text-red-700", bg: "bg-red-50" },
};

function isOverdue(dueDate: string) {
  return new Date(dueDate) < new Date() ;
}

function isToday(dueDate: string) {
  const d = new Date(dueDate);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function formatDueDate(dueDate: string, dueTime: string | null) {
  const d = new Date(dueDate);
  const dateStr = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  if (isToday(dueDate)) return `Today${dueTime ? ` at ${dueTime}` : ""}`;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d.getFullYear() === tomorrow.getFullYear() && d.getMonth() === tomorrow.getMonth() && d.getDate() === tomorrow.getDate()) {
    return `Tomorrow${dueTime ? ` at ${dueTime}` : ""}`;
  }
  return `${dateStr}${dueTime ? ` at ${dueTime}` : ""}`;
}

export function FollowUpManager({ clientId }: { clientId: string }) {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, overdue: 0, completedThisWeek: 0, todayCount: 0 });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "overdue" | "completed">("pending");
  const [completeDialogId, setCompleteDialogId] = useState<string | null>(null);
  const [completedNote, setCompletedNote] = useState("");
  const [outcome, setOutcome] = useState("");
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    channel: "CALL",
    priority: "MEDIUM",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "09:00",
    reminderBefore: "30",
  });

  const fetchFollowUps = useCallback(async () => {
    try {
      const params = new URLSearchParams({ clientId });
      if (filter === "overdue") params.set("overdue", "true");
      if (filter !== "all") params.set("status", filter === "completed" ? "COMPLETED" : "PENDING");
      const res = await fetch(`/api/followups?${params}`);
      if (res.ok) {
        const data = await res.json();
        setFollowUps(data.followUps);
        setStats(data.stats);
      }
    } catch {
      toast.error("Failed to load follow-ups");
    } finally {
      setLoading(false);
    }
  }, [clientId, filter]);

  useEffect(() => { fetchFollowUps(); }, [fetchFollowUps]);

  async function handleCreate() {
    setSaving(true);
    try {
      // Calculate reminder time
      let reminderAt: string | undefined;
      if (form.reminderBefore && form.reminderBefore !== "none") {
        const due = new Date(`${form.dueDate}T${form.dueTime || "09:00"}`);
        due.setMinutes(due.getMinutes() - parseInt(form.reminderBefore));
        reminderAt = due.toISOString();
      }

      const res = await fetch("/api/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          title: form.title,
          description: form.description || undefined,
          channel: form.channel,
          priority: form.priority,
          dueDate: form.dueDate,
          dueTime: form.dueTime || undefined,
          reminderAt,
        }),
      });

      if (res.ok) {
        toast.success("Follow-up scheduled");
        setDialogOpen(false);
        setForm({ title: "", description: "", channel: "CALL", priority: "MEDIUM", dueDate: new Date().toISOString().split("T")[0], dueTime: "09:00", reminderBefore: "30" });
        fetchFollowUps();
      } else {
        toast.error("Failed to create follow-up");
      }
    } catch {
      toast.error("Error scheduling follow-up");
    } finally {
      setSaving(false);
    }
  }

  async function handleComplete(id: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/followups/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED", completedNote: completedNote || undefined, outcome: outcome || undefined }),
      });
      if (res.ok) {
        toast.success("Follow-up completed");
        setCompleteDialogId(null);
        setCompletedNote("");
        setOutcome("");
        fetchFollowUps();
      }
    } catch {
      toast.error("Error completing follow-up");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/followups/${id}`, { method: "DELETE" });
      toast.success("Follow-up deleted");
      fetchFollowUps();
    } catch {
      toast.error("Error deleting follow-up");
    }
  }

  async function handleSnooze(id: string, days: number) {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    try {
      await fetch(`/api/followups/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dueDate: newDate.toISOString() }),
      });
      toast.success(`Snoozed for ${days} day${days > 1 ? "s" : ""}`);
      fetchFollowUps();
    } catch {
      toast.error("Error snoozing follow-up");
    }
  }

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Due Today", value: stats.todayCount, icon: Calendar, color: "#4540DB" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "#F59E0B" },
          { label: "Overdue", value: stats.overdue, icon: AlertTriangle, color: "#EF4444" },
          { label: "Done This Week", value: stats.completedThisWeek, icon: CheckCircle, color: "#22C55E" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-gray-200 bg-white p-3 text-center">
            <s.icon className="mx-auto h-4 w-4" style={{ color: s.color }} />
            <p className="mt-1 text-lg font-bold text-gray-900">{s.value}</p>
            <p className="text-[10px] font-medium text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {(["pending", "overdue", "completed", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-[#4540DB] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={<Button size="sm" className="bg-[#4540DB] hover:bg-[#4540DB]/90 text-white" />}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Schedule Follow-up
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Follow-up</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  className="mt-1"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Follow up on proposal"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Channel</Label>
                  <Select value={form.channel} onValueChange={(v) => setForm((p) => ({ ...p, channel: v ?? "CALL" }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CHANNEL_CONFIG).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>
                          <span className="flex items-center gap-2">
                            <cfg.icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
                            {cfg.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm((p) => ({ ...p, priority: v ?? "MEDIUM" }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    className="mt-1"
                    value={form.dueDate}
                    onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input
                    type="time"
                    className="mt-1"
                    value={form.dueTime}
                    onChange={(e) => setForm((p) => ({ ...p, dueTime: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label>Reminder</Label>
                <Select value={form.reminderBefore} onValueChange={(v) => setForm((p) => ({ ...p, reminderBefore: v ?? "30" }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No reminder</SelectItem>
                    <SelectItem value="15">15 minutes before</SelectItem>
                    <SelectItem value="30">30 minutes before</SelectItem>
                    <SelectItem value="60">1 hour before</SelectItem>
                    <SelectItem value="1440">1 day before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Textarea
                  className="mt-1"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Any context or talking points..."
                  rows={3}
                />
              </div>
              <Button
                className="w-full bg-[#4540DB] hover:bg-[#4540DB]/90 text-white"
                onClick={handleCreate}
                disabled={!form.title || saving}
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}
                Schedule Follow-up
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Follow-up list */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[#4540DB]" />
        </div>
      ) : followUps.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-8 text-center">
          <Bell className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">
            {filter === "pending" ? "No pending follow-ups" : filter === "overdue" ? "No overdue follow-ups" : "No follow-ups found"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {followUps.map((fu) => {
            const channelCfg = CHANNEL_CONFIG[fu.channel] || CHANNEL_CONFIG.OTHER;
            const priorityCfg = PRIORITY_CONFIG[fu.priority] || PRIORITY_CONFIG.MEDIUM;
            const overdue = fu.status === "PENDING" && isOverdue(fu.dueDate);
            const today = isToday(fu.dueDate);
            const ChannelIcon = channelCfg.icon;

            return (
              <div
                key={fu.id}
                className={`group rounded-lg border p-3 transition-all hover:shadow-sm ${
                  fu.status === "COMPLETED"
                    ? "border-green-200 bg-green-50/50"
                    : overdue
                    ? "border-red-200 bg-red-50/50"
                    : today
                    ? "border-blue-200 bg-blue-50/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Channel icon */}
                  <div
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${channelCfg.color}15` }}
                  >
                    <ChannelIcon className="h-4 w-4" style={{ color: channelCfg.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${fu.status === "COMPLETED" ? "text-gray-500 line-through" : "text-gray-900"}`}>
                        {fu.title}
                      </p>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityCfg.bg} ${priorityCfg.color}`}>
                        {priorityCfg.label}
                      </span>
                      {overdue && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          Overdue
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDueDate(fu.dueDate, fu.dueTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <ChannelIcon className="h-3 w-3" />
                        {channelCfg.label}
                      </span>
                      {fu.reminderAt && (
                        <span className="flex items-center gap-1">
                          <Bell className="h-3 w-3" />
                          Reminder set
                        </span>
                      )}
                    </div>

                    {fu.description && (
                      <p className="mt-1.5 text-xs text-gray-500 line-clamp-2">{fu.description}</p>
                    )}

                    {fu.completedNote && (
                      <p className="mt-1.5 text-xs text-green-700">Outcome: {fu.completedNote}</p>
                    )}
                  </div>

                  {/* Actions */}
                  {fu.status === "PENDING" && (
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => { setCompleteDialogId(fu.id); setCompletedNote(""); setOutcome(""); }}
                        className="rounded-md p-1.5 text-green-600 hover:bg-green-50"
                        title="Complete"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleSnooze(fu.id, 1)}
                        className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50"
                        title="Snooze 1 day"
                      >
                        <Clock className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(fu.id)}
                        className="rounded-md p-1.5 text-red-500 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Complete dialog */}
      <Dialog open={!!completeDialogId} onOpenChange={(open) => { if (!open) setCompleteDialogId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Complete Follow-up</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <Label>Outcome</Label>
              <Select value={outcome} onValueChange={(v) => setOutcome(v ?? "")}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POSITIVE">Positive, interested</SelectItem>
                  <SelectItem value="NEUTRAL">Neutral, needs follow-up</SelectItem>
                  <SelectItem value="NEGATIVE">Not interested</SelectItem>
                  <SelectItem value="NO_ANSWER">No answer</SelectItem>
                  <SelectItem value="MEETING_BOOKED">Meeting booked</SelectItem>
                  <SelectItem value="DEAL_PROGRESSED">Deal progressed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                className="mt-1"
                value={completedNote}
                onChange={(e) => setCompletedNote(e.target.value)}
                placeholder="What happened? Key takeaways..."
                rows={3}
              />
            </div>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => completeDialogId && handleComplete(completeDialogId)}
              disabled={saving}
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Mark Complete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
