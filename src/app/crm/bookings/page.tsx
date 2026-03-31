"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  CalendarCheck,
  Clock,
  Video,
  Mail,
  Phone,
  Building2,
  Copy,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface Booking {
  id: string;
  bookerName: string;
  bookerEmail: string;
  bookerPhone: string | null;
  bookerCompany: string | null;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  meetingLink: string | null;
  notes: string | null;
  createdAt: string;
}

type ViewMode = "upcoming" | "past";

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  NO_SHOW: "bg-amber-100 text-amber-700",
};

export default function BookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("upcoming");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Week view state
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1); // Monday
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);

      const now = new Date();
      if (view === "upcoming") {
        params.set("from", now.toISOString());
      } else {
        params.set("to", now.toISOString());
      }

      const res = await fetch(`/api/booking?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBookings(data);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [view, search]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  async function updateStatus(id: string, status: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/booking/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Booking marked as ${status.toLowerCase()}`);
      fetchBookings();
      if (selected?.id === id) {
        setSelected((prev) => prev ? { ...prev, status } : null);
      }
    } catch {
      toast.error("Failed to update booking");
    } finally {
      setActionLoading(null);
    }
  }

  async function cancelBooking(id: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/booking/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Booking cancelled");
      fetchBookings();
      setSelected(null);
    } catch {
      toast.error("Failed to cancel booking");
    } finally {
      setActionLoading(null);
    }
  }

  function copyBookingLink() {
    if (!session?.user?.id) return;
    const url = `${window.location.origin}/book/${session.user.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Booking link copied!");
  }

  // Week calendar
  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    weekDays.push(d);
  }

  function prevWeek() {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }

  function nextWeek() {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }

  // Get bookings for a specific day in the week view
  function getBookingsForDay(day: Date): Booking[] {
    const dayStr = day.toISOString().split("T")[0];
    return bookings.filter((b) => {
      const bDate = new Date(b.startTime).toISOString().split("T")[0];
      return bDate === dayStr && b.status !== "CANCELLED";
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Bookings
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your meeting bookings and availability.
          </p>
        </div>
        <Button onClick={copyBookingLink}>
          <Copy className="size-4" />
          Share Booking Link
        </Button>
      </div>

      {/* Week Calendar View */}
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Week View</h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" onClick={prevWeek}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-xs font-medium text-gray-600">
              {weekStart.toLocaleDateString("en-GB", { month: "short", day: "numeric" })} -{" "}
              {weekDays[6]?.toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <Button variant="ghost" size="icon-sm" onClick={nextWeek}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => {
            const isToday = day.toDateString() === new Date().toDateString();
            const dayBookings = getBookingsForDay(day);
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[80px] rounded-lg border p-2 ${
                  isToday ? "border-indigo-300 bg-indigo-50" : "border-gray-100 bg-gray-50"
                }`}
              >
                <p className={`text-[10px] font-semibold ${isToday ? "text-indigo-600" : "text-gray-500"}`}>
                  {day.toLocaleDateString("en-GB", { weekday: "short" })}
                </p>
                <p className={`text-sm font-bold ${isToday ? "text-indigo-700" : "text-gray-900"}`}>
                  {day.getDate()}
                </p>
                {dayBookings.slice(0, 3).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelected(b)}
                    className="mt-1 w-full truncate rounded bg-indigo-100 px-1 py-0.5 text-left text-[10px] font-medium text-indigo-700 hover:bg-indigo-200"
                  >
                    {new Date(b.startTime).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    {b.bookerName.split(" ")[0]}
                  </button>
                ))}
                {dayBookings.length > 3 && (
                  <p className="mt-0.5 text-[10px] text-gray-400">
                    +{dayBookings.length - 3} more
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-1">
          <button
            onClick={() => setView("upcoming")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "upcoming"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setView("past")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "past"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Past
          </button>
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-8 text-xs"
          />
        </div>
      </div>

      {/* Bookings List + Detail Panel */}
      <div className="flex gap-4">
        {/* List */}
        <div className={`flex-1 space-y-2 ${selected ? "hidden sm:block" : ""}`}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-gray-400" />
            </div>
          ) : bookings.length === 0 ? (
            <Card className="py-12 text-center">
              <CalendarCheck className="mx-auto size-8 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">No bookings found</p>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card
                key={booking.id}
                className={`cursor-pointer p-4 transition-colors hover:border-indigo-200 ${
                  selected?.id === booking.id ? "border-indigo-300 bg-indigo-50" : ""
                }`}
                onClick={() => setSelected(booking)}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {booking.bookerName}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={STATUS_STYLES[booking.status] || "bg-gray-100 text-gray-600"}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                    {booking.bookerCompany && (
                      <p className="mt-0.5 text-xs text-gray-500">
                        {booking.bookerCompany}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarCheck className="size-3" />
                        {new Date(booking.startTime).toLocaleDateString("en-GB", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(booking.startTime).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>{booking.duration} min</span>
                    </div>
                  </div>
                  {booking.meetingLink && (
                    <Video className="size-4 shrink-0 text-indigo-500" />
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <Card className="w-full sm:w-96 shrink-0 p-5">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">
                Booking Details
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Booker info */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-900">
                  {selected.bookerName}
                </p>
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-xs text-gray-600">
                    <Mail className="size-3" />
                    {selected.bookerEmail}
                  </p>
                  {selected.bookerPhone && (
                    <p className="flex items-center gap-2 text-xs text-gray-600">
                      <Phone className="size-3" />
                      {selected.bookerPhone}
                    </p>
                  )}
                  {selected.bookerCompany && (
                    <p className="flex items-center gap-2 text-xs text-gray-600">
                      <Building2 className="size-3" />
                      {selected.bookerCompany}
                    </p>
                  )}
                </div>
              </div>

              {/* Meeting details */}
              <div className="rounded-lg bg-gray-50 p-3 space-y-1">
                <p className="text-xs text-gray-600">
                  <span className="font-medium text-gray-900">Date:</span>{" "}
                  {new Date(selected.startTime).toLocaleDateString("en-GB", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-xs text-gray-600">
                  <span className="font-medium text-gray-900">Time:</span>{" "}
                  {new Date(selected.startTime).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {new Date(selected.endTime).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-xs text-gray-600">
                  <span className="font-medium text-gray-900">Duration:</span>{" "}
                  {selected.duration} minutes
                </p>
                <Badge
                  variant="secondary"
                  className={`mt-1 ${STATUS_STYLES[selected.status] || "bg-gray-100 text-gray-600"}`}
                >
                  {selected.status}
                </Badge>
              </div>

              {/* Meeting link */}
              {selected.meetingLink && (
                <a
                  href={selected.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                >
                  <Video className="size-3.5" />
                  Join Teams Meeting
                  <ExternalLink className="ml-auto size-3" />
                </a>
              )}

              {/* Notes */}
              {selected.description && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                  <p className="text-xs text-gray-700">{selected.description}</p>
                </div>
              )}

              {/* Actions */}
              {selected.status === "CONFIRMED" && (
                <div className="flex flex-wrap gap-2 border-t pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(selected.id, "COMPLETED")}
                    disabled={actionLoading === selected.id}
                  >
                    {actionLoading === selected.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-3.5" />
                    )}
                    Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(selected.id, "NO_SHOW")}
                    disabled={actionLoading === selected.id}
                  >
                    <AlertCircle className="size-3.5" />
                    No-Show
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => cancelBooking(selected.id)}
                    disabled={actionLoading === selected.id}
                  >
                    <XCircle className="size-3.5" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
