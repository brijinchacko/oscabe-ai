import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const createClientSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  website: z.string().optional(),
  logoUrl: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  feeAgreement: z.string().optional(),
  paymentTerms: z.string().optional(),
  defaultFeePercent: z.number().optional(),
  source: z.string().optional(),
  pipelineStage: z.string().optional(),
  notes: z.string().optional(),
  assignedToId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(200, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
    const search = searchParams.get("search") || "";
    const stage = searchParams.get("stage") || "";
    const industry = searchParams.get("industry") || "";
    const assignedToId = searchParams.get("assignedToId") || "";
    const hasDocuments = searchParams.get("hasDocuments") || "";
    const hasJobs = searchParams.get("hasJobs") || "";
    const sortBy = searchParams.get("sortBy") || "newest";

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { companyName: { contains: search } },
        { industry: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    if (stage) {
      where.pipelineStage = stage;
    }

    if (industry) {
      where.industry = industry;
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (hasDocuments === "true") {
      where.documents = { some: {} };
    }

    if (hasJobs === "true") {
      where.jobs = { some: {} };
    }

    // Determine sort order
    let orderBy: Record<string, string>;
    switch (sortBy) {
      case "name_asc":
        orderBy = { companyName: "asc" };
        break;
      case "name_desc":
        orderBy = { companyName: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "newest":
      default:
        orderBy = { updatedAt: "desc" };
        break;
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: {
            select: {
              contacts: true,
              jobs: true,
              documents: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          contacts: {
            where: { isPrimary: true },
            take: 1,
            select: { firstName: true, lastName: true, isPrimary: true },
          },
        },
      }),
      prisma.client.count({ where }),
    ]);

    return NextResponse.json({ clients, total, page, pageSize });
  } catch (error) {
    console.error("List clients error:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const parsed = createClientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const client = await prisma.client.create({
      data: parsed.data,
    });

    await prisma.activity.create({
      data: {
        type: "CLIENT_CREATED",
        title: "Client created",
        content: `Client "${client.companyName}" was created.`,
        clientId: client.id,
        userId: user?.id,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Create client error:", error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
