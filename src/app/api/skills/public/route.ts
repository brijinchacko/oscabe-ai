import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    if (!search || search.length < 2) {
      return NextResponse.json([]);
    }

    const skills = await prisma.skill.findMany({
      where: {
        OR: [
          { name: { contains: search } },
          { shortName: { contains: search } },
        ],
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        shortName: true,
        category: true,
      },
      take: 20,
    });

    return NextResponse.json(skills);
  } catch (error) {
    console.error("Public skills search error:", error);
    return NextResponse.json({ error: "Failed to search skills" }, { status: 500 });
  }
}
