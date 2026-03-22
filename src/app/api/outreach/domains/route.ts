import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod/v4";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const domains = await prisma.sendingDomain.findMany({
    include: {
      mailboxes: {
        orderBy: { email: "asc" },
      },
    },
    orderBy: { domain: "asc" },
  });

  return NextResponse.json(domains);
}

const createSchema = z.object({
  domain: z.string().min(3),
  provider: z.string().default("google"),
  dailySendLimit: z.number().int().min(1).max(500).default(25),
  spfConfigured: z.boolean().default(false),
  dkimConfigured: z.boolean().default(false),
  dmarcConfigured: z.boolean().default(false),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const existing = await prisma.sendingDomain.findFirst({
    where: { domain: parsed.data.domain },
  });
  if (existing) {
    return NextResponse.json({ error: "Domain already exists" }, { status: 409 });
  }

  const domain = await prisma.sendingDomain.create({
    data: parsed.data,
  });

  return NextResponse.json(domain, { status: 201 });
}
