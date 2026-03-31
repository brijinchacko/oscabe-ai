import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRecords } from "@/lib/zoho";

/* ------------------------------------------------------------------ */
/*  Field mappers - preview how Zoho records map to OSCABE format      */
/* ------------------------------------------------------------------ */

function str(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val);
}

function mapCandidate(r: Record<string, unknown>) {
  return {
    zohoId: r.id,
    firstName: str(r.First_Name),
    lastName: str(r.Last_Name),
    email: str(r.Email),
    phone: str(r.Phone),
    location: str(r.City),
    headline: str(r.Current_Job_Title),
    experience: str(r.Experience_in_Years),
    skills: str(r.Skill_Set),
  };
}

function mapClient(r: Record<string, unknown>) {
  return {
    zohoId: r.id,
    companyName: str(r.Client_Name),
    industry: str(r.Industry),
    phone: str(r.Phone),
    website: str(r.Website),
  };
}

function mapContact(r: Record<string, unknown>) {
  const clientRef = r.Client_Name as { name?: string } | string | null;
  const clientName =
    typeof clientRef === "object" && clientRef?.name
      ? clientRef.name
      : typeof clientRef === "string"
        ? clientRef
        : "";
  return {
    zohoId: r.id,
    firstName: str(r.First_Name),
    lastName: str(r.Last_Name),
    email: str(r.Email),
    phone: str(r.Phone),
    clientName,
  };
}

function mapJob(r: Record<string, unknown>) {
  const clientRef = r.Client_Name as { name?: string } | string | null;
  const clientName =
    typeof clientRef === "object" && clientRef?.name
      ? clientRef.name
      : typeof clientRef === "string"
        ? clientRef
        : "";
  const locationParts = [str(r.City), str(r.State), str(r.Country)].filter(Boolean);
  return {
    zohoId: r.id,
    title: str(r.Posting_Title),
    description: str(r.Job_Description).slice(0, 100) + "...",
    location: locationParts.join(", "),
    jobType: str(r.Job_Type),
    salary: str(r.Salary),
    positions: str(r.Number_of_Positions),
    requiredSkills: str(r.Required_Skills),
    clientName,
  };
}

const MODULE_MAP: Record<string, { zohoModule: string; mapper: (r: Record<string, unknown>) => unknown }> = {
  candidates: { zohoModule: "Candidates", mapper: mapCandidate },
  clients: { zohoModule: "Clients", mapper: mapClient },
  contacts: { zohoModule: "Contacts", mapper: mapContact },
  jobs: { zohoModule: "JobOpenings", mapper: mapJob },
};

/* ------------------------------------------------------------------ */
/*  GET handler - preview records                                      */
/* ------------------------------------------------------------------ */

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ module: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { module } = await params;

    const config = MODULE_MAP[module];
    if (!config) {
      return NextResponse.json(
        { error: `Unknown module: ${module}. Valid: candidates, clients, contacts, jobs` },
        { status: 400 },
      );
    }

    const res = await getRecords(config.zohoModule, { per_page: "10", page: "1" });
    const preview = (res.data || []).map(config.mapper);

    return NextResponse.json({
      module,
      zohoModule: config.zohoModule,
      count: preview.length,
      totalInZoho: res.info?.count ?? null,
      records: preview,
    });
  } catch (error) {
    console.error("Zoho preview error:", error);
    return NextResponse.json(
      { error: "Failed to fetch preview", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
