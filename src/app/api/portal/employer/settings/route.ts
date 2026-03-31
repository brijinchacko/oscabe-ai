import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employer: true },
    });

    if (!user?.employer) {
      return NextResponse.json(
        { error: "Employer profile not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const updated = await prisma.employer.update({
      where: { id: user.employer.id },
      data: {
        companyName: body.companyName ?? user.employer.companyName,
        industry: body.industry ?? user.employer.industry,
        website: body.website ?? user.employer.website,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update employer settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
