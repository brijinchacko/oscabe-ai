import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const limit = parseInt(url.searchParams.get("limit") ?? "50");
    const search = url.searchParams.get("search") ?? "";
    const category = url.searchParams.get("category") ?? "";

    const offset = (page - 1) * limit;

    // Build where conditions using raw for case-insensitive search on SQLite
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (search) {
      conditions.push("LOWER(s.name) LIKE ?");
      params.push(`%${search.toLowerCase()}%`);
    }
    if (category) {
      conditions.push("s.category = ?");
      params.push(category);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await prisma.$queryRawUnsafe<{ count: number }[]>(
      `SELECT COUNT(*) as count FROM Skill s ${whereClause}`,
      ...params
    );
    const total = Number(countResult[0]?.count ?? 0);

    const skills = await prisma.$queryRawUnsafe<
      {
        id: string;
        name: string;
        shortName: string;
        category: string;
        platform: string | null;
        parentId: string | null;
        parentName: string | null;
        createdAt: string;
      }[]
    >(
      `SELECT s.id, s.name, s.shortName, s.category, s.platform, s.parentId, p.name as parentName, s.createdAt
       FROM Skill s
       LEFT JOIN Skill p ON s.parentId = p.id
       ${whereClause}
       ORDER BY s.name ASC
       LIMIT ? OFFSET ?`,
      ...params,
      limit,
      offset
    );

    return NextResponse.json({
      skills,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Failed to fetch skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, shortName, category, platform, parentId } =
      await request.json();
    if (!name || !shortName || !category) {
      return NextResponse.json(
        { error: "name, shortName, and category are required" },
        { status: 400 }
      );
    }

    const skill = await prisma.skill.create({
      data: {
        name,
        shortName,
        category,
        platform: platform || null,
        parentId: parentId || null,
      },
    });
    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    console.error("Failed to create skill:", error);
    const message =
      error instanceof Error && error.message.includes("Unique")
        ? "A skill with this name already exists"
        : "Failed to create skill";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, shortName, category, platform, parentId } =
      await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Skill id required" },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (shortName !== undefined) data.shortName = shortName;
    if (category !== undefined) data.category = category;
    if (platform !== undefined) data.platform = platform || null;
    if (parentId !== undefined) data.parentId = parentId || null;

    const skill = await prisma.skill.update({ where: { id }, data });
    return NextResponse.json(skill);
  } catch (error) {
    console.error("Failed to update skill:", error);
    return NextResponse.json(
      { error: "Failed to update skill" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Skill id required" },
        { status: 400 }
      );
    }

    await prisma.skill.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete skill:", error);
    return NextResponse.json(
      { error: "Failed to delete skill" },
      { status: 500 }
    );
  }
}
