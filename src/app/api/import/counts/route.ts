import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [clients, contacts, candidates, jobs, placements, activities] =
      await Promise.all([
        prisma.client.count(),
        prisma.contact.count(),
        prisma.candidate.count(),
        prisma.job.count(),
        prisma.placement.count(),
        prisma.activity.count(),
      ]);

    return NextResponse.json({
      clients,
      contacts,
      candidates,
      jobs,
      placements,
      activities,
    });
  } catch (error) {
    console.error("Fetch import counts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch counts" },
      { status: 500 }
    );
  }
}
