import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, role, companyName, agencyName } = body;

    if (!email || !password || !firstName) {
      return NextResponse.json({ error: "Email, password, and first name are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Employee restriction: only @oscabe.com and @wartens.com
    if (role === "EMPLOYEE" || role === "RECRUITER") {
      const domain = email.split("@")[1]?.toLowerCase();
      if (domain !== "oscabe.com" && domain !== "wartens.com") {
        return NextResponse.json(
          { error: "Employee accounts are restricted to @oscabe.com and @wartens.com email addresses" },
          { status: 403 },
        );
      }
    }

    // Check existing
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Map role
    const dbRole = role === "EMPLOYEE" ? "RECRUITER" : role || "CANDIDATE";

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName: lastName || "",
        role: dbRole,
        isActive: true,
      },
    });

    // Create linked records based on role
    if (dbRole === "EMPLOYER" && companyName) {
      await prisma.employer.create({
        data: { userId: user.id, companyName },
      });
    } else if (dbRole === "AGENCY" && agencyName) {
      await prisma.agency.create({
        data: { userId: user.id, agencyName },
      });
    } else if (dbRole === "CANDIDATE") {
      await prisma.candidate.create({
        data: {
          userId: user.id,
          firstName,
          lastName: lastName || "",
          email: email.toLowerCase(),
          status: "ACTIVE",
        },
      });
    }

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
