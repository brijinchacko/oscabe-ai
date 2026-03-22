import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
    const isRead = searchParams.get("isRead");
    const sentiment = searchParams.get("sentiment");
    const campaignId = searchParams.get("campaignId");

    const where: Record<string, unknown> = {};

    if (isRead === "true") {
      where.isRead = true;
    } else if (isRead === "false") {
      where.isRead = false;
    }

    if (sentiment) {
      where.sentiment = sentiment;
    }

    if (campaignId) {
      where.email = { campaign: { id: campaignId } };
    }

    const [replies, total, unreadCount] = await Promise.all([
      prisma.outreachReply.findMany({
        where,
        orderBy: { receivedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          prospect: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              company: true,
              jobTitle: true,
            },
          },
          email: {
            select: {
              id: true,
              subject: true,
              campaignId: true,
              campaign: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.outreachReply.count({ where }),
      prisma.outreachReply.count({ where: { isRead: false } }),
    ]);

    return NextResponse.json({
      replies,
      total,
      page,
      pageSize,
      unreadCount,
    });
  } catch (error) {
    console.error("List inbox replies error:", error);
    return NextResponse.json({ error: "Failed to fetch inbox" }, { status: 500 });
  }
}
