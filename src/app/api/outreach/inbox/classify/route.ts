import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod/v4";
import { classifyReply } from "@/lib/outreach-ai";

const classifySchema = z.object({
  replyId: z.string().min(1, "Reply ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const parsed = classifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: z.prettifyError(parsed.error) },
        { status: 400 }
      );
    }

    const reply = await prisma.outreachReply.findUnique({
      where: { id: parsed.data.replyId },
      select: { id: true, body: true, subject: true },
    });

    if (!reply) {
      return NextResponse.json({ error: "Reply not found" }, { status: 404 });
    }

    const classification = await classifyReply(reply.body);

    const updated = await prisma.outreachReply.update({
      where: { id: reply.id },
      data: {
        sentiment: classification.sentiment,
        aiClassification: JSON.stringify(classification),
      },
    });

    return NextResponse.json({
      reply: updated,
      classification,
    });
  } catch (error) {
    console.error("Classify reply error:", error);
    return NextResponse.json({ error: "Failed to classify reply" }, { status: 500 });
  }
}
