import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10))
    );

    const where: Record<string, unknown> = {};
    if (search) {
      where.name = { contains: search };
    }

    const skills = await prisma.skill.findMany({
      where,
      take: limit,
      orderBy: { name: "asc" },
      select: { id: true, name: true, category: true, shortName: true },
    });

    return NextResponse.json({ skills });
  } catch (error) {
    console.error("Search skills error:", error);
    return NextResponse.json(
      { error: "Failed to search skills" },
      { status: 500 }
    );
  }
}
