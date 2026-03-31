import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Public endpoint - returns basic user info for booking page
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      bookingEnabled: true,
    },
  });

  if (!user || !user.bookingEnabled) {
    return NextResponse.json(
      { error: "Booking not available" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Team Member",
    avatarUrl: user.avatarUrl,
    firstName: user.firstName,
    lastName: user.lastName,
  });
}
