import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod/v4";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const domainId = searchParams.get("domainId");

  const mailboxes = await prisma.sendingMailbox.findMany({
    where: domainId ? { domainId } : undefined,
    include: { domain: true },
    orderBy: { email: "asc" },
  });

  return NextResponse.json(mailboxes);
}

const createSchema = z.object({
  domainId: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  dailyLimit: z.number().int().min(1).max(100).default(25),
  warmupEnabled: z.boolean().default(true),
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

  const existing = await prisma.sendingMailbox.findFirst({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return NextResponse.json({ error: "Mailbox already exists" }, { status: 409 });
  }

  const mailbox = await prisma.sendingMailbox.create({
    data: parsed.data,
  });

  return NextResponse.json(mailbox, { status: 201 });
}
