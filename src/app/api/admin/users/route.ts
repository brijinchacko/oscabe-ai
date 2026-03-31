import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const currentUser = await prisma.user.findUnique({ where: { id: userId },
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (role && role !== "ALL") {
      where.role = role;
    }

    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
      where.isActive = false;
    }

    // For search, we need to use raw query with LOWER() since SQLite doesn't support mode: "insensitive"
    let users;
    let total;

    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      const roleFilter = role && role !== "ALL" ? `AND role = '${role}'` : "";
      const statusFilter =
        status === "active"
          ? "AND isActive = 1"
          : status === "inactive"
            ? "AND isActive = 0"
            : "";

      const countResult = await prisma.$queryRawUnsafe<{ count: number }[]>(
        `SELECT COUNT(*) as count FROM User WHERE (LOWER(email) LIKE ? OR LOWER(firstName) LIKE ? OR LOWER(lastName) LIKE ?) ${roleFilter} ${statusFilter}`,
        searchLower,
        searchLower,
        searchLower
      );
      total = Number(countResult[0]?.count || 0);

      users = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
        `SELECT id, clerkId, email, firstName, lastName, role, avatarUrl, phone, isActive, createdAt, updatedAt FROM User WHERE (LOWER(email) LIKE ? OR LOWER(firstName) LIKE ? OR LOWER(lastName) LIKE ?) ${roleFilter} ${statusFilter} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
        searchLower,
        searchLower,
        searchLower,
        limit,
        skip
      );

      // Convert SQLite integer booleans to proper booleans
      users = users.map((u) => ({
        ...u,
        isActive: u.isActive === 1 || u.isActive === true,
      }));
    } else {
      total = await prisma.user.count({ where });
      users = await prisma.user.findMany({
        where,
        include: {
          candidate: { select: { id: true } },
          employer: { select: { id: true, companyName: true } },
          agency: { select: { id: true, agencyName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      });
    }

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/users]", error);
    return NextResponse.json(
      { error: "Internal server error" },
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

    const currentUser = await prisma.user.findUnique({ where: { id: userId },
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { userIds, confirmToken } = body;

    if (confirmToken !== "DELETE") {
      return NextResponse.json(
        { error: "Confirmation token required" },
        { status: 400 }
      );
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "userIds array required" },
        { status: 400 }
      );
    }

    // Prevent deleting self
    if (userIds.includes(currentUser.id)) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    let deletedCount = 0;
    for (const uid of userIds) {
      try {
        // Delete related records first
        await prisma.activity.deleteMany({ where: { userId: uid } });
        await prisma.emailLog.deleteMany({ where: { sentById: uid } });

        const candidate = await prisma.candidate.findFirst({
          where: { userId: uid },
        });
        if (candidate) {
          await prisma.candidateSkill.deleteMany({
            where: { candidateId: candidate.id },
          });
          await prisma.application.deleteMany({
            where: { candidateId: candidate.id },
          });
          await prisma.candidate.delete({ where: { id: candidate.id } });
        }

        await prisma.employer.deleteMany({ where: { userId: uid } });
        await prisma.agency.deleteMany({ where: { userId: uid } });

        await prisma.user.delete({ where: { id: uid } });
        deletedCount++;
      } catch (err) {
        console.error(`Failed to delete user ${uid}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount,
    });
  } catch (error) {
    console.error("[DELETE /api/admin/users]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
