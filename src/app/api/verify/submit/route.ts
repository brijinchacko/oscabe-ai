import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod/v4";
import prisma from "@/lib/prisma";

const submitSchema = z.object({
  candidateName: z.string().min(1, "Candidate name is required"),
  candidateEmail: z.string().email("Valid email is required"),
  candidatePhone: z.string().optional(),
  assessmentType: z.enum(["basic", "advanced"]),
  platforms: z.array(z.string()).min(1, "At least one platform is required"),
  agencyBrandName: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const activity = await prisma.activity.create({
    data: {
      type: "VERIFICATION_REQUEST",
      title: `Verification request for ${data.candidateName}`,
      content: `Assessment type: ${data.assessmentType}. Platforms: ${data.platforms.join(", ")}`,
      userId: user.id,
      metadata: JSON.stringify({
        candidateName: data.candidateName,
        candidateEmail: data.candidateEmail,
        candidatePhone: data.candidatePhone ?? null,
        assessmentType: data.assessmentType,
        platforms: data.platforms,
        agencyBrandName: data.agencyBrandName ?? null,
        notes: data.notes ?? null,
        status: "PENDING",
      }),
    },
  });

  return NextResponse.json({
    success: true,
    requestId: activity.id,
    estimatedDelivery: "48 hours",
  });
}
