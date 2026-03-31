import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const { id } = await params;
  const body = await req.json();

  const domain = await prisma.sendingDomain.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(domain);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const { id } = await params;

  await prisma.sendingMailbox.deleteMany({ where: { domainId: id } });
  await prisma.sendingDomain.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
