import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { deleteCalendarEvent } from "@/lib/microsoft";

// GET: Single booking details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const booking = await prisma.booking.findFirst({
    where: { id, userId: user!.id },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json(booking);
}

// PUT: Update booking status
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const { status, notes } = body as { status?: string; notes?: string };

  const booking = await prisma.booking.findFirst({
    where: { id, userId: user!.id },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};
  if (status) updateData.status = status;
  if (notes !== undefined) updateData.notes = notes;

  // If cancelling, also delete the Outlook event
  if (status === "CANCELLED" && booking.microsoftEventId) {
    try {
      await deleteCalendarEvent(user!.id, booking.microsoftEventId);
    } catch (err) {
      console.error("Failed to delete calendar event:", err);
    }
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(updated);
}

// DELETE: Cancel and remove
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const booking = await prisma.booking.findFirst({
    where: { id, userId: user!.id },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Delete Outlook event if exists
  if (booking.microsoftEventId) {
    try {
      await deleteCalendarEvent(user!.id, booking.microsoftEventId);
    } catch (err) {
      console.error("Failed to delete calendar event:", err);
    }
  }

  await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ success: true });
}
