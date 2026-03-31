import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAuthUrl, isMicrosoftConfigured } from "@/lib/microsoft";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isMicrosoftConfigured()) {
    // In demo mode, simulate a successful connection
    const { default: prisma } = await import("@/lib/prisma");
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        microsoftConnected: true,
        microsoftEmail: session.user.email || "demo@oscabe.com",
        microsoftAccessToken: "mock_token",
        microsoftRefreshToken: "mock_refresh",
        microsoftTokenExpiry: new Date(Date.now() + 3600 * 1000),
      },
    });
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/crm/settings?tab=integrations&connected=microsoft`
    );
  }

  const authUrl = getAuthUrl(session.user.id);
  return NextResponse.redirect(authUrl);
}
