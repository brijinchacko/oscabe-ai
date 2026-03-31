import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const createCandidateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  location: z.string().optional(),
  headline: z.string().optional(),
  summary: z.string().optional(),
  cvUrl: z.string().optional(),
  cvFileName: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  dayRateMin: z.number().optional(),
  dayRateMax: z.number().optional(),
  noticePeriod: z.string().optional(),
  availableFrom: z.string().optional(),
  rightToWork: z.boolean().optional(),
  status: z.string().optional(),
  source: z.string().optional(),
  linkedIn: z.string().optional(),
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
    const location = searchParams.get("location") || "";
    const source = searchParams.get("source") || "";
    const industry = searchParams.get("industry") || "";
    const specialism = searchParams.get("specialism") || "";
    const hasCV = searchParams.get("hasCV") || "";
    const rightToWork = searchParams.get("rightToWork") || "";
    const salaryMin = searchParams.get("salaryMin") || "";
    const salaryMax = searchParams.get("salaryMax") || "";
    const contractType = searchParams.get("contractType") || "";
    const sortBy = searchParams.get("sortBy") || "newest";

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { headline: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (location) {
      where.location = { contains: location };
    }

    if (source) {
      where.source = source;
    }

    if (industry) {
      where.industry = industry;
    }

    if (specialism) {
      where.specialism = specialism;
    }

    if (hasCV === "true") {
      where.cvUrl = { not: null };
    }

    if (rightToWork === "true") {
      where.rightToWork = true;
    }

    if (salaryMin) {
      where.salaryMin = { gte: parseInt(salaryMin, 10) };
    }

    if (salaryMax) {
      where.salaryMax = { lte: parseInt(salaryMax, 10) };
    }

    if (contractType) {
      where.contractType = contractType;
    }

    // Determine sort order
    let orderBy: Record<string, string>;
    switch (sortBy) {
      case "name_asc":
        orderBy = { firstName: "asc" };
        break;
      case "name_desc":
        orderBy = { firstName: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "last_contacted":
        orderBy = { lastContactedAt: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: {
            select: { skills: true },
          },
          skills: {
            include: { skill: true },
            take: 5,
            orderBy: { proficiency: "desc" },
          },
        },
      }),
      prisma.candidate.count({ where }),
    ]);

    return NextResponse.json({ candidates, total, page, pageSize });
  } catch (error) {
    console.error("List candidates error:", error);
    return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 });
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
    const parsed = createCandidateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const data: Record<string, unknown> = { ...parsed.data };
    if (data.availableFrom && typeof data.availableFrom === "string") {
      data.availableFrom = new Date(data.availableFrom as string);
    }

    const candidate = await prisma.candidate.create({
      data: data as Parameters<typeof prisma.candidate.create>[0]["data"],
    });

    await prisma.activity.create({
      data: {
        type: "CANDIDATE_ADDED",
        title: "Candidate added",
        content: `Candidate "${candidate.firstName} ${candidate.lastName}" was added.`,
        candidateId: candidate.id,
        userId: user?.id,
      },
    });

    return NextResponse.json(candidate, { status: 201 });
  } catch (error) {
    console.error("Create candidate error:", error);
    return NextResponse.json({ error: "Failed to create candidate" }, { status: 500 });
  }
}
