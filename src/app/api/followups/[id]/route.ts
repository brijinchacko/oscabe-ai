import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const { id } = await params;

  const followUp = await prisma.followUp.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, companyName: true } },
    },
  });

  if (!followUp) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(followUp);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const { id } = await params;
  const body = await req.json();

  // Handle completion
  if (body.status === "COMPLETED" && !body.completedAt) {
    body.completedAt = new Date();
  }

  // Convert date strings
  if (body.dueDate) body.dueDate = new Date(body.dueDate);
  if (body.reminderAt) body.reminderAt = new Date(body.reminderAt);
  if (body.completedAt && typeof body.completedAt === "string") {
    body.completedAt = new Date(body.completedAt);
  }

  const followUp = await prisma.followUp.update({
    where: { id },
    data: body,
    include: {
      client: { select: { id: true, companyName: true } },
    },
  });

  // Log completion activity
  if (body.status === "COMPLETED") {
    await prisma.activity.create({
      data: {
        type: "FOLLOW_UP",
        title: `Follow-up completed: ${followUp.title}`,
        content: body.completedNote || `${followUp.channel} follow-up marked as completed`,
        clientId: followUp.clientId,
      },
    });
  }

  return NextResponse.json(followUp);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const { id } = await params;
  await prisma.followUp.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
