import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import {
  generateTalentRadarDigest,
  formatDigestEmailHtml,
} from "@/lib/talent-radar";
import type { SubscriberCriteria } from "@/lib/talent-radar";
import { sendEmail } from "@/lib/resend";
import { wrapEmailHtml } from "@/lib/email-html";

// GET - returns a preview digest for a subscriber
export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscriberId = req.nextUrl.searchParams.get("subscriberId");
  if (!subscriberId) {
    return NextResponse.json(
      { error: "subscriberId is required" },
      { status: 400 },
    );
  }

  // Look up subscriber activity (we store subscriptions as Activity records)
  const subscription = await prisma.activity.findUnique({
    where: { id: subscriberId },
  });

  if (!subscription || subscription.type !== "TALENT_RADAR_SUBSCRIPTION") {
    return NextResponse.json(
      { error: "Subscription not found" },
      { status: 404 },
    );
  }

  let criteria: SubscriberCriteria = {};
  if (subscription.metadata) {
    try {
      const meta = JSON.parse(subscription.metadata);
      criteria = meta.criteria || {};
    } catch {
      // invalid JSON, use empty criteria
    }
  }

  const digest = await generateTalentRadarDigest(criteria);
  return NextResponse.json({ digest });
}

// POST - trigger sending digests
export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { subscriberIds?: string[] | "all" } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Find subscriptions
  const whereClause: Record<string, unknown> = {
    type: "TALENT_RADAR_SUBSCRIPTION",
  };

  if (body.subscriberIds && body.subscriberIds !== "all") {
    whereClause.id = { in: body.subscriberIds };
  }

  const subscriptions = await prisma.activity.findMany({
    where: whereClause,
    include: { user: true },
  });

  if (subscriptions.length === 0) {
    return NextResponse.json(
      { error: "No subscriptions found" },
      { status: 404 },
    );
  }

  const results: Array<{
    subscriberId: string;
    email: string;
    success: boolean;
    candidateCount: number;
  }> = [];

  for (const sub of subscriptions) {
    let criteria: SubscriberCriteria = {};
    if (sub.metadata) {
      try {
        const meta = JSON.parse(sub.metadata);
        criteria = meta.criteria || {};
      } catch {
        // skip invalid
      }
    }

    const digest = await generateTalentRadarDigest(criteria);
    const emailBody = formatDigestEmailHtml(digest);
    const html = wrapEmailHtml(emailBody, "Your weekly talent update from OSCABE");

    const toEmail = sub.user?.email;
    if (!toEmail) {
      results.push({
        subscriberId: sub.id,
        email: "",
        success: false,
        candidateCount: 0,
      });
      continue;
    }

    const result = await sendEmail({
      to: toEmail,
      subject: `Talent Radar: ${digest.newCandidates} new candidates this week`,
      html,
    });

    results.push({
      subscriberId: sub.id,
      email: toEmail,
      success: !!result.success,
      candidateCount: digest.newCandidates,
    });
  }

  return NextResponse.json({
    sent: results.length,
    results,
  });
}
