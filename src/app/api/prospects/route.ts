import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod/v4";

const createProspectSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Valid email is required"),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  location: z.string().optional(),
  technologies: z.string().optional(),
  linkedIn: z.string().optional(),
  source: z.string().optional(),
  segment: z.string().optional(),
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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const segment = searchParams.get("segment") || "";
    const industry = searchParams.get("industry") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const conditions: string[] = ["1=1"];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (search) {
      const lowerSearch = `%${search.toLowerCase()}%`;
      conditions.push(
        `(LOWER("firstName") LIKE $${paramIndex} OR LOWER("lastName") LIKE $${paramIndex} OR LOWER("email") LIKE $${paramIndex} OR LOWER("company") LIKE $${paramIndex} OR LOWER("jobTitle") LIKE $${paramIndex})`
      );
      params.push(lowerSearch);
      paramIndex++;
    }

    if (status) {
      conditions.push(`"status" = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (segment) {
      conditions.push(`"segment" = $${paramIndex}`);
      params.push(segment);
      paramIndex++;
    }

    if (industry) {
      conditions.push(`"industry" = $${paramIndex}`);
      params.push(industry);
      paramIndex++;
    }

    // For SQLite, use simpler Prisma-based approach with raw where for search
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }
    if (segment) {
      where.segment = segment;
    }
    if (industry) {
      where.industry = industry;
    }

    // For search with case-insensitive matching on SQLite, we use raw SQL
    if (search) {
      const lowerSearch = `%${search.toLowerCase()}%`;
      const matchingIds = await prisma.$queryRawUnsafe<{ id: string }[]>(
        `SELECT id FROM "Prospect" WHERE LOWER("firstName") LIKE ? OR LOWER("lastName") LIKE ? OR LOWER("email") LIKE ? OR LOWER("company") LIKE ? OR LOWER("jobTitle") LIKE ?`,
        lowerSearch,
        lowerSearch,
        lowerSearch,
        lowerSearch,
        lowerSearch
      );
      const ids = matchingIds.map((r) => r.id);
      if (ids.length === 0) {
        return NextResponse.json({ prospects: [], total: 0, page, pageSize });
      }
      where.id = { in: ids };
    }

    const allowedSortFields = ["createdAt", "updatedAt", "firstName", "lastName", "company", "status", "lastContactedAt"];
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    const [prospects, total] = await Promise.all([
      prisma.prospect.findMany({
        where,
        orderBy: { [orderField]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: {
            select: {
              outreachEmails: true,
              outreachReplies: true,
            },
          },
        },
      }),
      prisma.prospect.count({ where }),
    ]);

    // Get stats
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalCount, newThisWeek, contacted, replied, converted] = await Promise.all([
      prisma.prospect.count(),
      prisma.prospect.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.prospect.count({ where: { status: "CONTACTED" } }),
      prisma.prospect.count({ where: { status: "REPLIED" } }),
      prisma.prospect.count({ where: { status: "CONVERTED" } }),
    ]);

    return NextResponse.json({
      prospects,
      total,
      page,
      pageSize,
      stats: {
        total: totalCount,
        newThisWeek,
        contacted,
        replied,
        converted,
      },
    });
  } catch (error) {
    console.error("List prospects error:", error);
    return NextResponse.json({ error: "Failed to fetch prospects" }, { status: 500 });
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
    const parsed = createProspectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: z.prettifyError(parsed.error) },
        { status: 400 }
      );
    }

    // Check suppression list
    const suppressed = await prisma.suppressionList.findUnique({
      where: { email: parsed.data.email },
    });
    if (suppressed) {
      return NextResponse.json(
        { error: `Email ${parsed.data.email} is on the suppression list (reason: ${suppressed.reason})` },
        { status: 409 }
      );
    }

    // Check for duplicate email
    const existing = await prisma.prospect.findUnique({
      where: { email: parsed.data.email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A prospect with this email already exists" },
        { status: 409 }
      );
    }

    const prospect = await prisma.prospect.create({
      data: {
        ...parsed.data,
        source: parsed.data.source || "MANUAL",
      },
    });

    return NextResponse.json(prospect, { status: 201 });
  } catch (error) {
    console.error("Create prospect error:", error);
    return NextResponse.json({ error: "Failed to create prospect" }, { status: 500 });
  }
}
