import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCalendarEvents } from "@/lib/microsoft";

// GET: Public endpoint - returns available time slots for a user on a given date
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const date = searchParams.get("date"); // YYYY-MM-DD

  if (!userId || !date) {
    return NextResponse.json(
      { error: "userId and date are required" },
      { status: 400 }
    );
  }

  // Validate date format
  const dateObj = new Date(date + "T00:00:00Z");
  if (isNaN(dateObj.getTime())) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  // Don't allow booking in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dateObj < today) {
    return NextResponse.json({ slots: [] });
  }

  const dayOfWeek = dateObj.getUTCDay(); // 0=Sun, 1=Mon...6=Sat

  // 1. Get user's BookingSlot config for that day
  const config = await prisma.bookingSlot.findFirst({
    where: {
      userId,
      dayOfWeek,
      isActive: true,
    },
  });

  if (!config) {
    return NextResponse.json({ slots: [] });
  }

  // 2. Get existing calendar events for that day via Microsoft Graph
  const startOfDay = `${date}T00:00:00.000Z`;
  const endOfDay = `${date}T23:59:59.999Z`;

  let calendarEvents: { start: { dateTime: string }; end: { dateTime: string } }[] = [];
  try {
    const result = await getCalendarEvents(userId, startOfDay, endOfDay);
    calendarEvents = result.value || [];
  } catch {
    // If calendar fetch fails, continue without it
  }

  // 3. Get existing bookings for that day
  const existingBookings = await prisma.booking.findMany({
    where: {
      userId,
      status: { not: "CANCELLED" },
      startTime: { gte: new Date(startOfDay) },
      endTime: { lte: new Date(endOfDay) },
    },
  });

  // 4. Generate time slots based on config
  const [startHour, startMin] = config.startTime.split(":").map(Number);
  const [endHour, endMin] = config.endTime.split(":").map(Number);
  const slotDuration = config.slotDuration;
  const bufferTime = config.bufferTime;
  const step = slotDuration + bufferTime;

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  const allSlots: { time: string; endTime: string }[] = [];
  for (let m = startMinutes; m + slotDuration <= endMinutes; m += step) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const slotEndM = m + slotDuration;
    const eh = Math.floor(slotEndM / 60);
    const emin = slotEndM % 60;
    allSlots.push({
      time: `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
      endTime: `${String(eh).padStart(2, "0")}:${String(emin).padStart(2, "0")}`,
    });
  }

  // 5. Filter out slots that overlap with calendar events or existing bookings
  const now = new Date();
  const availableSlots = allSlots.filter((slot) => {
    const slotStart = new Date(`${date}T${slot.time}:00.000Z`);
    const slotEnd = new Date(`${date}T${slot.endTime}:00.000Z`);

    // Don't show past slots
    if (slotStart <= now) return false;

    // Check overlap with calendar events
    for (const event of calendarEvents) {
      const eventStart = new Date(event.start.dateTime);
      const eventEnd = new Date(event.end.dateTime);
      if (slotStart < eventEnd && slotEnd > eventStart) {
        return false;
      }
    }

    // Check overlap with existing bookings
    for (const booking of existingBookings) {
      const bStart = new Date(booking.startTime);
      const bEnd = new Date(booking.endTime);
      if (slotStart < bEnd && slotEnd > bStart) {
        return false;
      }
    }

    return true;
  });

  return NextResponse.json({ slots: availableSlots, duration: slotDuration });
}
