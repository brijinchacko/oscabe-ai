import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod/v4";
import prisma from "@/lib/prisma";

const onboardSchema = z.object({
  role: z.enum(["EMPLOYER", "CANDIDATE", "AGENCY", "ADMIN", "RECRUITER"]),
  companyName: z.string().optional(),
  agencyName: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = onboardSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { role, companyName, agencyName } = parsed.data;

    // Restrict RECRUITER (Employee) role to @oscabe.com or @wartens.com emails
    if (role === "RECRUITER" || role === "ADMIN") {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses[0]?.emailAddress || "";
      const allowedDomains = ["oscabe.com", "wartens.com"];
      const emailDomain = email.split("@")[1]?.toLowerCase();
      if (!emailDomain || !allowedDomains.includes(emailDomain)) {
        return NextResponse.json(
          { error: "Employee access is restricted to @oscabe.com and @wartens.com email addresses" },
          { status: 403 }
        );
      }
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: { clerkId: userId },
    });

    if (!user) {
      // Auto-create from Clerk data
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses[0]?.emailAddress || `${userId}@placeholder.local`;

      try {
        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email,
            firstName: clerkUser?.firstName || null,
            lastName: clerkUser?.lastName || null,
            avatarUrl: clerkUser?.imageUrl || null,
            role: "CANDIDATE",
          },
        });
      } catch {
        // Email conflict - try upsert
        user = await prisma.user.upsert({
          where: { clerkId: userId },
          update: {},
          create: {
            clerkId: userId,
            email,
            firstName: clerkUser?.firstName || null,
            lastName: clerkUser?.lastName || null,
            role: "CANDIDATE",
          },
        });
      }
    }

    if (role === "EMPLOYER") {
      const name = (companyName && companyName.trim()) || "My Company";
      await prisma.employer.upsert({
        where: { userId: user.id },
        update: { companyName: name },
        create: { userId: user.id, companyName: name },
      });
    }

    if (role === "CANDIDATE") {
      await prisma.candidate.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          firstName: user.firstName ?? "",
          lastName: user.lastName ?? "",
          email: user.email,
        },
      });
    }

    if (role === "AGENCY") {
      const name = (agencyName && agencyName.trim()) || "My Agency";
      await prisma.agency.upsert({
        where: { userId: user.id },
        update: { agencyName: name },
        create: { userId: user.id, agencyName: name },
      });
    }

    // Employee maps to RECRUITER
    const finalRole = role === "ADMIN" ? "ADMIN" : role;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: finalRole },
      include: { candidate: true, employer: true, agency: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[POST /api/user/onboard]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
