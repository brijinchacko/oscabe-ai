import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod/v4";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const status = searchParams.get("status");
  const upcoming = searchParams.get("upcoming");
  const overdue = searchParams.get("overdue");

  const where: Record<string, unknown> = {};
  if (clientId) where.clientId = clientId;
  if (status) where.status = status;

  const now = new Date();

  if (upcoming === "true") {
    // Next 7 days
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    where.dueDate = { gte: now, lte: nextWeek };
    where.status = "PENDING";
  }

  if (overdue === "true") {
    where.dueDate = { lt: now };
    where.status = "PENDING";
  }

  const followUps = await prisma.followUp.findMany({
    where,
    include: {
      client: { select: { id: true, companyName: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  // Stats
  const stats = {
    total: await prisma.followUp.count({ where: clientId ? { clientId } : {} }),
    pending: await prisma.followUp.count({ where: { ...(clientId ? { clientId } : {}), status: "PENDING" } }),
    overdue: await prisma.followUp.count({ where: { ...(clientId ? { clientId } : {}), status: "PENDING", dueDate: { lt: now } } }),
    completedThisWeek: await prisma.followUp.count({
      where: {
        ...(clientId ? { clientId } : {}),
        status: "COMPLETED",
        completedAt: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()) },
      },
    }),
    todayCount: await prisma.followUp.count({
      where: {
        ...(clientId ? { clientId } : {}),
        status: "PENDING",
        dueDate: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        },
      },
    }),
  };

  return NextResponse.json({ followUps, stats });
}

const createSchema = z.object({
  clientId: z.string(),
  contactId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  channel: z.enum(["CALL", "EMAIL", "MEETING", "LINKEDIN", "WHATSAPP", "OTHER"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.string(),
  dueTime: z.string().optional(),
  reminderAt: z.string().optional(),
  assignedToId: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const followUp = await prisma.followUp.create({
    data: {
      ...parsed.data,
      dueDate: new Date(parsed.data.dueDate),
      reminderAt: parsed.data.reminderAt ? new Date(parsed.data.reminderAt) : null,
      createdById: userId,
    },
    include: {
      client: { select: { id: true, companyName: true } },
    },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      type: "FOLLOW_UP",
      title: `Follow-up scheduled: ${parsed.data.title}`,
      content: `${parsed.data.channel} follow-up due ${new Date(parsed.data.dueDate).toLocaleDateString("en-GB")}${parsed.data.dueTime ? ` at ${parsed.data.dueTime}` : ""}`,
      clientId: parsed.data.clientId,
    },
  });

  return NextResponse.json(followUp, { status: 201 });
}
