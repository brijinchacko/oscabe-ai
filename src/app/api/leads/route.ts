import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

const LEAD_TYPES = [
  "CONTACT_FORM",
  "JOB_POSTED",
  "CANDIDATE_REGISTERED",
  "SCREENING_ORDER",
  "REFERRAL_SUBMITTED",
];

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "RECRUITER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "25", 10);
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      type: { in: type && LEAD_TYPES.includes(type) ? [type] : LEAD_TYPES },
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    if (status) {
      where.content = { contains: `"status":"${status}"` };
    }

    if (from || to) {
      const createdAtFilter: Record<string, Date> = {};
      if (from) createdAtFilter.gte = new Date(from);
      if (to) createdAtFilter.lte = new Date(to);
      where.createdAt = createdAtFilter;
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.activity.count({ where }),
    ]);

    return NextResponse.json({
      activities,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Leads API error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "RECRUITER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }

    const activity = await prisma.activity.findUnique({ where: { id } });
    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    // Parse existing content, update status
    let contentObj: Record<string, unknown> = {};
    try {
      contentObj = activity.content ? JSON.parse(activity.content) : {};
    } catch {
      contentObj = { rawContent: activity.content };
    }
    contentObj.status = status;

    const updated = await prisma.activity.update({
      where: { id },
      data: {
        content: JSON.stringify(contentObj),
        metadata: JSON.stringify({
          ...JSON.parse(activity.metadata || "{}"),
          status,
          updatedBy: user.id,
          updatedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({ success: true, activity: updated });
  } catch (error) {
    console.error("Leads PATCH error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
