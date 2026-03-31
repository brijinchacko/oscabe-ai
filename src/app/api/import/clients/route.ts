import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import Papa from "papaparse";

interface ClientCsvRow {
  [key: string]: string | undefined;
}

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
    const parseResult = Papa.parse<ClientCsvRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
    });

    if (parseResult.data.length === 0) {
      return NextResponse.json({ error: "No data rows found" }, { status: 400 });
    }

    // Parse column mapping from frontend
    const columnMapping: Record<string, string> = mappingJson
      ? JSON.parse(mappingJson)
      : {};

    const importJob = await prisma.importJob.create({
      data: {
        fileName: file.name,
        entityType: "CLIENT",
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
        // Use column mapping to extract values
        const getValue = (targetField: string): string => {
          if (Object.keys(columnMapping).length > 0) {
            for (const [csvCol, mappedField] of Object.entries(columnMapping)) {
              if (mappedField === targetField && row[csvCol]) {
                return row[csvCol]!.trim();
              }
            }
            return "";
          }
          // Fallback: direct field access for common Zoho field names
          return "";
        };

        let companyName = getValue("companyName");
        if (!companyName) {
          // Fallback to common Zoho field names
          companyName = (row["Client_Name"] || row["Client Name"] || row["Company"] || row["companyName"] || "").trim();
        }

        if (!companyName) {
          errorRows++;
          errors.push({ row: i + 1, error: "Missing required field: Company Name" });
          continue;
        }

        // Check for duplicates using raw SQL LOWER() for SQLite
        const existing = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
          `SELECT id FROM Client WHERE LOWER("companyName") = LOWER(?)`,
          companyName
        );

        if (existing.length > 0) {
          errorRows++;
          errors.push({ row: i + 1, error: `Client "${companyName}" already exists` });
          continue;
        }

        const industry = getValue("industry") || (row["Industry"] || "").trim() || undefined;
        const website = getValue("website") || (row["Website"] || "").trim() || undefined;
        const notes = getValue("notes") || (row["About_the_Company"] || row["About the Company"] || "").trim() || undefined;
        const companySize = getValue("companySize") || (row["Company_Size"] || row["Company Size"] || "").trim() || undefined;
        const feeAgreement = getValue("feeAgreement") || (row["Fee_Agreement"] || "").trim() || undefined;
        const paymentTerms = getValue("paymentTerms") || (row["Payment_Terms"] || "").trim() || undefined;

        // Concatenate location parts
        const city = getValue("city") || (row["City"] || "").trim();
        const state = getValue("state") || (row["State"] || "").trim();
        const country = getValue("country") || (row["Country"] || "").trim();
        const locationParts = [city, state, country].filter(Boolean);
        const location = locationParts.length > 0 ? locationParts.join(", ") : undefined;

        // Store phone in notes if provided
        const phone = getValue("phone") || (row["Phone"] || "").trim();
        const fullNotes = phone && notes
          ? `Phone: ${phone}\n\n${notes}`
          : phone
            ? `Phone: ${phone}`
            : notes;

        await prisma.client.create({
          data: {
            companyName,
            industry,
            companySize,
            website,
            location,
            notes: fullNotes,
            feeAgreement,
            paymentTerms: paymentTerms || "30 days",
            source: "CSV_IMPORT",
            pipelineStage: "LEAD",
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
    console.error("Import clients error:", error);
    return NextResponse.json(
      { error: "Failed to import clients" },
      { status: 500 }
    );
  }
}
