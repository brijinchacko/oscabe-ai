import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Find the user and their employer profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employer: true },
    });

    if (!user || !user.employer) {
      return NextResponse.json(
        { error: "Employer profile not found" },
        { status: 404 }
      );
    }

    // Query Activity records with type SHORTLIST_ORDER for this user
    const activities = await prisma.activity.findMany({
      where: {
        userId: user.id,
        type: "SHORTLIST_ORDER",
      },
      orderBy: { createdAt: "desc" },
    });

    // Map activities to order format, parsing metadata JSON if present
    const orders = activities.map((activity) => {
      let metadata: Record<string, string> = {};
      if (activity.metadata) {
        try {
          metadata = JSON.parse(activity.metadata);
        } catch {
          // ignore parse errors
        }
      }
      return {
        id: activity.id,
        packageName: metadata.packageName || activity.title,
        status: metadata.status || "PENDING",
        requirements: metadata.requirements || activity.content || "",
        createdAt: activity.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching employer orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
