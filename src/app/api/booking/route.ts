import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

// GET: Returns user's bookings with filters
export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = { userId: user!.id };

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (from) {
    where.startTime = { ...(where.startTime as object || {}), gte: new Date(from) };
  }
  if (to) {
    where.endTime = { ...(where.endTime as object || {}), lte: new Date(to) };
  }

  if (search) {
    const q = search.toLowerCase();
    where.OR = [
      { bookerName: { contains: q } },
      { bookerEmail: { contains: q } },
      { bookerCompany: { contains: q } },
      { title: { contains: q } },
    ];
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { startTime: "desc" },
  });

  return NextResponse.json(bookings);
}
