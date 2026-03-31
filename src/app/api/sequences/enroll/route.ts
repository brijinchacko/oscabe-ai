import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

// POST: Enroll a client/candidate into a sequence
export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { sequenceId, clientId, candidateId, contactEmail } = body;

  if (!sequenceId || !contactEmail) {
    return NextResponse.json(
      { error: "sequenceId and contactEmail are required" },
      { status: 400 }
    );
  }

  // Verify sequence exists and is active
  const sequence = await prisma.followUpSequence.findUnique({
    where: { id: sequenceId },
    include: { steps: { orderBy: { stepOrder: "asc" }, take: 1 } },
  });

  if (!sequence || !sequence.isActive) {
    return NextResponse.json(
      { error: "Sequence not found or inactive" },
      { status: 404 }
    );
  }

  if (sequence.steps.length === 0) {
    return NextResponse.json(
      { error: "Sequence has no steps" },
      { status: 400 }
    );
  }

  // Calculate nextActionAt based on first step's dayDelay
  const firstStep = sequence.steps[0];
  const nextActionAt = new Date();
  nextActionAt.setDate(nextActionAt.getDate() + firstStep.dayDelay);

  const enrollment = await prisma.sequenceEnrollment.create({
    data: {
      sequenceId,
      clientId: clientId || null,
      candidateId: candidateId || null,
      contactEmail,
      currentStep: 0,
      status: "ACTIVE",
      nextActionAt,
      enrolledBy: user!.id,
    },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      type: "SEQUENCE_ENROLLED",
      title: `Enrolled in sequence: ${sequence.name}`,
      content: `Contact ${contactEmail} enrolled into "${sequence.name}" follow-up sequence`,
      userId: user!.id,
      clientId: clientId || undefined,
      candidateId: candidateId || undefined,
    },
  });

  return NextResponse.json(enrollment, { status: 201 });
}
