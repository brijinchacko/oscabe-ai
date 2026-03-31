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
  Play,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface AttendanceSession {
  id: string;
  status: "CHECKED_IN" | "ON_BREAK" | "IDLE" | "CHECKED_OUT";
  location: "HOME" | "OFFICE" | "REMOTE";
  checkInAt: string;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  CHECKED_IN: { color: "text-green-600", bg: "bg-green-100", label: "Active" },
  ON_BREAK: { color: "text-yellow-600", bg: "bg-yellow-100", label: "On Break" },
  IDLE: { color: "text-red-600", bg: "bg-red-100", label: "Idle" },
};

const LOCATION_CONFIG: Record<string, { icon: typeof Home; label: string }> = {
  HOME: { icon: Home, label: "Home" },
  OFFICE: { icon: Building2, label: "Office" },
  REMOTE: { icon: Globe, label: "Remote" },
};

function formatElapsed(checkInAt: string): string {
  const diff = Math.max(0, Math.floor((Date.now() - new Date(checkInAt).getTime()) / 1000));
  const h = String(Math.floor(diff / 3600)).padStart(2, "0");
  const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
  const s = String(diff % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function AttendanceDashboardCard() {
  const [attendance, setAttendance] = useState<AttendanceSession | null>(null);
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

  useEffect(() => {
    if (!attendance?.checkInAt || attendance.status === "CHECKED_OUT") return;
    setElapsed(formatElapsed(attendance.checkInAt));
    const interval = setInterval(() => setElapsed(formatElapsed(attendance.checkInAt)), 1000);
    return () => clearInterval(interval);
  }, [attendance?.checkInAt, attendance?.status]);

  async function handleCheckIn(location: "HOME" | "OFFICE" | "REMOTE") {
    setActionLoading(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workLocation: location, note: checkInNote }),
      });
      if (res.ok) {
        toast.success("Checked in successfully!");
        setCheckInOpen(false);
        setCheckInNote("");
        await fetchAttendance();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to check in");
      }
    } catch {
      toast.error("Failed to check in");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleBreakToggle() {
    setActionLoading(true);
    const isOnBreak = attendance?.status === "ON_BREAK";
    try {
      const res = await fetch("/api/attendance/break", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isOnBreak ? "end" : "start" }),
      });
      if (res.ok) {
        toast.success(isOnBreak ? "Break ended" : "Break started");
        await fetchAttendance();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to toggle break");
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
      const res = await fetch("/api/attendance/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: checkOutSummary }),
      });
      if (res.ok) {
        toast.success("Checked out successfully!");
        setCheckOutOpen(false);
        setCheckOutSummary("");
        await fetchAttendance();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to check out");
      }
    } catch {
      toast.error("Failed to check out");
    } finally {
      setActionLoading(false);
    }
  }

  const isCheckedIn = attendance && attendance.status !== "CHECKED_OUT";
  const isOnBreak = attendance?.status === "ON_BREAK";
  const statusConf = attendance ? STATUS_CONFIG[attendance.status] : null;
  const locConf = attendance ? LOCATION_CONFIG[attendance.location] : null;

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
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
            {/* Timer + Status */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-4xl font-bold text-gray-900">{elapsed}</p>
                <div className="mt-2 flex items-center gap-3">
                  {statusConf && (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConf.bg} ${statusConf.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isOnBreak ? "bg-yellow-500 animate-pulse" : attendance?.status === "IDLE" ? "bg-red-500" : "bg-green-500"}`} />
                      {statusConf.label}
                    </span>
                  )}
                  {locConf && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <locConf.icon className="size-3.5" />
                      {locConf.label}
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBreakToggle}
                  disabled={actionLoading}
                  className={isOnBreak ? "border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100" : ""}
                >
                  {actionLoading ? <Loader2 className="size-4 animate-spin" /> : isOnBreak ? <Play className="size-4" /> : <Pause className="size-4" />}
                  <span className="ml-1.5">{isOnBreak ? "Resume" : "Break"}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCheckOutOpen(true)}
                  disabled={actionLoading}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="size-4" />
                  <span className="ml-1.5">Check Out</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Not checked in */
          <div className="flex flex-col items-center py-4">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
              <LogIn className="size-7 text-indigo-500" />
            </div>
            <p className="text-sm text-gray-500">You haven&apos;t checked in today</p>
            <Button
              className="mt-4 bg-[#4540DB] text-white hover:bg-[#4540DB]/90"
              onClick={() => setCheckInOpen(true)}
            >
              <Clock className="mr-2 size-4" />
              Check In Now
            </Button>
          </div>
        )}
      </div>

      {/* Check-In Dialog */}
      <Dialog open={checkInOpen} onOpenChange={setCheckInOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start Your Work Session</DialogTitle>
            <DialogDescription>Where are you working from today?</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 py-4">
            {([
              { loc: "HOME" as const, icon: Home, label: "Home", emoji: "\uD83C\uDFE0" },
              { loc: "OFFICE" as const, icon: Building2, label: "Office", emoji: "\uD83C\uDFE2" },
              { loc: "REMOTE" as const, icon: Globe, label: "Remote", emoji: "\uD83C\uDF10" },
            ]).map((item) => (
              <button
                key={item.loc}
                onClick={() => handleCheckIn(item.loc)}
                disabled={actionLoading}
                className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:border-[#4540DB] hover:bg-indigo-50 disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="size-8 animate-spin text-gray-400" />
                ) : (
                  <span className="text-2xl">{item.emoji}</span>
                )}
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Optional note (e.g., working on candidate outreach)"
            value={checkInNote}
            onChange={(e) => setCheckInNote(e.target.value)}
            className="mt-2"
            rows={2}
          />
        </DialogContent>
      </Dialog>

      {/* Check-Out Dialog */}
      <Dialog open={checkOutOpen} onOpenChange={setCheckOutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Check Out</DialogTitle>
            <DialogDescription>What did you accomplish today?</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Summary of today's work..."
            value={checkOutSummary}
            onChange={(e) => setCheckOutSummary(e.target.value)}
            className="mt-4"
            rows={4}
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCheckOutOpen(false)}>Cancel</Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleCheckOut}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <LogOut className="mr-2 size-4" />}
              Check Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
