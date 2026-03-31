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
    const candidateEmail = searchParams.get("candidateEmail") || "";
    const clientId = searchParams.get("clientId") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));

    const where: Record<string, unknown> = {};

    if (candidateEmail) {
      where.toEmail = candidateEmail;
    }

    if (clientId) {
      // Find all contact emails for this client, then filter logs by those emails
      const contacts = await prisma.contact.findMany({
        where: { clientId },
        select: { email: true },
      });
      const contactEmails = contacts
        .map((c) => c.email)
        .filter((e): e is string => e !== null);

      if (contactEmails.length === 0) {
        return NextResponse.json({ logs: [], total: 0, page, pageSize });
      }

      where.toEmail = { in: contactEmails };
    }

    if (!candidateEmail && !clientId) {
      // No filter specified - return empty to avoid dumping entire table
      return NextResponse.json(
        { error: "Provide candidateEmail or clientId filter" },
        { status: 400 }
      );
    }

    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          campaign: {
            select: { id: true, name: true },
          },
          sentBy: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.emailLog.count({ where }),
    ]);

    return NextResponse.json({ logs, total, page, pageSize });
  } catch (error) {
    console.error("List email logs error:", error);
    return NextResponse.json({ error: "Failed to fetch email logs" }, { status: 500 });
  }
}
