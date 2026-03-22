import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user and their employer profile
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { employer: true },
    });

    if (!user || !user.employer) {
      return NextResponse.json(
        { error: "Employer profile not found" },
        { status: 404 }
      );
    }

    // TODO: Replace with real Stripe integration when configured.
    // For now return mock data so the billing page renders.
    const subscription = null;
    const invoices: {
      id: string;
      date: string;
      amount: number;
      currency: string;
      status: string;
      pdfUrl: string | null;
    }[] = [];

    return NextResponse.json({ subscription, invoices });
  } catch (error) {
    console.error("Error fetching employer billing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
