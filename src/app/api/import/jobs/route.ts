import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Papa from "papaparse";

interface JobCsvRow {
  [key: string]: string | undefined;
}

const JOB_TYPE_MAP: Record<string, string> = {
  "full time": "PERMANENT",
  "full-time": "PERMANENT",
  fulltime: "PERMANENT",
  permanent: "PERMANENT",
  contract: "CONTRACT",
  "part time": "PART_TIME",
  "part-time": "PART_TIME",
  parttime: "PART_TIME",
  temporary: "TEMPORARY",
  temp: "TEMPORARY",
  freelance: "CONTRACT",
  intern: "PART_TIME",
  internship: "PART_TIME",
};

const JOB_STATUS_MAP: Record<string, string> = {
  "in-progress": "ACTIVE",
  "in progress": "ACTIVE",
  open: "ACTIVE",
  active: "ACTIVE",
  filled: "CLOSED",
  closed: "CLOSED",
  cancelled: "CLOSED",
  canceled: "CLOSED",
  "on-hold": "ON_HOLD",
  "on hold": "ON_HOLD",
  draft: "DRAFT",
};

function parseSalaryRange(salaryStr: string): { min?: number; max?: number } {
  if (!salaryStr) return {};
  // Remove currency symbols and commas
  const cleaned = salaryStr.replace(/[$,]/g, "").trim();

  // Try range format: "50000-80000" or "50000 - 80000"
  const rangeMatch = cleaned.match(/(\d+)\s*[-–to]+\s*(\d+)/i);
  if (rangeMatch) {
    return {
      min: parseInt(rangeMatch[1], 10),
      max: parseInt(rangeMatch[2], 10),
    };
  }

  // Single number
  const singleMatch = cleaned.match(/(\d+)/);
  if (singleMatch) {
    const val = parseInt(singleMatch[1], 10);
    return { min: val, max: val };
  }

  return {};
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    const parseResult = Papa.parse<JobCsvRow>(csvText, {
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
        entityType: "JOB",
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

        let title = getValue("title");
        if (!title) {
          title = (row["Posting_Title"] || row["Posting Title"] || row["Job_Title"] || row["Job Title"] || row["title"] || "").trim();
        }

        let description = getValue("description");
        if (!description) {
          description = (row["Job_Description"] || row["Job Description"] || row["Description"] || row["description"] || "").trim();
        }

        if (!title) {
          errorRows++;
          errors.push({ row: i + 1, error: "Missing required field: Job Title" });
          continue;
        }

        if (!description) {
          description = title; // Fallback to title if no description
        }

        // Lookup client
        let clientId: string | undefined;
        let companyName: string | undefined;
        let clientName = getValue("clientId");
        if (!clientName) {
          clientName = (row["Client_Name"] || row["Client Name"] || row["Company"] || "").trim();
        }

        if (clientName) {
          const clients = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
            `SELECT id FROM Client WHERE LOWER("companyName") = LOWER(?)`,
            clientName
          );
          if (clients.length > 0) {
            clientId = clients[0].id;
          }
          companyName = clientName;
        }

        // Check for duplicate by title + companyName
        if (title && companyName) {
          const existingJobs = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
            `SELECT id FROM Job WHERE LOWER("title") = LOWER(?) AND LOWER("companyName") = LOWER(?)`,
            title,
            companyName
          );
          if (existingJobs.length > 0) {
            errorRows++;
            errors.push({ row: i + 1, error: `Job "${title}" for "${companyName}" already exists` });
            continue;
          }
        }

        // Location
        const city = getValue("city") || (row["City"] || "").trim();
        const state = getValue("state") || (row["State"] || "").trim();
        const country = getValue("country") || (row["Country"] || "").trim();
        const locationDirect = getValue("location") || (row["Location"] || "").trim();
        const locationParts = [city, state, country].filter(Boolean);
        const location = locationDirect || (locationParts.length > 0 ? locationParts.join(", ") : undefined);

        // Job type
        const jobTypeRaw = getValue("contractType") || (row["Job_Type"] || row["Job Type"] || "").trim();
        const contractType = JOB_TYPE_MAP[jobTypeRaw.toLowerCase()] || "PERMANENT";

        // Salary
        const salaryRaw = getValue("salary") || (row["Salary"] || "").trim();
        const { min: salaryMin, max: salaryMax } = parseSalaryRange(salaryRaw);

        // Remote
        const remoteRaw = getValue("remote") || (row["Remote_Job"] || row["Remote Job"] || row["Remote"] || "").trim();
        const remote = remoteRaw.toLowerCase() === "true" || remoteRaw === "1" || remoteRaw.toLowerCase() === "yes";

        // Status
        const statusRaw = getValue("status") || (row["Job_Opening_Status"] || row["Job Opening Status"] || row["Status"] || "").trim();
        const status = JOB_STATUS_MAP[statusRaw.toLowerCase()] || "ACTIVE";

        // Revenue per position -> feeAmount
        const revenueRaw = getValue("feeAmount") || (row["Revenue_per_Position"] || row["Revenue per Position"] || "").trim();
        const feeAmount = revenueRaw ? parseInt(revenueRaw.replace(/[$,]/g, ""), 10) || undefined : undefined;

        // Number of positions -> notes
        const numPositions = getValue("numPositions") || (row["Number_of_Positions"] || row["Number of Positions"] || "").trim();
        const industry = getValue("industry") || (row["Industry"] || "").trim() || undefined;
        const existingNotes = getValue("notes") || (row["Notes"] || "").trim();
        const noteParts = [];
        if (numPositions) noteParts.push(`Positions: ${numPositions}`);
        if (existingNotes) noteParts.push(existingNotes);
        const notes = noteParts.length > 0 ? noteParts.join("\n") : undefined;

        const job = await prisma.job.create({
          data: {
            title,
            description,
            clientId,
            companyName,
            location,
            remote,
            salaryMin,
            salaryMax,
            contractType,
            industry,
            feeAmount,
            status,
            source: "CSV_IMPORT",
            notes,
          },
        });

        // Handle skills
        const skillsRaw = getValue("skills") || (row["Required_Skills"] || row["Required Skills"] || row["Skills"] || "").trim();
        const skillNames = skillsRaw.split(",").map((s: string) => s.trim()).filter(Boolean);

        for (const skillName of skillNames) {
          // Find or create skill
          let skill = await prisma.skill.findUnique({ where: { name: skillName } });
          if (!skill) {
            skill = await prisma.skill.create({
              data: {
                name: skillName,
                shortName: skillName.substring(0, 20),
                category: "Imported",
              },
            });
          }

          // Create JobSkill link
          const existingLink = await prisma.jobSkill.findUnique({
            where: { jobId_skillId: { jobId: job.id, skillId: skill.id } },
          });
          if (!existingLink) {
            await prisma.jobSkill.create({
              data: { jobId: job.id, skillId: skill.id, required: true },
            });
          }
        }

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
    console.error("Import jobs error:", error);
    return NextResponse.json(
      { error: "Failed to import jobs" },
      { status: 500 }
    );
  }
}
