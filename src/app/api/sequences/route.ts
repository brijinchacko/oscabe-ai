import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

// GET: List all sequences with step count and enrollment count
export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const sequences = await prisma.followUpSequence.findMany({
    include: {
      _count: { select: { steps: true, enrollments: true } },
      steps: { orderBy: { stepOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get active enrollment counts separately
  const activeEnrollments = await prisma.sequenceEnrollment.groupBy({
    by: ["sequenceId"],
    where: { status: "ACTIVE" },
    _count: true,
  });

  const activeMap = new Map(
    activeEnrollments.map((e) => [e.sequenceId, e._count])
  );

  const result = sequences.map((s) => ({
    ...s,
    activeEnrollments: activeMap.get(s.id) || 0,
  }));

  return NextResponse.json(result);
}

// POST: Create sequence with steps
export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { name, description, steps } = body;

  if (!name || !steps || !Array.isArray(steps) || steps.length === 0) {
    return NextResponse.json(
      { error: "Name and at least one step are required" },
      { status: 400 }
    );
  }

  const sequence = await prisma.followUpSequence.create({
    data: {
      name,
      description: description || null,
      createdBy: user!.id,
      steps: {
        create: steps.map(
          (
            step: {
              dayDelay: number;
              action: string;
              subject?: string;
              body?: string;
            },
            idx: number
          ) => ({
            dayDelay: step.dayDelay,
            action: step.action,
            subject: step.subject || null,
            body: step.body || null,
            stepOrder: idx + 1,
          })
        ),
      },
    },
    include: { steps: { orderBy: { stepOrder: "asc" } } },
  });

  return NextResponse.json(sequence, { status: 201 });
}
