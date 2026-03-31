import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod/v4";
import prisma from "@/lib/prisma";

const subscribeSchema = z.object({
  criteria: z.object({
    roles: z.array(z.string()).optional().default([]),
    locations: z.array(z.string()).optional().default([]),
    platforms: z.array(z.string()).optional().default([]),
  }),
  frequency: z.enum(["weekly"]).default("weekly"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Only employers and agencies can subscribe
  if (user.role !== "EMPLOYER" && user.role !== "AGENCY") {
    return NextResponse.json(
      { error: "Only employers and agencies can subscribe to Talent Radar" },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Check if user already has an active subscription
  const existing = await prisma.activity.findFirst({
    where: {
      userId: user.id,
      type: "TALENT_RADAR_SUBSCRIPTION",
    },
  });

  if (existing) {
    // Update existing subscription
    await prisma.activity.update({
      where: { id: existing.id },
      data: {
        metadata: JSON.stringify({
          criteria: data.criteria,
          frequency: data.frequency,
          active: true,
          updatedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      subscriptionId: existing.id,
      message: "Subscription updated successfully",
    });
  }

  // Create new subscription
  const subscription = await prisma.activity.create({
    data: {
      type: "TALENT_RADAR_SUBSCRIPTION",
      title: "Talent Radar weekly subscription",
      content: `Criteria: roles=${data.criteria.roles.join(",")}, locations=${data.criteria.locations.join(",")}, platforms=${data.criteria.platforms.join(",")}`,
      userId: user.id,
      metadata: JSON.stringify({
        criteria: data.criteria,
        frequency: data.frequency,
        active: true,
        subscribedAt: new Date().toISOString(),
      }),
    },
  });

  return NextResponse.json({
    success: true,
    subscriptionId: subscription.id,
    message: "Successfully subscribed to Talent Radar weekly digest",
  });
}
