import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { writeFile, mkdir, unlink, stat } from "fs/promises";
import path from "path";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const ALLOWED_MIMES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

async function getCandidate(userId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { candidate: true },
  });
  return user?.candidate ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const candidate = await getCandidate(userId);
    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate profile not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("cv") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Validate file type
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, DOC, and DOCX are allowed" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIMES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file MIME type" },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "uploads", "cv");
    await mkdir(uploadDir, { recursive: true });

    // Delete old CV file if exists
    if (candidate.cvUrl) {
      const oldFilePath = path.join(process.cwd(), "public", candidate.cvUrl);
      try {
        await unlink(oldFilePath);
      } catch {
        // File may not exist, ignore
      }
    }

    // Save file
    const timestamp = Date.now();
    const filename = `${candidate.id}-${timestamp}${ext}`;
    const filePath = path.join(uploadDir, filename);
    const cvUrl = `/uploads/cv/${filename}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Update candidate record
    await prisma.candidate.update({
      where: { id: candidate.id },
      data: {
        cvUrl,
        cvFileName: file.name,
      },
    });

    return NextResponse.json({
      success: true,
      cvUrl,
      cvFileName: file.name,
    });
  } catch (error) {
    console.error("CV upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload CV" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const candidate = await getCandidate(userId);
    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate profile not found" },
        { status: 404 }
      );
    }

    if (!candidate.cvUrl || !candidate.cvFileName) {
      return NextResponse.json({ cv: null });
    }

    // Get file stats for upload date
    let uploadDate: string | null = null;
    try {
      const filePath = path.join(process.cwd(), "public", candidate.cvUrl);
      const stats = await stat(filePath);
      uploadDate = stats.mtime.toISOString();
    } catch {
      // File may not exist on disk
      uploadDate = candidate.updatedAt.toISOString();
    }

    return NextResponse.json({
      cv: {
        filename: candidate.cvFileName,
        url: candidate.cvUrl,
        uploadDate,
      },
    });
  } catch (error) {
    console.error("CV fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch CV info" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const candidate = await getCandidate(userId);
    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate profile not found" },
        { status: 404 }
      );
    }

    // Delete file from disk
    if (candidate.cvUrl) {
      const filePath = path.join(process.cwd(), "public", candidate.cvUrl);
      try {
        await unlink(filePath);
      } catch {
        // File may not exist, ignore
      }
    }

    // Clear CV fields on candidate
    await prisma.candidate.update({
      where: { id: candidate.id },
      data: {
        cvUrl: null,
        cvFileName: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CV delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete CV" },
      { status: 500 }
    );
  }
}
