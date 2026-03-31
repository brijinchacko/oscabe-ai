import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  // Verify client exists
  const client = await prisma.client.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // Get email logs directly linked to this client
  const directLogs = await prisma.emailLog.findMany({
    where: { clientId: id },
    orderBy: { emailDate: "desc" },
    select: {
      id: true,
      subject: true,
      fromEmail: true,
      fromName: true,
      toEmail: true,
      toName: true,
      bodyPreview: true,
      direction: true,
      status: true,
      microsoftMessageId: true,
      emailDate: true,
      createdAt: true,
    },
  });

  // Also get emails linked via client contacts
  const contacts = await prisma.contact.findMany({
    where: { clientId: id, email: { not: null } },
    select: { email: true },
  });

  const contactEmails = contacts
    .map((c) => c.email)
    .filter((e): e is string => !!e)
    .map((e) => e.toLowerCase());

  // Find email logs that match contact emails but may not have clientId set
  let contactLogs: typeof directLogs = [];
  if (contactEmails.length > 0) {
    // Get all email logs not already linked to this client that match contact emails
    const allLogs = await prisma.emailLog.findMany({
      where: {
        clientId: null,
      },
      orderBy: { emailDate: "desc" },
      select: {
        id: true,
        subject: true,
        fromEmail: true,
        fromName: true,
        toEmail: true,
        toName: true,
        bodyPreview: true,
        direction: true,
        status: true,
        microsoftMessageId: true,
        emailDate: true,
        createdAt: true,
      },
    });

    contactLogs = allLogs.filter((log) => {
      const from = (log.fromEmail || "").toLowerCase();
      const to = (log.toEmail || "").toLowerCase();
      return contactEmails.includes(from) || contactEmails.includes(to);
    });
  }

  // Deduplicate by id
  const seenIds = new Set(directLogs.map((l) => l.id));
  const allLogs = [
    ...directLogs,
    ...contactLogs.filter((l) => !seenIds.has(l.id)),
  ];

  // Get email-related activities
  const activities = await prisma.activity.findMany({
    where: {
      clientId: id,
      type: { in: ["EMAIL_SENT", "EMAIL_RECEIVED", "EMAIL_SYNCED", "EMAIL_LOGGED"] },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      title: true,
      content: true,
      createdAt: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  // Combine into timeline
  type TimelineItem = {
    id: string;
    kind: "email" | "activity";
    date: string;
    subject?: string;
    fromEmail?: string | null;
    fromName?: string | null;
    toEmail?: string;
    toName?: string | null;
    bodyPreview?: string | null;
    direction?: string;
    microsoftMessageId?: string | null;
    type?: string;
    title?: string;
    content?: string | null;
    user?: { firstName: string | null; lastName: string | null; email: string } | null;
  };

  const timeline: TimelineItem[] = [
    ...allLogs.map((e) => ({
      id: e.id,
      kind: "email" as const,
      date: (e.emailDate || e.createdAt).toISOString(),
      subject: e.subject,
      fromEmail: e.fromEmail,
      fromName: e.fromName,
      toEmail: e.toEmail,
      toName: e.toName,
      bodyPreview: e.bodyPreview,
      direction: e.direction,
      microsoftMessageId: e.microsoftMessageId,
    })),
    ...activities.map((a) => ({
      id: a.id,
      kind: "activity" as const,
      date: a.createdAt.toISOString(),
      type: a.type,
      title: a.title,
      content: a.content,
      user: a.user,
    })),
  ];

  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json({ timeline, emailCount: allLogs.length });
}
