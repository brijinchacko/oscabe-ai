import { auth } from "@/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First try to find by ID (normal case)
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { candidate: true, employer: true, agency: true },
    });

    // If not found by ID, try by email (handles ID mismatch from session vs DB)
    if (!user && session.user.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { candidate: true, employer: true, agency: true },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found. Please sign up first." }, { status: 404 });
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
      microsoftConnected: user.microsoftConnected ?? false,
      microsoftEmail: user.microsoftEmail ?? null,
    });
  } catch (error) {
    console.error("[GET /api/user/me]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
