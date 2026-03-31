"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Coffee,
  LogOut,
  LogIn,
  Loader2,
  Home,
  Building2,
  Globe,
  Clock,
  Pause,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface AttendanceSession {
  id: string;
  status: "CHECKED_IN" | "ON_BREAK" | "IDLE" | "CHECKED_OUT";
  location: "HOME" | "OFFICE" | "REMOTE";
  checkInAt: string;
  breakStartedAt?: string;
}

interface TodayStats {
  activeMinutes: number;
  breakMinutes: number;
  idleMinutes: number;
}

const STATUS_COLORS: Record<string, string> = {
  CHECKED_IN: "bg-[#22C55E]",
  ON_BREAK: "bg-[#F59E0B]",
  IDLE: "bg-[#EF4444]",
  CHECKED_OUT: "bg-gray-400",
};

const STATUS_LABELS: Record<string, string> = {
  CHECKED_IN: "Active",
  ON_BREAK: "On Break",
  IDLE: "Idle",
  CHECKED_OUT: "Offline",
};

const LOCATION_EMOJI: Record<string, string> = {
  HOME: "\uD83C\uDFE0",
  OFFICE: "\uD83C\uDFE2",
  REMOTE: "\uD83C\uDF10",
};

function formatElapsed(checkInAt: string): string {
  const diff = Math.max(0, Math.floor((Date.now() - new Date(checkInAt).getTime()) / 1000));
  const h = String(Math.floor(diff / 3600)).padStart(2, "0");
  const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
  const s = String(diff % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function AttendanceDashboardCard() {
  const [attendance, setAttendance] = useState<AttendanceSession | null>(null);
  const [stats, setStats] = useState<TodayStats>({ activeMinutes: 0, breakMinutes: 0, idleMinutes: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [elapsed, setElapsed] = useState("00:00:00");
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [checkInNote, setCheckInNote] = useState("");
  const [checkOutSummary, setCheckOutSummary] = useState("");

  const fetchAttendance = useCallback(async () => {
    try {
      const res = await fetch("/api/attendance");
      if (res.ok) {
        const data = await res.json();
        setAttendance(data.session || null);
        if (data.todayStats) setStats(data.todayStats);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Timer
  useEffect(() => {
    if (!attendance?.checkInAt || attendance.status === "CHECKED_OUT") return;
    setElapsed(formatElapsed(attendance.checkInAt));
    const interval = setInterval(() => {
      setElapsed(formatElapsed(attendance.checkInAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [attendance?.checkInAt, attendance?.status]);

  async function handleCheckIn(location: "HOME" | "OFFICE" | "REMOTE") {
    setActionLoading(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check-in", location, note: checkInNote }),
      });
      if (res.ok) {
        toast.success("Checked in successfully");
        setCheckInOpen(false);
        setCheckInNote("");
        await fetchAttendance();
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to check in");
      }
    } catch {
      toast.error("Failed to check in");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleBreakToggle() {
    setActionLoading(true);
    const action = attendance?.status === "ON_BREAK" ? "end-break" : "start-break";
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        toast.success(action === "start-break" ? "Break started" : "Break ended");
        await fetchAttendance();
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to toggle break");
      }
    } catch {
      toast.error("Failed to toggle break");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCheckOut() {
    setActionLoading(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check-out", summary: checkOutSummary }),
      });
      if (res.ok) {
        toast.success("Checked out successfully");
        setCheckOutOpen(false);
        setCheckOutSummary("");
        await fetchAttendance();
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to check out");
      }
    } catch {
      toast.error("Failed to check out");
    } finally {
      setActionLoading(false);
    }
  }

  const isCheckedIn = attendance && attendance.status !== "CHECKED_OUT";
  const isOnBreak = attendance?.status === "ON_BREAK";

  return (
    <>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500">
          <Clock className="size-4" />
          Work Session
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-gray-400" />
          </div>
        ) : isCheckedIn ? (
          <div>
            {/* Status row */}
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`size-3 rounded-full ${STATUS_COLORS[attendance.status]} ${
                  isOnBreak ? "animate-pulse" : ""
                }`}
              />
              <span className="text-sm font-medium text-gray-600">
                {STATUS_LABELS[attendance.status]}
              </span>
              <span className="text-sm text-gray-400">
                {LOCATION_EMOJI[attendance.location]} {attendance.location}
              </span>
            </div>

            {/* Large timer */}
            <p className="mb-4 font-mono text-3xl font-bold text-gray-900">
              {elapsed}
            </p>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                variant={isOnBreak ? "destructive" : "outline"}
                size="sm"
                onClick={handleBreakToggle}
                disabled={actionLoading}
                className={isOnBreak ? "animate-pulse" : ""}
              >
                {actionLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Coffee className="size-3.5" />
                )}
                {isOnBreak ? "End Break" : "Start Break"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCheckOutOpen(true)}
                disabled={actionLoading}
              >
                <LogOut className="size-3.5" />
                Check Out
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4">
            <p className="mb-3 text-sm text-gray-500">
              You haven&apos;t checked in today
            </p>
            <Button
              variant="default"
              size="lg"
              onClick={() => setCheckInOpen(true)}
            >
              <LogIn className="size-4" />
              Check In Now
            </Button>
          </div>
        )}

        {/* Today's stats */}
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
              <Clock className="size-3 text-[#22C55E]" />
              Active
            </div>
            <p className="mt-0.5 text-sm font-semibold text-gray-800">
              {formatMinutes(stats.activeMinutes)}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
              <Pause className="size-3 text-[#F59E0B]" />
              Break
            </div>
            <p className="mt-0.5 text-sm font-semibold text-gray-800">
              {formatMinutes(stats.breakMinutes)}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
              <AlertTriangle className="size-3 text-[#EF4444]" />
              Idle
            </div>
            <p className="mt-0.5 text-sm font-semibold text-gray-800">
              {formatMinutes(stats.idleMinutes)}
            </p>
          </div>
        </div>
      </div>

      {/* Check In Dialog */}
      <Dialog open={checkInOpen} onOpenChange={setCheckInOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Check In</DialogTitle>
            <DialogDescription>
              Select your work location and start your session.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleCheckIn("HOME")}
              disabled={actionLoading}
              className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
            >
              <Home className="size-6 text-indigo-600" />
              <span className="text-sm font-medium">Home</span>
            </button>
            <button
              onClick={() => handleCheckIn("OFFICE")}
              disabled={actionLoading}
              className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
            >
              <Building2 className="size-6 text-indigo-600" />
              <span className="text-sm font-medium">Office</span>
            </button>
            <button
              onClick={() => handleCheckIn("REMOTE")}
              disabled={actionLoading}
              className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
            >
              <Globe className="size-6 text-indigo-600" />
              <span className="text-sm font-medium">Remote</span>
            </button>
          </div>
          <Textarea
            placeholder="Optional note (e.g., working on project X)..."
            value={checkInNote}
            onChange={(e) => setCheckInNote(e.target.value)}
            className="mt-2"
          />
          {actionLoading && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="size-5 animate-spin text-indigo-500" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Check Out Dialog */}
      <Dialog open={checkOutOpen} onOpenChange={setCheckOutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Check Out</DialogTitle>
            <DialogDescription>
              End your work session. Optionally add a summary.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="What did you work on today?"
            value={checkOutSummary}
            onChange={(e) => setCheckOutSummary(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCheckOutOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCheckOut}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <LogOut className="size-3.5" />
              )}
              Check Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
