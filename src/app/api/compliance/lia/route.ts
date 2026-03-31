import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod/v4";

const createLIASchema = z.object({
  legitimateInterest: z.string().min(1, "Legitimate interest is required"),
  necessityAnalysis: z.string().min(1, "Necessity analysis is required"),
  balancingTest: z.string().min(1, "Balancing test is required"),
  safeguards: z.string().min(1, "Safeguards are required"),
  campaignId: z.string().optional(),
});

const updateLIASchema = z.object({
  id: z.string().min(1, "Document ID is required"),
  legitimateInterest: z.string().optional(),
  necessityAnalysis: z.string().optional(),
  balancingTest: z.string().optional(),
  safeguards: z.string().optional(),
  status: z.enum(["DRAFT", "APPROVED"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const parsed = createLIASchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const document = await prisma.lIADocument.create({
      data: {
        legitimateInterest: parsed.data.legitimateInterest,
        necessityAnalysis: parsed.data.necessityAnalysis,
        balancingTest: parsed.data.balancingTest,
        safeguards: parsed.data.safeguards,
        campaignId: parsed.data.campaignId || null,
        createdBy: userId,
        status: "DRAFT",
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("[LIA Create]", error);
    return NextResponse.json(
      { error: "Failed to create LIA document" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const parsed = updateLIASchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { id, ...updateData } = parsed.data;

    const updatePayload: Record<string, unknown> = {};
    if (updateData.legitimateInterest) updatePayload.legitimateInterest = updateData.legitimateInterest;
    if (updateData.necessityAnalysis) updatePayload.necessityAnalysis = updateData.necessityAnalysis;
    if (updateData.balancingTest) updatePayload.balancingTest = updateData.balancingTest;
    if (updateData.safeguards) updatePayload.safeguards = updateData.safeguards;
    if (updateData.status) {
      updatePayload.status = updateData.status;
      if (updateData.status === "APPROVED") {
        updatePayload.approvedAt = new Date();
      }
    }

    const document = await prisma.lIADocument.update({
      where: { id },
      data: updatePayload,
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("[LIA Update]", error);
    return NextResponse.json(
      { error: "Failed to update LIA document" },
      { status: 500 }
    );
  }
}
