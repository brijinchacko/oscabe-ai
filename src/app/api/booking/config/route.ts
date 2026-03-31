import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

// GET: Returns user's booking slots (availability) and settings
export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const slots = await prisma.bookingSlot.findMany({
    where: { userId: user!.id },
    orderBy: { dayOfWeek: "asc" },
  });

  return NextResponse.json({
    slots,
    bookingEnabled: user!.bookingEnabled,
  });
}

// PUT: Update availability (array of slots)
export async function PUT(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { slots, bookingEnabled } = body as {
    slots: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      slotDuration: number;
      bufferTime: number;
      isActive: boolean;
    }[];
    bookingEnabled?: boolean;
  };

  // Delete existing slots and recreate
  await prisma.bookingSlot.deleteMany({ where: { userId: user!.id } });

  if (slots && slots.length > 0) {
    await prisma.bookingSlot.createMany({
      data: slots.map((s) => ({
        userId: user!.id,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        slotDuration: s.slotDuration || 30,
        bufferTime: s.bufferTime ?? 15,
        isActive: s.isActive ?? true,
      })),
    });
  }

  // Update booking enabled status
  if (bookingEnabled !== undefined) {
    await prisma.user.update({
      where: { id: user!.id },
      data: { bookingEnabled: !!bookingEnabled },
    });
  }

  const updatedSlots = await prisma.bookingSlot.findMany({
    where: { userId: user!.id },
    orderBy: { dayOfWeek: "asc" },
  });

  return NextResponse.json({ slots: updatedSlots, bookingEnabled: bookingEnabled ?? user!.bookingEnabled });
}
