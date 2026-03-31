import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod/v4";

const discoverSchema = z.object({
  jobTitle: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  companySize: z.string().optional(),
  technologies: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const parsed = discoverSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: z.prettifyError(parsed.error) },
        { status: 400 }
      );
    }

    // Dynamically import apollo to handle missing module gracefully
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let discoverPeople: (filters: Record<string, unknown>) => Promise<any[]>;

    try {
      const apollo = await import("@/lib/apollo");
      discoverPeople = async (f: Record<string, unknown>) => {
        const result = await apollo.searchPeople(f as Parameters<typeof apollo.searchPeople>[0]);
        return result.contacts;
      };
    } catch {
      return NextResponse.json(
        { error: "Apollo integration is not configured. Please set up @/lib/apollo module." },
        { status: 501 }
      );
    }

    const filters: Record<string, unknown> = {};
    if (parsed.data.jobTitle) filters.person_titles = [parsed.data.jobTitle];
    if (parsed.data.industry) filters.person_industry = parsed.data.industry;
    if (parsed.data.location) filters.person_locations = [parsed.data.location];
    if (parsed.data.companySize) filters.organization_num_employees_ranges = [parsed.data.companySize];
    if (parsed.data.technologies) filters.currently_using_any_of_technology_uids = parsed.data.technologies.split(",").map((t) => t.trim());
    if (parsed.data.limit) filters.per_page = parsed.data.limit;

    const people = await discoverPeople(filters);

    if (!people || people.length === 0) {
      return NextResponse.json({ imported: 0, skipped: 0, message: "No results found from Apollo" });
    }

    // Get existing prospect emails and suppression list for dedup
    const emails = people.map((p) => p.email).filter(Boolean);
    const [existingProspects, suppressedEmails] = await Promise.all([
      prisma.prospect.findMany({
        where: { email: { in: emails } },
        select: { email: true },
      }),
      prisma.suppressionList.findMany({
        where: { email: { in: emails } },
        select: { email: true },
      }),
    ]);

    const existingSet = new Set([
      ...existingProspects.map((p) => p.email),
      ...suppressedEmails.map((s) => s.email),
    ]);

    const toCreate = people.filter(
      (p) => p.email && !existingSet.has(p.email)
    );

    let imported = 0;
    for (const person of toCreate) {
      try {
        await prisma.prospect.create({
          data: {
            firstName: person.first_name,
            lastName: person.last_name,
            email: person.email,
            company: person.company || null,
            jobTitle: person.title || null,
            industry: person.industry || null,
            location: person.location || null,
            linkedIn: person.linkedin_url || null,
            apolloId: person.id,
            source: "APOLLO",
            status: "NEW",
          },
        });
        imported++;
      } catch {
        // Skip duplicates or other errors
      }
    }

    return NextResponse.json({
      imported,
      skipped: people.length - imported,
      total: people.length,
    });
  } catch (error) {
    console.error("Discover prospects error:", error);
    return NextResponse.json({ error: "Failed to discover prospects" }, { status: 500 });
  }
}
