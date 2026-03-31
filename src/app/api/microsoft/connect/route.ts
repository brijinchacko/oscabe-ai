import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { getAuthUrl, isMicrosoftConfigured } from "@/lib/microsoft";
import prisma from "@/lib/prisma";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  if (!isMicrosoftConfigured()) {
    // In demo mode, simulate a successful connection
    await prisma.user.update({
      where: { id: user.id },
      data: {
        microsoftConnected: true,
        microsoftEmail: user.email || "demo@oscabe.com",
        microsoftAccessToken: "mock_token",
        microsoftRefreshToken: "mock_refresh",
        microsoftTokenExpiry: new Date(Date.now() + 3600 * 1000),
      },
    });
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "https://oscabe.com"}/crm/settings?tab=integrations&connected=microsoft`
    );
  }

  const authUrl = getAuthUrl(user.id);
  return NextResponse.redirect(authUrl);
}
