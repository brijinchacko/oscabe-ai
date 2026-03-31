import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";

const POINTS: Record<string, number> = {
  CANDIDATE_ADDED: 5,
  EMAIL_SENT: 3,
  CALL: 5,
  NOTE: 2,
  APPLICATION: 10,
  INTERVIEW_SCHEDULED: 15,
  CLIENT_CONTACT: 5,
};

const TYPE_MAP: Record<string, string> = {
  CANDIDATE_ADDED: "Candidates Added",
  EMAIL_SENT: "Emails Sent",
  CALL: "Calls Made",
  NOTE: "Notes Written",
  APPLICATION: "Applications Submitted",
  INTERVIEW_SCHEDULED: "Interviews Scheduled",
  CLIENT_CONTACT: "Clients Contacted",
};

// Map Activity.type values to our scoring categories
function categorize(type: string): string | null {
  const t = type.toUpperCase();
  if (t === "CANDIDATE_ADDED" || t === "CANDIDATE_SOURCED" || t === "CANDIDATE_CREATE") return "CANDIDATE_ADDED";
  if (t === "EMAIL" || t === "EMAIL_SENT" || t === "EMAIL_SEND") return "EMAIL_SENT";
  if (t === "CALL" || t === "PHONE_CALL" || t === "CALL_LOGGED") return "CALL";
  if (t === "NOTE" || t === "NOTE_ADDED" || t === "NOTE_CREATE") return "NOTE";
  if (t === "APPLICATION" || t === "APPLICATION_SUBMITTED" || t === "APPLICATION_CREATE") return "APPLICATION";
  if (t === "INTERVIEW" || t === "INTERVIEW_SCHEDULED" || t === "INTERVIEW_CREATE") return "INTERVIEW_SCHEDULED";
  if (t === "CLIENT_CONTACT" || t === "CLIENT_MEETING" || t === "CLIENT_CALL") return "CLIENT_CONTACT";
  return null;
}

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const targetUserId = (isAdmin && searchParams.get("userId")) || user.id;
    const dateStr = searchParams.get("date");

    const date = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    const activities = await prisma.activity.findMany({
      where: {
        userId: targetUserId,
        createdAt: { gte: startOfDay, lt: endOfDay },
      },
    });

    // Count by category
    const counts: Record<string, number> = {};
    for (const act of activities) {
      const cat = categorize(act.type);
      if (cat) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    }

    // Build breakdown
    const breakdown = Object.keys(POINTS).map((key) => ({
      type: key,
      label: TYPE_MAP[key],
      count: counts[key] || 0,
      points: (counts[key] || 0) * POINTS[key],
      maxPoints: POINTS[key],
    }));

    const score = breakdown.reduce((sum, b) => sum + b.points, 0);
    // Max score assumes reasonable daily targets
    const maxScore = 20 * 5 + 10 * 3 + 5 * 5 + 10 * 2 + 2 * 10 + 1 * 15 + 3 * 5; // 200
    const percentage = maxScore > 0 ? Math.min(100, Math.round((score / maxScore) * 100)) : 0;

    return NextResponse.json({
      score,
      maxScore,
      percentage,
      breakdown,
      date: startOfDay.toISOString().split("T")[0],
    });
  } catch (err) {
    console.error("Productivity score error:", err);
    return NextResponse.json({ error: "Failed to calculate productivity" }, { status: 500 });
  }
}
