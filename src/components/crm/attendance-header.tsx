"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
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
  Bell,
  Coffee,
  LogOut,
  LogIn,
  Loader2,
  Home,
  Building2,
  Globe,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface AttendanceSession {
  id: string;
  status: "CHECKED_IN" | "ON_BREAK" | "IDLE" | "CHECKED_OUT";
  location: "HOME" | "OFFICE" | "REMOTE";
  checkInAt: string;
  breakStartedAt?: string;
  note?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type?: string;
}

const STATUS_COLORS: Record<string, string> = {
  CHECKED_IN: "bg-[#22C55E]",
  ON_BREAK: "bg-[#F59E0B]",
  IDLE: "bg-[#EF4444]",
  CHECKED_OUT: "bg-gray-400",
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

export function AttendanceHeader() {
  const { data: sessionData } = useSession();
  const [attendance, setAttendance] = useState<AttendanceSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [elapsed, setElapsed] = useState("00:00:00");
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [checkInNote, setCheckInNote] = useState("");
  const [checkOutSummary, setCheckOutSummary] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

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

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=20");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
    fetchNotifications();
    const notifInterval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(notifInterval);
  }, [fetchAttendance, fetchNotifications]);

  // Timer
  useEffect(() => {
    if (!attendance?.checkInAt || attendance.status === "CHECKED_OUT") return;
    setElapsed(formatElapsed(attendance.checkInAt));
    const interval = setInterval(() => {
      setElapsed(formatElapsed(attendance.checkInAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [attendance?.checkInAt, attendance?.status]);

  // Close notification dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);

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

  async function markNotificationsRead() {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silently fail
    }
  }

  if (!sessionData?.user) return null;

  const isCheckedIn = attendance && attendance.status !== "CHECKED_OUT";
  const isOnBreak = attendance?.status === "ON_BREAK";

  return (
    <>
      <div className="sticky top-0 z-30 flex h-10 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 text-sm">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {loading ? (
            <Loader2 className="size-4 animate-spin text-gray-400" />
          ) : isCheckedIn ? (
            <>
              {/* Status dot */}
              <span
                className={`size-2.5 rounded-full ${STATUS_COLORS[attendance.status]}`}
              />
              {/* Timer */}
              <span className="font-mono text-sm font-medium text-gray-700">
                {elapsed}
              </span>
              {/* Location */}
              <span className="text-sm" title={attendance.location}>
                {LOCATION_EMOJI[attendance.location]} {attendance.location}
              </span>
              {/* Break button */}
              <Button
                variant={isOnBreak ? "destructive" : "outline"}
                size="xs"
                onClick={handleBreakToggle}
                disabled={actionLoading}
                className={isOnBreak ? "animate-pulse" : ""}
              >
                <Coffee className="size-3" />
                {isOnBreak ? "End Break" : "Start Break"}
              </Button>
              {/* Check Out button */}
              <Button
                variant="outline"
                size="xs"
                onClick={() => setCheckOutOpen(true)}
                disabled={actionLoading}
              >
                <LogOut className="size-3" />
                Check Out
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              size="xs"
              onClick={() => setCheckInOpen(true)}
            >
              <LogIn className="size-3" />
              Check In
            </Button>
          )}
        </div>

        {/* Right side - Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              if (!notifOpen && unreadCount > 0) markNotificationsRead();
            }}
            className="relative rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-1 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
                <span className="text-sm font-medium text-gray-900">
                  Notifications
                </span>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="rounded p-0.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="size-3.5" />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-sm text-gray-400">
                    No notifications
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`border-b border-gray-50 px-3 py-2 ${
                        n.read ? "bg-white" : "bg-indigo-50/50"
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-800">
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500">{n.message}</p>
                      <p className="mt-0.5 text-[10px] text-gray-400">
                        {new Date(n.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
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
              End your work session. Optionally add a summary of what you worked
              on.
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
