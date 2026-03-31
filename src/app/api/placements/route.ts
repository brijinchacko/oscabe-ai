import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const createPlacementSchema = z.object({
  candidateId: z.string().min(1, "Candidate ID is required"),
  jobId: z.string().optional(),
  clientId: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  salary: z.number().optional(),
  dayRate: z.number().optional(),
  feeAmount: z.number().min(0, "Fee amount is required"),
  feePercent: z.number().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  source: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const source = searchParams.get("source") || "";
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (source) {
      where.source = source;
    }

    if (from || to) {
      const startDateFilter: Record<string, Date> = {};
      if (from) {
        startDateFilter.gte = new Date(from);
      }
      if (to) {
        startDateFilter.lte = new Date(to);
      }
      where.startDate = startDateFilter;
    }

    const [placements, total] = await Promise.all([
      prisma.placement.findMany({
        where,
        orderBy: { startDate: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          candidate: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          client: {
            select: { id: true, companyName: true },
          },
          job: {
            select: { id: true, title: true },
          },
        },
      }),
      prisma.placement.count({ where }),
    ]);

    // Calculate totals
    const allMatchingPlacements = await prisma.placement.findMany({
      where,
      select: { feeAmount: true },
    });

    const totalFeeAmount = allMatchingPlacements.reduce((sum, p) => sum + p.feeAmount, 0);

    return NextResponse.json({
      placements,
      total,
      page,
      pageSize,
      totals: {
        count: total,
        totalFeeAmount,
      },
    });
  } catch (error) {
    console.error("List placements error:", error);
    return NextResponse.json({ error: "Failed to fetch placements" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const parsed = createPlacementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const data = {
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
    };

    const placement = await prisma.placement.create({
      data,
    });

    // Create activities on candidate, client, and job
    const activityBase = {
      type: "PLACEMENT_CREATED",
      title: "Placement created",
      content: `Placement for "${placement.role}" created.`,
      userId: user?.id,
    };

    const activityPromises = [
      prisma.activity.create({
        data: { ...activityBase, candidateId: placement.candidateId },
      }),
    ];

    if (placement.clientId) {
      activityPromises.push(
        prisma.activity.create({
          data: { ...activityBase, clientId: placement.clientId },
        })
      );
    }

    if (placement.jobId) {
      activityPromises.push(
        prisma.activity.create({
          data: { ...activityBase, jobId: placement.jobId },
        })
      );
    }

    await Promise.all(activityPromises);

    return NextResponse.json(placement, { status: 201 });
  } catch (error) {
    console.error("Create placement error:", error);
    return NextResponse.json({ error: "Failed to create placement" }, { status: 500 });
  }
}
