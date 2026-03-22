import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { candidate: true },
    });

    if (!user?.candidate) {
      return NextResponse.json(
        { error: "Candidate profile not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const updated = await prisma.candidate.update({
      where: { id: user.candidate.id },
      data: {
        firstName: body.firstName ?? user.candidate.firstName,
        lastName: body.lastName ?? user.candidate.lastName,
        phone: body.phone ?? null,
        location: body.location ?? null,
        headline: body.headline ?? null,
        summary: body.summary ?? null,
        linkedIn: body.linkedIn ?? null,
        salaryMin: body.salaryMin ?? null,
        salaryMax: body.salaryMax ?? null,
        dayRateMin: body.dayRateMin ?? null,
        dayRateMax: body.dayRateMax ?? null,
        noticePeriod: body.noticePeriod ?? null,
        availableFrom: body.availableFrom
          ? new Date(body.availableFrom)
          : null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update candidate profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
