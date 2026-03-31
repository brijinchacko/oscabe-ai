import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const location = searchParams.get("location") || "";
    const contractType = searchParams.get("contractType") || "";
    const salaryMin = searchParams.get("salaryMin");
    const salaryMax = searchParams.get("salaryMax");
    const industry = searchParams.get("industry") || "";
    const remote = searchParams.get("remote");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const sort = searchParams.get("sort") || "createdAt";

    // Build where clause - show all active jobs (published or not)
    // SQLite doesn't support mode: "insensitive", so we use contains only
    const where: Record<string, unknown> = {
      status: "ACTIVE",
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { companyName: { contains: search } },
        { location: { contains: search } },
        { client: { companyName: { contains: search } } },
      ];
    }

    if (location) {
      where.location = { contains: location };
    }

    if (contractType) {
      where.contractType = contractType;
    }

    if (salaryMin) {
      where.salaryMax = { gte: parseInt(salaryMin, 10) };
    }

    if (salaryMax) {
      where.salaryMin = { lte: parseInt(salaryMax, 10) };
    }

    if (industry) {
      where.industry = { contains: industry };
    }

    if (remote === "true") {
      where.remote = true;
    }

    // Determine sort order
    const validSortFields = ["createdAt", "salaryMin", "salaryMax", "title"];
    const sortField = validSortFields.includes(sort) ? sort : "createdAt";
    const orderBy = { [sortField]: "desc" as const };

    // Execute query with pagination
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          companyName: true,
          location: true,
          remote: true,
          salaryMin: true,
          salaryMax: true,
          dayRateMin: true,
          dayRateMax: true,
          contractType: true,
          industry: true,
          publishedAt: true,
          createdAt: true,
          // Client name hidden from public API for confidentiality
          skills: {
            select: {
              skill: {
                select: {
                  id: true,
                  name: true,
                  shortName: true,
                  category: true,
                },
              },
              required: true,
            },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      jobs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Public jobs listing error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}
