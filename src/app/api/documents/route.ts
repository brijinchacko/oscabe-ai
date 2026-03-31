import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId") || "";
    const candidateId = searchParams.get("candidateId") || "";
    const jobId = searchParams.get("jobId") || "";
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";
    const fileType = searchParams.get("fileType") || "";
    const sortBy = searchParams.get("sortBy") || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "50", 10)));

    const where: Record<string, unknown> = {};

    if (clientId) where.clientId = clientId;
    if (candidateId) where.candidateId = candidateId;
    if (jobId) where.jobId = jobId;
    if (category && category !== "all") where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { fileName: { contains: search } },
      ];
    }
    if (from || to) {
      const createdAtFilter: Record<string, Date> = {};
      if (from) createdAtFilter.gte = new Date(from);
      if (to) createdAtFilter.lte = new Date(to);
      where.createdAt = createdAtFilter;
    }

    if (fileType) {
      where.fileName = { contains: `.${fileType}` };
    }

    // Determine sort order
    let orderBy: Record<string, string>;
    switch (sortBy) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "name_asc":
        orderBy = { name: "asc" };
        break;
      case "name_desc":
        orderBy = { name: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          client: { select: { id: true, companyName: true } },
          candidate: { select: { id: true, firstName: true, lastName: true } },
          job: { select: { id: true, title: true } },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.document.count({ where }),
    ]);

    return NextResponse.json({ documents, total, page, pageSize });
  } catch (err) {
    console.error("GET /api/documents error:", err);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const name = (formData.get("name") as string) || file.name;
    const category = (formData.get("category") as string) || "GENERAL";
    const clientId = (formData.get("clientId") as string) || null;
    const candidateId = (formData.get("candidateId") as string) || null;
    const jobId = (formData.get("jobId") as string) || null;
    const notes = (formData.get("notes") as string) || null;

    // Create unique filename
    const ext = path.extname(file.name);
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueName = `${baseName}_${Date.now()}${ext}`;

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", "documents", category);
    await mkdir(uploadDir, { recursive: true });

    // Write file
    const filePath = path.join(uploadDir, uniqueName);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Relative path for storage
    const relativePath = `/uploads/documents/${category}/${uniqueName}`;

    const document = await prisma.document.create({
      data: {
        name,
        fileName: file.name,
        filePath: relativePath,
        fileSize: file.size,
        mimeType: file.type || null,
        category,
        clientId,
        candidateId,
        jobId,
        uploadedBy: user!.id,
        notes,
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (err) {
    console.error("POST /api/documents error:", err);
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}
