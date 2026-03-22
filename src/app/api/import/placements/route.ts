import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Papa from "papaparse";

interface PlacementCsvRow {
  [key: string]: string | undefined;
}

const PLACEMENT_STATUS_MAP: Record<string, string> = {
  active: "ACTIVE",
  placed: "ACTIVE",
  pending: "PENDING",
  confirmed: "CONFIRMED",
  started: "ACTIVE",
  completed: "COMPLETED",
  ended: "COMPLETED",
  cancelled: "CANCELLED",
  canceled: "CANCELLED",
  terminated: "CANCELLED",
};

function parseCurrency(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[$,]/g, "").trim();
  return parseInt(cleaned, 10) || 0;
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) return d;

  // Try DD/MM/YYYY format
  const ddmmyyyy = trimmed.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (ddmmyyyy) {
    const parsed = new Date(
      parseInt(ddmmyyyy[3], 10),
      parseInt(ddmmyyyy[2], 10) - 1,
      parseInt(ddmmyyyy[1], 10)
    );
    if (!isNaN(parsed.getTime())) return parsed;
  }

  return null;
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
    const parseResult = Papa.parse<PlacementCsvRow>(csvText, {
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
        entityType: "PLACEMENT",
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

        // Lookup candidate by name
        let candidateId: string | null = null;
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

        if (!candidateId) {
          errorRows++;
          errors.push({ row: i + 1, error: `Candidate "${candidateName}" not found. Import candidates first.` });
          continue;
        }

        // Lookup job by title
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

        // Fee
        const feeRaw = getValue("feeAmount") || (row["Fee"] || row["fee"] || "").trim();
        const feeAmount = parseCurrency(feeRaw);

        // Start date
        const startDateRaw = getValue("startDate") || (row["Start_Date"] || row["Start Date"] || "").trim();
        const startDate = parseDate(startDateRaw);

        if (!startDate) {
          errorRows++;
          errors.push({ row: i + 1, error: "Missing or invalid Start Date" });
          continue;
        }

        // End date
        const endDateRaw = getValue("endDate") || (row["End_Date"] || row["End Date"] || "").trim();
        const endDate = parseDate(endDateRaw) || undefined;

        // Status
        const statusRaw = getValue("status") || (row["Status"] || "").trim();
        const status = PLACEMENT_STATUS_MAP[statusRaw.toLowerCase()] || "PENDING";

        // Salary and day rate
        const salaryRaw = getValue("salary") || (row["Salary"] || "").trim();
        const salary = salaryRaw ? parseCurrency(salaryRaw) || undefined : undefined;

        const dayRateRaw = getValue("dayRate") || (row["Day_Rate"] || row["Day Rate"] || "").trim();
        const dayRate = dayRateRaw ? parseCurrency(dayRateRaw) || undefined : undefined;

        const feePercentRaw = getValue("feePercent") || (row["Fee_Percent"] || row["Fee Percent"] || "").trim();
        const feePercent = feePercentRaw ? parseFloat(feePercentRaw) || undefined : undefined;

        const notes = getValue("notes") || (row["Notes"] || "").trim() || undefined;

        // Role defaults to job title or candidate name
        const role = jobTitle || candidateName || "Imported Placement";

        await prisma.placement.create({
          data: {
            candidateId,
            jobId,
            clientId,
            role,
            salary,
            dayRate,
            feeAmount: feeAmount || 0,
            feePercent,
            startDate,
            endDate,
            status,
            source: "CSV_IMPORT",
            notes,
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
    console.error("Import placements error:", error);
    return NextResponse.json(
      { error: "Failed to import placements" },
      { status: 500 }
    );
  }
}
