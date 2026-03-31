import { auth } from "@/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: { candidate: true, employer: true, agency: true },
    });

    // Auto-create user record if not found (session exists but no DB record yet)
    if (!user) {
      const email = session.user.email || `${userId}@placeholder.local`;

      // Try create, fall back to upsert on conflict
      try {
        user = await prisma.user.create({
          data: {
            email,
            firstName: session.user.name?.split(" ")[0] || null,
            lastName: session.user.name?.split(" ").slice(1).join(" ") || null,
            avatarUrl: session.user.image || null,
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
              firstName: session.user.name?.split(" ")[0] || existingByEmail.firstName,
              lastName: session.user.name?.split(" ").slice(1).join(" ") || existingByEmail.lastName,
              avatarUrl: session.user.image || existingByEmail.avatarUrl,
            },
            include: { candidate: true, employer: true, agency: true },
          });
        } else {
          // Last resort upsert by id
          user = await prisma.user.upsert({
            where: { id: userId },
            update: { email, firstName: session.user.name?.split(" ")[0], lastName: session.user.name?.split(" ").slice(1).join(" ") },
            create: { email, firstName: session.user.name?.split(" ")[0], lastName: session.user.name?.split(" ").slice(1).join(" "), role: "CANDIDATE" },
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
