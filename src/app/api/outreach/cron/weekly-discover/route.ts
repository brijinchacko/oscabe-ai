import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Cron endpoint: Weekly lead discovery via Apollo.io.
 * Frequency: Monday 8am
 * Trigger: GET /api/outreach/cron/weekly-discover?key=CRON_SECRET
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (key !== process.env.CRON_SECRET && process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchPeople } = await import("@/lib/apollo");

    // Default ICP filters for UK hiring managers in automation
    const filters = {
      jobTitles: [
        "Engineering Manager",
        "Engineering Director",
        "Head of Engineering",
        "Controls Manager",
        "Automation Manager",
        "Operations Director",
        "HR Manager",
        "Talent Acquisition",
      ],
      industries: [
        "Manufacturing",
        "Energy",
        "Oil & Gas",
        "Pharmaceuticals",
        "Automotive",
        "Food & Beverage",
        "Water & Utilities",
      ],
      locations: ["United Kingdom"],
      companySize: "51-1000",
      technologies: ["PLC", "SCADA", "automation"],
    };

    const searchResult = await searchPeople(filters);
    const results = searchResult.contacts;

    // Get existing emails to deduplicate
    const existingEmails = new Set(
      (await prisma.prospect.findMany({ select: { email: true } })).map(
        (p) => p.email.toLowerCase()
      )
    );

    // Get suppression list
    const suppressedEmails = new Set(
      (await prisma.suppressionList.findMany({ select: { email: true } })).map(
        (s) => s.email.toLowerCase()
      )
    );

    let imported = 0;
    let skipped = 0;

    for (const contact of results) {
      const email = contact.email?.toLowerCase();
      if (!email) {
        skipped++;
        continue;
      }

      if (existingEmails.has(email) || suppressedEmails.has(email)) {
        skipped++;
        continue;
      }

      await prisma.prospect.create({
        data: {
          firstName: contact.first_name || "Unknown",
          lastName: contact.last_name || "Unknown",
          email: contact.email,
          company: contact.company || null,
          jobTitle: contact.title || null,
          industry: contact.industry || null,
          location: contact.location || null,
          apolloId: contact.id || null,
          source: "APOLLO",
          status: "NEW",
          segment: "UK_HIRING_MANAGERS",
        },
      });

      existingEmails.add(email);
      imported++;
    }

    // Log activity
    await prisma.activity.create({
      data: {
        type: "SYSTEM",
        title: "Weekly Lead Discovery",
        content: `Apollo discovery completed: ${imported} new prospects imported, ${skipped} skipped (duplicates/suppressed)`,
      },
    });

    return NextResponse.json({
      success: true,
      discovered: results.length,
      imported,
      skipped,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON] weekly-discover error:", error);
    return NextResponse.json({ error: "Discovery failed" }, { status: 500 });
  }
}
