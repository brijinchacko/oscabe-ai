import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import Papa from "papaparse";

interface ActivityCsvRow {
  [key: string]: string | undefined;
}

const ACTIVITY_TYPE_MAP: Record<string, string> = {
  call: "CALL",
  phone: "CALL",
  "phone call": "CALL",
  meeting: "MEETING",
  email: "EMAIL",
  note: "NOTE",
  notes: "NOTE",
  interview: "INTERVIEW",
  task: "TASK",
  followup: "FOLLOW_UP",
  "follow up": "FOLLOW_UP",
  "follow-up": "FOLLOW_UP",
  submission: "SUBMISSION",
  other: "NOTE",
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const mappingJson = formData.get("mapping") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "File must be a CSV" }, { status: 400 });
    }

    const csvText = await file.text();
    const parseResult = Papa.parse<ActivityCsvRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
    });

    if (parseResult.data.length === 0) {
      return NextResponse.json({ error: "No data rows found" }, { status: 400 });
    }

    const columnMapping: Record<string, string> = mappingJson
      ? JSON.parse(mappingJson)
      : {};

    const importJob = await prisma.importJob.create({
      data: {
        fileName: file.name,
        entityType: "ACTIVITY",
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
        const getValue = (targetField: string): string => {
          if (Object.keys(columnMapping).length > 0) {
            for (const [csvCol, mappedField] of Object.entries(columnMapping)) {
              if (mappedField === targetField && row[csvCol]) {
                return row[csvCol]!.trim();
              }
            }
            return "";
          }
          return "";
        };

        // Type
        const typeRaw = getValue("type") || (row["Type"] || row["Activity_Type"] || row["Activity Type"] || "").trim();
        const type = ACTIVITY_TYPE_MAP[typeRaw.toLowerCase()] || "NOTE";

        // Title
        let title = getValue("title") || (row["Title"] || row["Subject"] || "").trim();
        if (!title) {
          title = `Imported ${type}`;
        }

        // Content
        const content = getValue("content") || (row["Content"] || row["Description"] || row["Notes"] || row["Body"] || "").trim() || undefined;

        // Lookup candidate
        let candidateId: string | undefined;
        const candidateName = getValue("candidateId") || (row["Candidate_Name"] || row["Candidate Name"] || row["Candidate"] || "").trim();
        if (candidateName) {
          const nameParts = candidateName.split(/\s+/);
          const cFirstName = nameParts[0] || "";
          const cLastName = nameParts.slice(1).join(" ") || "";
          if (cFirstName && cLastName) {
            const candidates = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
              `SELECT id FROM Candidate WHERE LOWER("firstName") = LOWER(?) AND LOWER("lastName") = LOWER(?) LIMIT 1`,
              cFirstName,
              cLastName
            );
            if (candidates.length > 0) {
              candidateId = candidates[0].id;
            }
          }
        }

        // Lookup client
        let clientId: string | undefined;
        const clientName = getValue("clientId") || (row["Client_Name"] || row["Client Name"] || row["Company"] || "").trim();
        if (clientName) {
          const clients = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
            `SELECT id FROM Client WHERE LOWER("companyName") = LOWER(?) LIMIT 1`,
            clientName
          );
          if (clients.length > 0) {
            clientId = clients[0].id;
          }
        }

        // Lookup job
        let jobId: string | undefined;
        const jobTitle = getValue("jobId") || (row["Job_Title"] || row["Job Title"] || row["Job"] || "").trim();
        if (jobTitle) {
          const jobs = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
            `SELECT id FROM Job WHERE LOWER("title") = LOWER(?) LIMIT 1`,
            jobTitle
          );
          if (jobs.length > 0) {
            jobId = jobs[0].id;
          }
        }

        // Date
        const dateRaw = getValue("date") || (row["Date"] || row["Created_Date"] || row["Activity_Date"] || "").trim();
        let createdAt: Date | undefined;
        if (dateRaw) {
          const d = new Date(dateRaw);
          if (!isNaN(d.getTime())) {
            createdAt = d;
          }
        }

        await prisma.activity.create({
          data: {
            type,
            title,
            content,
            candidateId,
            clientId,
            jobId,
            ...(createdAt ? { createdAt } : {}),
          },
        });

        processedRows++;
      } catch (err) {
        errorRows++;
        errors.push({
          row: i + 1,
          error: err instanceof Error ? err.message : "Unknown error",
        });
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
      errors: errors.slice(0, 50),
    });
  } catch (error) {
    console.error("Import activities error:", error);
    return NextResponse.json(
      { error: "Failed to import activities" },
      { status: 500 }
    );
  }
}
