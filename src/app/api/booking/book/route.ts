import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createCalendarEvent } from "@/lib/microsoft";
import { sendEmail } from "@/lib/resend";

// POST: Public endpoint - book a meeting
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    userId,
    date,
    time,
    name,
    email,
    phone,
    company,
    candidateId,
    clientId,
    description,
  } = body as {
    userId: string;
    date: string;
    time: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    candidateId?: string;
    clientId?: string;
    description?: string;
  };

  if (!userId || !date || !time || !name || !email) {
    return NextResponse.json(
      { error: "userId, date, time, name, and email are required" },
      { status: 400 }
    );
  }

  // Get the user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      microsoftEmail: true,
      bookingEnabled: true,
    },
  });

  if (!user || !user.bookingEnabled) {
    return NextResponse.json(
      { error: "Booking is not available for this user" },
      { status: 404 }
    );
  }

  // Get the slot config for that day
  const dateObj = new Date(date + "T00:00:00Z");
  const dayOfWeek = dateObj.getUTCDay();

  const config = await prisma.bookingSlot.findFirst({
    where: { userId, dayOfWeek, isActive: true },
  });

  if (!config) {
    return NextResponse.json(
      { error: "No availability configured for this day" },
      { status: 400 }
    );
  }

  const slotDuration = config.slotDuration;
  const startTime = new Date(`${date}T${time}:00.000Z`);
  const endTime = new Date(startTime.getTime() + slotDuration * 60 * 1000);

  // Verify the slot is still available (prevent double-booking)
  const existing = await prisma.booking.findFirst({
    where: {
      userId,
      status: { not: "CANCELLED" },
      OR: [
        {
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      ],
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "This time slot is no longer available" },
      { status: 409 }
    );
  }

  const userName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Team Member";
  const title = `Meeting with ${name} - OSCABE`;

  // Create Booking record
  const booking = await prisma.booking.create({
    data: {
      userId,
      bookerName: name,
      bookerEmail: email,
      bookerPhone: phone || null,
      bookerCompany: company || null,
      candidateId: candidateId || null,
      clientId: clientId || null,
      title,
      description: description || null,
      startTime,
      endTime,
      duration: slotDuration,
      status: "CONFIRMED",
    },
  });

  // Create Outlook calendar event
  let meetingLink: string | undefined;
  let calendarEventId: string | undefined;

  const attendees = [email];
  if (user.microsoftEmail) attendees.push(user.microsoftEmail);

  const eventBody = `
    <div style="font-family: Arial, sans-serif;">
      <h3>Meeting Booking Details</h3>
      <p><strong>Booked by:</strong> ${name} (${email})</p>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
      ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
      ${description ? `<p><strong>Notes:</strong> ${description}</p>` : ""}
      <hr />
      <p style="color: #666; font-size: 12px;">Booked via OSCABE CRM</p>
    </div>
  `;

  try {
    const result = await createCalendarEvent(userId, {
      subject: title,
      body: eventBody,
      start: startTime.toISOString(),
      end: endTime.toISOString(),
      attendees,
      isOnlineMeeting: true,
    });

    if (result.id) calendarEventId = result.id;
    if (result.onlineMeetingUrl) meetingLink = result.onlineMeetingUrl;
    else if (result.webLink) meetingLink = result.webLink;
  } catch (err) {
    console.error("Failed to create calendar event:", err);
  }

  // Update booking with calendar data
  if (calendarEventId || meetingLink) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        microsoftEventId: calendarEventId || null,
        meetingLink: meetingLink || null,
      },
    });
  }

  // Send confirmation email to booker
  const formattedDate = dateObj.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  try {
    await sendEmail({
      to: email,
      subject: `Booking Confirmed: Meeting with ${userName}`,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #02012B; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">Meeting Confirmed</h1>
          </div>
          <div style="padding: 24px; background: #f9fafb;">
            <p style="color: #1f2937; font-size: 16px; margin-bottom: 16px;">
              Hi ${name},
            </p>
            <p style="color: #374151; font-size: 14px;">
              Your meeting with <strong>${userName}</strong> has been confirmed.
            </p>
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 4px 0; color: #374151;"><strong>Date:</strong> ${formattedDate}</p>
              <p style="margin: 4px 0; color: #374151;"><strong>Time:</strong> ${time} UTC</p>
              <p style="margin: 4px 0; color: #374151;"><strong>Duration:</strong> ${slotDuration} minutes</p>
              ${meetingLink ? `<p style="margin: 8px 0 4px;"><a href="${meetingLink}" style="color: #4540DB; font-weight: 600;">Join Teams Meeting</a></p>` : ""}
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
              If you need to cancel or reschedule, please reply to this email.
            </p>
          </div>
          <div style="padding: 12px; text-align: center; color: #9ca3af; font-size: 11px;">
            Powered by OSCABE
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send confirmation email:", err);
  }

  // Create Notification for the OSCABE user
  try {
    await prisma.notification.create({
      data: {
        userId,
        title: "New Meeting Booked",
        message: `${name}${company ? ` from ${company}` : ""} booked a meeting on ${formattedDate} at ${time}`,
        type: "BOOKING",
        link: "/crm/bookings",
      },
    });
  } catch (err) {
    console.error("Failed to create notification:", err);
  }

  // Create Activity record
  try {
    await prisma.activity.create({
      data: {
        type: "BOOKING",
        title: `Meeting booked: ${name}`,
        content: `${name} (${email}) booked a ${slotDuration}-min meeting on ${formattedDate} at ${time}`,
        userId,
        candidateId: candidateId || undefined,
        clientId: clientId || undefined,
      },
    });
  } catch (err) {
    console.error("Failed to create activity:", err);
  }

  return NextResponse.json({
    booking: { ...booking, meetingLink, microsoftEventId: calendarEventId },
    meetingLink,
    calendarEventId,
  });
}
