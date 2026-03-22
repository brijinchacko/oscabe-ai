import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user = await prisma.user.findFirst({
      where: { clerkId: userId },
      include: { candidate: true, employer: true, agency: true },
    });

    // Auto-create user record if not found (webhook may not have fired)
    if (!user) {
      const clerkUser = await currentUser();
      if (!clerkUser) {
        return NextResponse.json({ error: "Could not fetch user data" }, { status: 500 });
      }

      const email = clerkUser.emailAddresses[0]?.emailAddress || `${userId}@placeholder.local`;

      // Try create, fall back to upsert on conflict
      try {
        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email,
            firstName: clerkUser.firstName || null,
            lastName: clerkUser.lastName || null,
            avatarUrl: clerkUser.imageUrl || null,
            role: "CANDIDATE",
          },
          include: { candidate: true, employer: true, agency: true },
        });
      } catch {
        // Email uniqueness conflict - update existing by email
        const existingByEmail = await prisma.user.findFirst({ where: { email } });
        if (existingByEmail) {
          user = await prisma.user.update({
            where: { id: existingByEmail.id },
            data: {
              clerkId: userId,
              firstName: clerkUser.firstName || existingByEmail.firstName,
              lastName: clerkUser.lastName || existingByEmail.lastName,
              avatarUrl: clerkUser.imageUrl || existingByEmail.avatarUrl,
            },
            include: { candidate: true, employer: true, agency: true },
          });
        } else {
          // Last resort upsert by clerkId
          user = await prisma.user.upsert({
            where: { clerkId: userId },
            update: { email, firstName: clerkUser.firstName, lastName: clerkUser.lastName },
            create: { clerkId: userId, email, firstName: clerkUser.firstName, lastName: clerkUser.lastName, role: "CANDIDATE" },
            include: { candidate: true, employer: true, agency: true },
          });
        }
      }
    }

    const role = user.role;
    const hasCompletedOnboarding =
      role === "ADMIN" ||
      role === "RECRUITER" ||
      (role === "EMPLOYER" && user.employer !== null) ||
      (role === "AGENCY" && user.agency !== null) ||
      (role === "CANDIDATE" && user.candidate !== null);

    return NextResponse.json({
      id: user.id,
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      hasCompletedOnboarding,
    });
  } catch (error) {
    console.error("[GET /api/user/me]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
