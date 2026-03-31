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
      include: { agency: true },
    });

    if (!user?.agency) {
      return NextResponse.json(
        { error: "Agency profile not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const updated = await prisma.agency.update({
      where: { id: user.agency.id },
      data: {
        agencyName: body.agencyName ?? user.agency.agencyName,
        website: body.website ?? user.agency.website,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update agency settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
