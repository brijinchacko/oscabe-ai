import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { isMicrosoftConfigured } from "@/lib/microsoft";

export async function GET() {
  let microsoftConnected = false;
  let microsoftEmail: string | null = null;

  const session = await auth();
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { microsoftConnected: true, microsoftEmail: true },
    });
    if (!user && session.user.email) {
      const userByEmail = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { microsoftConnected: true, microsoftEmail: true },
      });
      microsoftConnected = userByEmail?.microsoftConnected ?? false;
      microsoftEmail = userByEmail?.microsoftEmail ?? null;
    } else {
      microsoftConnected = user?.microsoftConnected ?? false;
      microsoftEmail = user?.microsoftEmail ?? null;
    }
  }

  return NextResponse.json({
    openrouter: !!process.env.OPENROUTER_API_KEY,
    resend: !!process.env.RESEND_API_KEY,
    stripe: false,
    microsoft: microsoftConnected,
    microsoftConfigured: isMicrosoftConfigured(),
    microsoftEmail,
  });
}
