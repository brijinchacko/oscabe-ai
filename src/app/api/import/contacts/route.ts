import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Papa from "papaparse";

interface ContactCsvRow {
  [key: string]: string | undefined;
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
    const parseResult = Papa.parse<ContactCsvRow>(csvText, {
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
        entityType: "CONTACT",
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

        let firstName = getValue("firstName");
        if (!firstName) {
          firstName = (row["First_Name"] || row["First Name"] || row["firstName"] || "").trim();
        }

        let lastName = getValue("lastName");
        if (!lastName) {
          lastName = (row["Last_Name"] || row["Last Name"] || row["lastName"] || "").trim();
        }

        let email = getValue("email");
        if (!email) {
          email = (row["Email"] || row["email"] || "").trim();
        }

        if (!firstName || !lastName) {
          errorRows++;
          errors.push({ row: i + 1, error: "Missing required fields: First Name, Last Name" });
          continue;
        }

        // Check for duplicate by email if email is provided
        if (email) {
          const existing = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
            `SELECT id FROM Contact WHERE LOWER("email") = LOWER(?)`,
            email
          );
          if (existing.length > 0) {
            errorRows++;
            errors.push({ row: i + 1, error: `Contact with email "${email}" already exists` });
            continue;
          }
        }

        // Lookup client by company name
        let clientId: string | null = null;
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
          } else {
            errorRows++;
            errors.push({ row: i + 1, error: `Client "${clientName}" not found. Import clients first.` });
            continue;
          }
        } else {
          errorRows++;
          errors.push({ row: i + 1, error: "Missing required field: Client Name" });
          continue;
        }

        const phone = getValue("phone") || (row["Phone"] || "").trim() || undefined;
        const jobTitle = getValue("jobTitle") || (row["Job_Title"] || row["Job Title"] || "").trim() || undefined;
        const linkedIn = getValue("linkedIn") || (row["LinkedIn"] || "").trim() || undefined;
        const isPrimaryStr = getValue("isPrimary") || (row["Is_Primary"] || row["Is Primary"] || "").trim();
        const isPrimary = isPrimaryStr.toLowerCase() === "true" || isPrimaryStr === "1" || isPrimaryStr.toLowerCase() === "yes";
        const notes = getValue("notes") || (row["Notes"] || "").trim() || undefined;

        await prisma.contact.create({
          data: {
            clientId,
            firstName,
            lastName,
            email: email || undefined,
            phone,
            jobTitle,
            linkedIn,
            isPrimary,
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
    console.error("Import contacts error:", error);
    return NextResponse.json(
      { error: "Failed to import contacts" },
      { status: 500 }
    );
  }
}
