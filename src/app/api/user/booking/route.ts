import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

// GET: Returns current user's booking link and status
export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  return NextResponse.json({
    bookingLink: user!.bookingLink || "",
    bookingEnabled: user!.bookingEnabled,
  });
}

// PUT: Update booking link and enabled status
export async function PUT(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { bookingLink, bookingEnabled } = body;

  const updateData: Record<string, unknown> = {};
  if (bookingLink !== undefined) updateData.bookingLink = bookingLink || null;
  if (bookingEnabled !== undefined) updateData.bookingEnabled = !!bookingEnabled;

  const updated = await prisma.user.update({
    where: { id: user!.id },
    data: updateData,
    select: { bookingLink: true, bookingEnabled: true },
  });

  return NextResponse.json(updated);
}
