import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { getCalendarEvents } from "@/lib/microsoft";

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("start") || new Date().toISOString();
  const endDate =
    searchParams.get("end") ||
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  try {
    const result = await getCalendarEvents(user!.id, startDate, endDate);

    const events = (result.value || []).map(
      (e: {
        id: string;
        subject: string;
        start: { dateTime: string; timeZone: string };
        end: { dateTime: string; timeZone: string };
        location?: { displayName?: string };
        isOnlineMeeting?: boolean;
        organizer?: { emailAddress: { name: string; address: string } };
      }) => ({
        id: e.id,
        subject: e.subject,
        start: e.start,
        end: e.end,
        location: e.location?.displayName,
        isOnlineMeeting: e.isOnlineMeeting,
        organizer: e.organizer?.emailAddress?.name,
      })
    );

    return NextResponse.json({ events });
  } catch (err) {
    console.error("Failed to fetch calendar:", err);
    return NextResponse.json({ error: "Failed to fetch calendar events" }, { status: 500 });
  }
}
