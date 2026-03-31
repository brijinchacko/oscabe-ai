"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface TimeSlot {
  time: string;
  endTime: string;
}

interface UserInfo {
  name: string;
  avatarUrl: string | null;
  firstName: string | null;
  lastName: string | null;
}

export default function PublicBookingPage() {
  const params = useParams();
  const userId = params.userId as string;

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date selection
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotDuration, setSlotDuration] = useState(30);

  // Slot selection
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Booking form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState<{
    meetingLink?: string;
    date: string;
    time: string;
  } | null>(null);

  // Generate next 14 days
  const dates: { date: string; label: string; dayName: string; dayNum: number }[] = [];
  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    dates.push({
      date: `${yyyy}-${mm}-${dd}`,
      label: d.toLocaleDateString("en-GB", { month: "short", day: "numeric" }),
      dayName: d.toLocaleDateString("en-GB", { weekday: "short" }),
      dayNum: d.getDay(),
    });
  }

  // Fetch user info
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/booking/user?userId=${userId}`);
        if (!res.ok) {
          setError("This booking page is not available.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setUserInfo(data);
      } catch {
        setError("Failed to load booking page.");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [userId]);

  // Fetch available slots when date changes
  useEffect(() => {
    if (!selectedDate) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    fetch(`/api/booking/available?userId=${userId}&date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => {
        setAvailableSlots(data.slots || []);
        setSlotDuration(data.duration || 30);
      })
      .catch(() => setAvailableSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate, userId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/booking/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          date: selectedDate,
          time: selectedSlot,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          company: formData.company || undefined,
          description: formData.description || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to book. Please try again.");
        setSubmitting(false);
        return;
      }

      const data = await res.json();
      setBooked({
        meetingLink: data.meetingLink,
        date: selectedDate,
        time: selectedSlot,
      });
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#02012B]">
        <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  if (error || !userInfo) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#02012B] px-4 text-center">
        <h1 className="text-xl font-bold text-white">Booking Unavailable</h1>
        <p className="mt-2 text-sm text-gray-400">
          {error || "This booking page is not available."}
        </p>
      </div>
    );
  }

  // Confirmation screen
  if (booked) {
    const dateObj = new Date(booked.date + "T00:00:00Z");
    const formattedDate = dateObj.toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#02012B] px-4">
        <div className="w-full max-w-md rounded-2xl bg-[#0a0a2e] p-8 text-center shadow-2xl border border-white/10">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-500/20">
            <svg className="size-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Booking Confirmed!</h2>
          <p className="mt-2 text-sm text-gray-400">
            Your meeting with {userInfo.name} has been scheduled.
          </p>
          <div className="mt-6 rounded-lg bg-white/5 p-4 text-left">
            <p className="text-sm text-gray-300">
              <span className="font-medium text-white">Date:</span> {formattedDate}
            </p>
            <p className="mt-1 text-sm text-gray-300">
              <span className="font-medium text-white">Time:</span> {booked.time} UTC
            </p>
            <p className="mt-1 text-sm text-gray-300">
              <span className="font-medium text-white">Duration:</span> {slotDuration} minutes
            </p>
          </div>
          {booked.meetingLink && (
            <a
              href={booked.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Join Teams Meeting
            </a>
          )}
          <p className="mt-4 text-xs text-gray-500">
            A confirmation email has been sent to your inbox.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#02012B] px-4 py-12">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0a0a2e] shadow-2xl border border-white/10">
        {/* Header */}
        <div className="border-b border-white/10 p-6 text-center">
          {userInfo.avatarUrl ? (
            <img
              src={userInfo.avatarUrl}
              alt={userInfo.name}
              className="mx-auto size-16 rounded-full object-cover"
            />
          ) : (
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-indigo-500 text-xl font-bold text-white">
              {userInfo.name?.[0] || "U"}
            </div>
          )}
          <h1 className="mt-3 text-lg font-bold text-white">{userInfo.name}</h1>
          <p className="text-sm text-gray-400">
            Book a {slotDuration}-minute meeting
          </p>
        </div>

        <div className="p-6">
          {/* Step 1: Select Date */}
          {!selectedSlot && (
            <>
              <h3 className="mb-3 text-sm font-semibold text-gray-300">
                Select a Date
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {dates.map((d) => (
                  <button
                    key={d.date}
                    onClick={() => setSelectedDate(d.date)}
                    className={`flex flex-col items-center rounded-lg p-2 text-xs transition-colors ${
                      selectedDate === d.date
                        ? "bg-indigo-600 text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="text-[10px] font-medium">{d.dayName}</span>
                    <span className="mt-0.5 text-sm font-bold">{d.label.split(" ")[1]}</span>
                    <span className="text-[10px]">{d.label.split(" ")[0]}</span>
                  </button>
                ))}
              </div>

              {/* Available Slots */}
              {selectedDate && (
                <div className="mt-6">
                  <h3 className="mb-3 text-sm font-semibold text-gray-300">
                    Available Times
                  </h3>
                  {slotsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="size-6 animate-spin rounded-full border-2 border-white/20 border-t-indigo-400" />
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="py-4 text-center text-sm text-gray-500">
                      No available slots on this date.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => setSelectedSlot(slot.time)}
                          className="rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-indigo-600 hover:text-white"
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Step 2: Booking Form */}
          {selectedSlot && (
            <div>
              <button
                onClick={() => setSelectedSlot(null)}
                className="mb-4 text-xs text-indigo-400 hover:text-indigo-300"
              >
                &larr; Back to time selection
              </button>
              <div className="mb-4 rounded-lg bg-white/5 p-3">
                <p className="text-sm text-gray-300">
                  <span className="font-medium text-white">
                    {new Date(selectedDate + "T00:00:00Z").toLocaleDateString("en-GB", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  {" at "}
                  <span className="font-medium text-white">{selectedSlot} UTC</span>
                  {" "}({slotDuration} min)
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-400">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="+44 ..."
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-400">
                      Company
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Company name"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="What would you like to discuss?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                >
                  {submitting ? "Booking..." : "Confirm Booking"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-4 text-center">
          <p className="text-[11px] text-gray-500">
            Powered by{" "}
            <a href="https://oscabe.com" className="text-indigo-400 hover:text-indigo-300">
              OSCABE
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
