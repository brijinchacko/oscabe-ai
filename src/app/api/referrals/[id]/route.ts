import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod/v4";

const updateReferralSchema = z.object({
  status: z.enum(["PENDING", "CONTACTED", "INTERVIEWING", "PLACED", "REJECTED"]),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const referral = await prisma.referral.findUnique({
      where: { id },
      include: {
        referrer: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!referral) {
      return NextResponse.json({ error: "Referral not found" }, { status: 404 });
    }

    const isAdminOrRecruiter = user.role === "ADMIN" || user.role === "RECRUITER";
    if (!isAdminOrRecruiter && referral.referrerUserId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(referral);
  } catch (error) {
    console.error("Failed to fetch referral:", error);
    return NextResponse.json({ error: "Failed to fetch referral" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isAdminOrRecruiter = user.role === "ADMIN" || user.role === "RECRUITER";
    if (!isAdminOrRecruiter) {
      return NextResponse.json({ error: "Only admins and recruiters can update referral status" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateReferralSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: z.flattenError(parsed.error) },
        { status: 400 }
      );
    }

    const { status } = parsed.data;

    const existingReferral = await prisma.referral.findUnique({
      where: { id },
    });

    if (!existingReferral) {
      return NextResponse.json({ error: "Referral not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { status };

    if (status === "PLACED") {
      updateData.rewardAmount = 20000; // £200 in pence
    }

    const referral = await prisma.referral.update({
      where: { id },
      data: updateData,
    });

    // Log the status change
    await prisma.activity.create({
      data: {
        type: "REFERRAL_STATUS_CHANGED",
        title: `Referral status updated to ${status}`,
        content: `Referral for ${referral.candidateName} (${referral.referralCode}) changed from ${existingReferral.status} to ${status}`,
        userId: user.id,
        metadata: JSON.stringify({
          referralId: referral.id,
          referralCode: referral.referralCode,
          previousStatus: existingReferral.status,
          newStatus: status,
        }),
      },
    });

    return NextResponse.json(referral);
  } catch (error) {
    console.error("Failed to update referral:", error);
    return NextResponse.json({ error: "Failed to update referral" }, { status: 500 });
  }
}
