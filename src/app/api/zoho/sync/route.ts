import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getAllRecords } from "@/lib/zoho";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SyncResult {
  module: string;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
  duration: number;
}

type ZohoRecord = Record<string, unknown>;

/* ------------------------------------------------------------------ */
/*  Field mappers                                                      */
/* ------------------------------------------------------------------ */

function str(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val);
}

function numOrNull(val: unknown): number | null {
  if (val === null || val === undefined || val === "") return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

function intOrNull(val: unknown): number | null {
  const n = numOrNull(val);
  return n !== null ? Math.round(n) : null;
}

/* ------------------------------------------------------------------ */
/*  Sync: Candidates                                                   */
/* ------------------------------------------------------------------ */

async function syncCandidates(fullSync: boolean): Promise<SyncResult> {
  const start = Date.now();
  const result: SyncResult = { module: "candidates", created: 0, updated: 0, skipped: 0, errors: [], duration: 0 };

  try {
    const records = await getAllRecords("Candidates");

    for (const r of records) {
      try {
        const email = str(r.Email).toLowerCase().trim();
        if (!email) {
          result.skipped++;
          continue;
        }

        const data = {
          firstName: str(r.First_Name) || "Unknown",
          lastName: str(r.Last_Name) || "Unknown",
          phone: str(r.Phone) || null,
          location: str(r.City) || null,
          headline: str(r.Current_Job_Title) || null,
          source: "ZOHO_RECRUIT",
          notes: r.Experience_in_Years ? `Experience: ${r.Experience_in_Years} years` : null,
        };

        const existing = await prisma.candidate.findUnique({ where: { email } });

        if (existing) {
          if (fullSync) {
            await prisma.candidate.update({
              where: { email },
              data,
            });
            result.updated++;
          } else {
            result.skipped++;
          }
        } else {
          await prisma.candidate.create({
            data: { ...data, email },
          });
          result.created++;
        }
      } catch (err) {
        result.errors.push(`Candidate ${str(r.Email)}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  } catch (err) {
    result.errors.push(`Failed to fetch candidates: ${err instanceof Error ? err.message : String(err)}`);
  }

  result.duration = Date.now() - start;
  return result;
}

/* ------------------------------------------------------------------ */
/*  Sync: Clients                                                      */
/* ------------------------------------------------------------------ */

async function syncClients(fullSync: boolean): Promise<SyncResult> {
  const start = Date.now();
  const result: SyncResult = { module: "clients", created: 0, updated: 0, skipped: 0, errors: [], duration: 0 };

  try {
    const records = await getAllRecords("Clients");

    for (const r of records) {
      try {
        const companyName = str(r.Client_Name).trim();
        if (!companyName) {
          result.skipped++;
          continue;
        }

        const data = {
          industry: str(r.Industry) || null,
          website: str(r.Website) || null,
          source: "ZOHO_RECRUIT",
        };

        // SQLite doesn't support mode:"insensitive" so we search all and filter
        const allClients = await prisma.client.findMany({
          where: { companyName },
        });
        const existing = allClients[0] || null;

        if (existing) {
          if (fullSync) {
            await prisma.client.update({
              where: { id: existing.id },
              data,
            });
            result.updated++;
          } else {
            result.skipped++;
          }
        } else {
          await prisma.client.create({
            data: { ...data, companyName },
          });
          result.created++;
        }
      } catch (err) {
        result.errors.push(`Client ${str(r.Client_Name)}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  } catch (err) {
    result.errors.push(`Failed to fetch clients: ${err instanceof Error ? err.message : String(err)}`);
  }

  result.duration = Date.now() - start;
  return result;
}

/* ------------------------------------------------------------------ */
/*  Sync: Contacts                                                     */
/* ------------------------------------------------------------------ */

async function syncContacts(fullSync: boolean): Promise<SyncResult> {
  const start = Date.now();
  const result: SyncResult = { module: "contacts", created: 0, updated: 0, skipped: 0, errors: [], duration: 0 };

  try {
    const records = await getAllRecords("Contacts");

    for (const r of records) {
      try {
        const firstName = str(r.First_Name).trim();
        const lastName = str(r.Last_Name).trim();
        const email = str(r.Email).toLowerCase().trim();

        if (!firstName && !lastName) {
          result.skipped++;
          continue;
        }

        // Resolve client link
        let clientId: string | null = null;
        const clientRef = r.Client_Name as { name?: string; id?: string } | string | null;
        const clientName = typeof clientRef === "object" && clientRef?.name
          ? clientRef.name
          : typeof clientRef === "string"
            ? clientRef
            : null;

        if (clientName) {
          const client = await prisma.client.findFirst({
            where: { companyName: clientName },
          });
          clientId = client?.id || null;
        }

        if (!clientId) {
          // Contacts require a client link in Prisma
          result.skipped++;
          continue;
        }

        const data = {
          firstName: firstName || "Unknown",
          lastName: lastName || "Unknown",
          email: email || null,
          phone: str(r.Phone) || null,
          clientId,
        };

        // Deduplicate by email if present, otherwise by name+client
        let existing = null;
        if (email) {
          existing = await prisma.contact.findFirst({
            where: { email, clientId },
          });
        }
        if (!existing) {
          existing = await prisma.contact.findFirst({
            where: { firstName: data.firstName, lastName: data.lastName, clientId },
          });
        }

        if (existing) {
          if (fullSync) {
            await prisma.contact.update({
              where: { id: existing.id },
              data,
            });
            result.updated++;
          } else {
            result.skipped++;
          }
        } else {
          await prisma.contact.create({ data });
          result.created++;
        }
      } catch (err) {
        result.errors.push(`Contact ${str(r.Email)}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  } catch (err) {
    result.errors.push(`Failed to fetch contacts: ${err instanceof Error ? err.message : String(err)}`);
  }

  result.duration = Date.now() - start;
  return result;
}

/* ------------------------------------------------------------------ */
/*  Sync: Jobs (JobOpenings)                                           */
/* ------------------------------------------------------------------ */

async function syncJobs(fullSync: boolean): Promise<SyncResult> {
  const start = Date.now();
  const result: SyncResult = { module: "jobs", created: 0, updated: 0, skipped: 0, errors: [], duration: 0 };

  try {
    const records = await getAllRecords("JobOpenings");

    for (const r of records) {
      try {
        const title = str(r.Posting_Title).trim();
        if (!title) {
          result.skipped++;
          continue;
        }

        // Resolve client
        let clientId: string | null = null;
        const clientRef = r.Client_Name as { name?: string; id?: string } | string | null;
        const clientName = typeof clientRef === "object" && clientRef?.name
          ? clientRef.name
          : typeof clientRef === "string"
            ? clientRef
            : null;

        if (clientName) {
          const client = await prisma.client.findFirst({
            where: { companyName: clientName },
          });
          clientId = client?.id || null;
        }

        // Build location from City/State/Country
        const locationParts = [str(r.City), str(r.State), str(r.Country)].filter(Boolean);
        const location = locationParts.join(", ") || null;

        // Map Job_Type to contractType
        const jobType = str(r.Job_Type).toLowerCase();
        let contractType = "PERMANENT";
        if (jobType.includes("contract")) contractType = "CONTRACT";
        else if (jobType.includes("part")) contractType = "PART_TIME";
        else if (jobType.includes("temp")) contractType = "TEMPORARY";

        const data = {
          title,
          description: str(r.Job_Description) || title,
          location,
          contractType,
          salaryMin: intOrNull(r.Salary),
          salaryMax: intOrNull(r.Salary),
          source: "ZOHO_RECRUIT",
          companyName: clientName,
          clientId,
          notes: r.Number_of_Positions ? `Positions: ${r.Number_of_Positions}` : null,
        };

        // Deduplicate by title + client
        const existing = await prisma.job.findFirst({
          where: {
            title,
            ...(clientId ? { clientId } : { companyName: clientName }),
          },
        });

        if (existing) {
          if (fullSync) {
            await prisma.job.update({
              where: { id: existing.id },
              data,
            });
            result.updated++;
          } else {
            result.skipped++;
          }
        } else {
          await prisma.job.create({ data });
          result.created++;
        }
      } catch (err) {
        result.errors.push(`Job ${str(r.Posting_Title)}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  } catch (err) {
    result.errors.push(`Failed to fetch jobs: ${err instanceof Error ? err.message : String(err)}`);
  }

  result.duration = Date.now() - start;
  return result;
}

/* ------------------------------------------------------------------ */
/*  POST handler                                                       */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { module, fullSync = false } = body as {
      module: "candidates" | "clients" | "contacts" | "jobs" | "all";
      fullSync?: boolean;
    };

    if (!module) {
      return NextResponse.json({ error: "Module is required" }, { status: 400 });
    }

    const results: SyncResult[] = [];

    if (module === "all" || module === "clients") {
      results.push(await syncClients(fullSync));
    }
    if (module === "all" || module === "contacts") {
      results.push(await syncContacts(fullSync));
    }
    if (module === "all" || module === "candidates") {
      results.push(await syncCandidates(fullSync));
    }
    if (module === "all" || module === "jobs") {
      results.push(await syncJobs(fullSync));
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Zoho sync error:", error);
    return NextResponse.json(
      { error: "Sync failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
