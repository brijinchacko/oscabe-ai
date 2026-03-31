import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod/v4";

const addSuppressionSchema = z.object({
  email: z.string().email("Valid email is required"),
  reason: z.string().min(1, "Reason is required"),
  source: z.string().optional(),
});

const deleteSuppressionSchema = z.object({
  id: z.string().min(1, "ID is required"),
  reason: z.string().min(1, "Removal reason is required"),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 25;

    const where = search
      ? { email: { contains: search } }
      : {};

    const [entries, total] = await Promise.all([
      prisma.suppressionList.findMany({
        where,
        orderBy: { addedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.suppressionList.count({ where }),
    ]);

    return NextResponse.json({
      entries: entries.map((e) => ({
        id: e.id,
        email: e.email,
        reason: e.reason,
        source: e.source,
        addedAt: e.addedAt.toISOString(),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[Suppression GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch suppression list" },
      { status: 500 }
    );
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
    const parsed = addSuppressionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Check for duplicate
    const existing = await prisma.suppressionList.findFirst({
      where: { email: parsed.data.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email is already on the suppression list" },
        { status: 409 }
      );
    }

    const entry = await prisma.suppressionList.create({
      data: {
        email: parsed.data.email.toLowerCase(),
        reason: parsed.data.reason,
        source: parsed.data.source || "MANUAL",
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("[Suppression POST]", error);
    return NextResponse.json(
      { error: "Failed to add to suppression list" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const parsed = deleteSuppressionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    await prisma.suppressionList.delete({
      where: { id: parsed.data.id },
    });

    return NextResponse.json({ success: true, removalReason: parsed.data.reason });
  } catch (error) {
    console.error("[Suppression DELETE]", error);
    return NextResponse.json(
      { error: "Failed to remove from suppression list" },
      { status: 500 }
    );
  }
}
