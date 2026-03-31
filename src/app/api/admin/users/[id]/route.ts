import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        candidate: {
          include: {
            skills: { include: { skill: true } },
            applications: { select: { id: true } },
            placements: { select: { id: true, status: true, feeAmount: true } },
          },
        },
        employer: true,
        agency: true,
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        referrals: { select: { id: true, status: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[GET /api/admin/users/[id]]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { role, isActive } = body;

    const updateData: Record<string, unknown> = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Prevent demoting self
    if (id === admin.id && role && role !== "ADMIN") {
      return NextResponse.json(
        { error: "Cannot change your own role" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Log the activity
    await prisma.activity.create({
      data: {
        type: "USER_UPDATED",
        title: `User ${user.email} updated by admin`,
        content: JSON.stringify(updateData),
        userId: admin.id,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[PUT /api/admin/users/[id]]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    if (body.confirmToken !== "DELETE") {
      return NextResponse.json(
        { error: "Confirmation token required" },
        { status: 400 }
      );
    }

    if (id === admin.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete related records
    await prisma.activity.deleteMany({ where: { userId: id } });
    await prisma.emailLog.deleteMany({ where: { sentById: id } });

    const candidate = await prisma.candidate.findFirst({
      where: { userId: id },
    });
    if (candidate) {
      await prisma.candidateSkill.deleteMany({
        where: { candidateId: candidate.id },
      });
      await prisma.application.deleteMany({
        where: { candidateId: candidate.id },
      });
      await prisma.interview.deleteMany({
        where: { candidateId: candidate.id },
      });
      await prisma.candidate.delete({ where: { id: candidate.id } });
    }

    await prisma.employer.deleteMany({ where: { userId: id } });
    await prisma.agency.deleteMany({ where: { userId: id } });
    await prisma.referral.deleteMany({ where: { referrerUserId: id } });

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/users/[id]]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
