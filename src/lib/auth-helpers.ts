import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

/**
 * Require authentication and return the database user.
 * Use in API routes that need user data from Prisma.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return { user: null, error: NextResponse.json({ error: "User not found" }, { status: 404 }) };
  }

  return { user, error: null };
}

/**
 * Require authentication and return just the session.
 * Use in API routes that only need an auth gate, not user data.
 */
export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return { session: null, userId: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { session, userId: session.user.id, error: null };
}
