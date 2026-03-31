import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

// GET: Full sequence with steps and active enrollments
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const sequence = await prisma.followUpSequence.findUnique({
    where: { id },
    include: {
      steps: { orderBy: { stepOrder: "asc" } },
      enrollments: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!sequence) {
    return NextResponse.json({ error: "Sequence not found" }, { status: 404 });
  }

  return NextResponse.json(sequence);
}

// PUT: Update sequence and steps
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const { name, description, isActive, steps } = body;

  const existing = await prisma.followUpSequence.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Sequence not found" }, { status: 404 });
  }

  // Update sequence fields
  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (isActive !== undefined) updateData.isActive = isActive;

  // If steps provided, replace them all
  if (steps && Array.isArray(steps)) {
    await prisma.followUpStep.deleteMany({ where: { sequenceId: id } });
    await prisma.followUpStep.createMany({
      data: steps.map(
        (
          step: {
            dayDelay: number;
            action: string;
            subject?: string;
            body?: string;
          },
          idx: number
        ) => ({
          sequenceId: id,
          dayDelay: step.dayDelay,
          action: step.action,
          subject: step.subject || null,
          body: step.body || null,
          stepOrder: idx + 1,
        })
      ),
    });
  }

  const sequence = await prisma.followUpSequence.update({
    where: { id },
    data: updateData,
    include: { steps: { orderBy: { stepOrder: "asc" } } },
  });

  return NextResponse.json(sequence);
}

// DELETE: Remove sequence
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  await prisma.followUpSequence.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
