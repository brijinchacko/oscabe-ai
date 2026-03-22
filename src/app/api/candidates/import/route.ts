import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Papa from "papaparse";

interface CsvRow {
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  headline?: string;
  summary?: string;
  source?: string;
  linkedIn?: string;
  linkedin?: string;
  skills?: string;
  salaryMin?: string;
  salary_min?: string;
  salaryMax?: string;
  salary_max?: string;
  noticePeriod?: string;
  notice_period?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "File must be a CSV" }, { status: 400 });
    }

    const csvText = await file.text();
    const parseResult = Papa.parse<CsvRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
    });

    if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
      return NextResponse.json({ error: "Failed to parse CSV", details: parseResult.errors }, { status: 400 });
    }

    const importJob = await prisma.importJob.create({
      data: {
        fileName: file.name,
        entityType: "CANDIDATE",
        totalRows: parseResult.data.length,
        status: "processing",
      },
    });

    let processedRows = 0;
    let errorRows = 0;
    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < parseResult.data.length; i++) {
      const row = parseResult.data[i];
      try {
        const firstName = (row.firstName || row.first_name || "").trim();
        const lastName = (row.lastName || row.last_name || "").trim();
        const email = (row.email || "").trim();

        if (!firstName || !lastName || !email) {
          errorRows++;
          errors.push({ row: i + 1, error: "Missing required fields (firstName, lastName, email)" });
          continue;
        }

        const existingCandidate = await prisma.candidate.findUnique({ where: { email } });
        if (existingCandidate) {
          errorRows++;
          errors.push({ row: i + 1, error: `Candidate with email ${email} already exists` });
          continue;
        }

        const salaryMinStr = row.salaryMin || row.salary_min || "";
        const salaryMaxStr = row.salaryMax || row.salary_max || "";

        const candidate = await prisma.candidate.create({
          data: {
            firstName,
            lastName,
            email,
            phone: (row.phone || "").trim() || undefined,
            location: (row.location || "").trim() || undefined,
            headline: (row.headline || "").trim() || undefined,
            summary: (row.summary || "").trim() || undefined,
            source: (row.source || "CSV_IMPORT").trim(),
            linkedIn: (row.linkedIn || row.linkedin || "").trim() || undefined,
            salaryMin: salaryMinStr ? parseInt(salaryMinStr, 10) || undefined : undefined,
            salaryMax: salaryMaxStr ? parseInt(salaryMaxStr, 10) || undefined : undefined,
            noticePeriod: (row.noticePeriod || row.notice_period || "").trim() || undefined,
          },
        });

        // Link skills if provided (comma-separated skill names)
        const skillNames = (row.skills || "").split(",").map((s: string) => s.trim()).filter(Boolean);
        if (skillNames.length > 0) {
          for (const skillName of skillNames) {
            const skill = await prisma.skill.findUnique({ where: { name: skillName } });
            if (skill) {
              await prisma.candidateSkill.create({
                data: {
                  candidateId: candidate.id,
                  skillId: skill.id,
                },
              });
            }
          }
        }

        processedRows++;
      } catch (err) {
        errorRows++;
        errors.push({ row: i + 1, error: err instanceof Error ? err.message : "Unknown error" });
      }
    }

    await prisma.importJob.update({
      where: { id: importJob.id },
      data: {
        processedRows,
        errorRows,
        errors: errors.length > 0 ? JSON.stringify(errors) : null,
        status: errorRows === parseResult.data.length ? "failed" : "completed",
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      importJobId: importJob.id,
      totalRows: parseResult.data.length,
      processedRows,
      errorRows,
      errors: errors.slice(0, 50), // Return first 50 errors max
    });
  } catch (error) {
    console.error("Import candidates error:", error);
    return NextResponse.json({ error: "Failed to import candidates" }, { status: 500 });
  }
}
