import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const createJobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  clientId: z.string().optional(),
  location: z.string().optional(),
  remote: z.boolean().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  dayRateMin: z.number().optional(),
  dayRateMax: z.number().optional(),
  contractType: z.string().optional(),
  industry: z.string().optional(),
  feePercent: z.number().optional(),
  feeAmount: z.number().optional(),
  source: z.string().optional(),
  sourceRef: z.string().optional(),
  status: z.string().optional(),
  companyName: z.string().optional(),
  assignedToId: z.string().optional(),
  publishedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const source = searchParams.get("source") || "";
    const clientId = searchParams.get("clientId") || "";
    const assignedToId = searchParams.get("assignedToId") || "";
    const contractType = searchParams.get("contractType") || "";
    const location = searchParams.get("location") || "";
    const remote = searchParams.get("remote") || "";
    const hasApplications = searchParams.get("hasApplications") || "";
    const sortBy = searchParams.get("sortBy") || "newest";

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
        { companyName: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (source) {
      where.source = source;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (contractType) {
      where.contractType = contractType;
    }

    if (location) {
      where.location = { contains: location };
    }

    if (remote === "true") {
      where.remote = true;
    }

    if (hasApplications === "true") {
      where.applications = { some: {} };
    }

    // Determine sort order
    let orderBy: Record<string, string>;
    switch (sortBy) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "title_asc":
        orderBy = { title: "asc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: {
            select: { applications: true },
          },
          client: {
            select: { id: true, companyName: true },
          },
          assignedTo: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);

    // Also fetch top clients for the client filter dropdown
    const topClients = await prisma.client.findMany({
      select: { id: true, companyName: true },
      orderBy: { companyName: "asc" },
      take: 50,
    });

    return NextResponse.json({ jobs, total, page, pageSize, topClients });
  } catch (error) {
    console.error("List jobs error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
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
    const parsed = createJobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const data: Record<string, unknown> = { ...parsed.data };
    if (data.publishedAt && typeof data.publishedAt === "string") {
      data.publishedAt = new Date(data.publishedAt as string);
    }
    if (data.expiresAt && typeof data.expiresAt === "string") {
      data.expiresAt = new Date(data.expiresAt as string);
    }

    const job = await prisma.job.create({
      data: data as Parameters<typeof prisma.job.create>[0]["data"],
    });

    await prisma.activity.create({
      data: {
        type: "JOB_CREATED",
        title: "Job created",
        content: `Job "${job.title}" was created.`,
        jobId: job.id,
        clientId: job.clientId || undefined,
        userId: user?.id,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
