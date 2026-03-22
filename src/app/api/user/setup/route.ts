import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/user/setup
 * Creates a User record from Clerk data if one doesn't exist.
 * Called by the dashboard when the webhook hasn't fired.
 */
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: { clerkId: userId },
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    // Get Clerk user data
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Could not fetch user data" }, { status: 500 });
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress || "";

    // Create user, handle potential email conflict
    try {
      const user = await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          firstName: clerkUser.firstName || null,
          lastName: clerkUser.lastName || null,
          avatarUrl: clerkUser.imageUrl || null,
          role: "CANDIDATE",
        },
      });

      return NextResponse.json(user, { status: 201 });
    } catch {
      // Email might already exist (from a previous account), try upsert
      const user = await prisma.user.upsert({
        where: { clerkId: userId },
        update: {
          email,
          firstName: clerkUser.firstName || null,
          lastName: clerkUser.lastName || null,
          avatarUrl: clerkUser.imageUrl || null,
        },
        create: {
          clerkId: userId,
          email,
          firstName: clerkUser.firstName || null,
          lastName: clerkUser.lastName || null,
          avatarUrl: clerkUser.imageUrl || null,
          role: "CANDIDATE",
        },
      });

      return NextResponse.json(user, { status: 201 });
    }
  } catch (error) {
    console.error("[POST /api/user/setup]", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
