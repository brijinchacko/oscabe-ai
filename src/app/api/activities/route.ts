import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const createActivitySchema = z.object({
  type: z.string().min(1, "Type is required"),
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  candidateId: z.string().optional(),
  clientId: z.string().optional(),
  jobId: z.string().optional(),
  applicationId: z.string().optional(),
  metadata: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get("candidateId") || "";
    const clientId = searchParams.get("clientId") || "";
    const jobId = searchParams.get("jobId") || "";
    const applicationId = searchParams.get("applicationId") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));

    const where: Record<string, unknown> = {};

    if (candidateId) {
      where.candidateId = candidateId;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (jobId) {
      where.jobId = jobId;
    }

    if (applicationId) {
      where.applicationId = applicationId;
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
          },
        },
      }),
      prisma.activity.count({ where }),
    ]);

    return NextResponse.json({ activities, total, page, pageSize });
  } catch (error) {
    console.error("List activities error:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
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
    const parsed = createActivitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const activity = await prisma.activity.create({
      data: {
        ...parsed.data,
        userId: user?.id,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Create activity error:", error);
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}
