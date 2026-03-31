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

  // Verify candidate exists
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    select: { id: true, email: true },
  });

  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  // Get all email logs linked to this candidate
  const emailLogs = await prisma.emailLog.findMany({
    where: { candidateId: id },
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

  // Get email-related activities for this candidate
  const activities = await prisma.activity.findMany({
    where: {
      candidateId: id,
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

  // Combine into a timeline sorted by date
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
    ...emailLogs.map((e) => ({
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

  return NextResponse.json({ timeline, emailCount: emailLogs.length });
}
