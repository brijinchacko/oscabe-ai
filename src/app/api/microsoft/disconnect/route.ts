import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function POST() {
  const { user, error } = await requireAuth();
  if (error) return error;

  await prisma.user.update({
    where: { id: user!.id },
    data: {
      microsoftAccessToken: null,
      microsoftRefreshToken: null,
      microsoftTokenExpiry: null,
      microsoftEmail: null,
      microsoftConnected: false,
    },
  });

  return NextResponse.json({ success: true });
}
