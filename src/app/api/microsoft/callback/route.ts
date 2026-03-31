import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { exchangeCode, isMicrosoftConfigured } from "@/lib/microsoft";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // userId
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://oscabe.com";

  if (error) {
    return NextResponse.redirect(
      `${appUrl}/crm/settings?tab=integrations&error=${encodeURIComponent(error)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${appUrl}/crm/settings?tab=integrations&error=missing_params`
    );
  }

  try {
    // Verify user exists (try by ID first, then email fallback)
    let user = await prisma.user.findUnique({ where: { id: state } });
    if (!user) {
      // State might be email if ID didn't match
      user = await prisma.user.findUnique({ where: { email: state } });
    }
    if (!user) {
      return NextResponse.redirect(
        `${appUrl}/crm/settings?tab=integrations&error=invalid_user`
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCode(code);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Get user email from Microsoft Graph
    let microsoftEmail = user.email;
    if (isMicrosoftConfigured()) {
      try {
        const profileRes = await fetch("https://graph.microsoft.com/v1.0/me", {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          microsoftEmail = profile.mail || profile.userPrincipalName || user.email;
        }
      } catch {
        // Use existing email as fallback
      }
    }

    // Store tokens
    await prisma.user.update({
      where: { id: user.id },
      data: {
        microsoftAccessToken: tokens.access_token,
        microsoftRefreshToken: tokens.refresh_token,
        microsoftTokenExpiry: expiresAt,
        microsoftEmail,
        microsoftConnected: true,
      },
    });

    return NextResponse.redirect(
      `${appUrl}/crm/settings?tab=integrations&connected=microsoft`
    );
  } catch (err) {
    console.error("Microsoft callback error:", err);
    return NextResponse.redirect(
      `${appUrl}/crm/settings?tab=integrations&error=token_exchange_failed`
    );
  }
}
