import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod/v4";

const updateReplySchema = z.object({
  isRead: z.boolean().optional(),
  notes: z.string().optional(),
  sentiment: z.enum(["INTERESTED", "NOT_INTERESTED", "OOO", "WRONG_PERSON", "MEETING_REQUEST"]).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { id } = await params;

    const reply = await prisma.outreachReply.findUnique({
      where: { id },
      include: {
        prospect: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
            jobTitle: true,
            industry: true,
            location: true,
            linkedIn: true,
            status: true,
          },
        },
        email: {
          select: {
            id: true,
            subject: true,
            body: true,
            sentAt: true,
            campaignId: true,
            campaign: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!reply) {
      return NextResponse.json({ error: "Reply not found" }, { status: 404 });
    }

    // Get the full email thread for this prospect in this campaign
    const thread = reply.email
      ? await prisma.outreachEmail.findMany({
          where: {
            prospectId: reply.prospectId,
            campaignId: reply.email.campaignId,
          },
          orderBy: { sequenceStep: "asc" },
          select: {
            id: true,
            subject: true,
            body: true,
            sequenceStep: true,
            status: true,
            sentAt: true,
            openedAt: true,
            repliedAt: true,
          },
        })
      : [];

    // Get all replies from this prospect
    const prospectReplies = await prisma.outreachReply.findMany({
      where: { prospectId: reply.prospectId },
      orderBy: { receivedAt: "asc" },
      select: {
        id: true,
        subject: true,
        body: true,
        receivedAt: true,
        sentiment: true,
      },
    });

    return NextResponse.json({
      reply,
      thread,
      prospectReplies,
    });
  } catch (error) {
    console.error("Get reply error:", error);
    return NextResponse.json({ error: "Failed to fetch reply" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateReplySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: z.prettifyError(parsed.error) },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (parsed.data.isRead !== undefined) data.isRead = parsed.data.isRead;
    if (parsed.data.notes !== undefined) data.notes = parsed.data.notes;
    if (parsed.data.sentiment !== undefined) data.sentiment = parsed.data.sentiment;

    const reply = await prisma.outreachReply.update({
      where: { id },
      data,
    });

    return NextResponse.json(reply);
  } catch (error) {
    console.error("Update reply error:", error);
    return NextResponse.json({ error: "Failed to update reply" }, { status: 500 });
  }
}
