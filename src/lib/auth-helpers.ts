import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

/**
 * Require authentication and return the database user.
 * Looks up by ID first, then email as fallback (handles JWT ID mismatch after DB recreation).
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  // Try by ID first
  let user = await prisma.user.findUnique({ where: { id: session.user.id } });

  // Fallback: find by email if ID doesn't match (happens when DB is recreated)
  if (!user && session.user.email) {
    user = await prisma.user.findUnique({ where: { email: session.user.email } });
  }

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
