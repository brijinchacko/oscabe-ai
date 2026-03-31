import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { getPresence, getUserProfile } from "@/lib/microsoft";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const [presence, profile] = await Promise.all([
      getPresence(user!.id),
      getUserProfile(user!.id),
    ]);

    return NextResponse.json({
      presence: {
        availability: presence.availability,
        activity: presence.activity,
      },
      profile: {
        displayName: profile.displayName,
        mail: profile.mail,
        jobTitle: profile.jobTitle,
        officeLocation: profile.officeLocation,
      },
    });
  } catch (err) {
    console.error("Failed to fetch presence:", err);
    return NextResponse.json({ error: "Failed to fetch presence" }, { status: 500 });
  }
}
