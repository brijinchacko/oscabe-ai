import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { isZohoConfigured, getRecords } from "@/lib/zoho";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const configured = isZohoConfigured();

    // Get local record counts
    const [candidateCount, clientCount, contactCount, jobCount] = await Promise.all([
      prisma.candidate.count(),
      prisma.client.count(),
      prisma.contact.count(),
      prisma.job.count(),
    ]);

    // Try to get Zoho record counts (first page info gives total)
    let zohoCounts: Record<string, number | null> = {
      candidates: null,
      clients: null,
      contacts: null,
      jobs: null,
    };

    if (configured) {
      try {
        const [candidates, clients, contacts, jobs] = await Promise.all([
          getRecords("Candidates", { per_page: "1" }).catch(() => null),
          getRecords("Clients", { per_page: "1" }).catch(() => null),
          getRecords("Contacts", { per_page: "1" }).catch(() => null),
          getRecords("JobOpenings", { per_page: "1" }).catch(() => null),
        ]);

        zohoCounts = {
          candidates: candidates?.info?.count ?? null,
          clients: clients?.info?.count ?? null,
          contacts: contacts?.info?.count ?? null,
          jobs: jobs?.info?.count ?? null,
        };
      } catch {
        // Zoho API might be unreachable; counts stay null
      }
    }

    return NextResponse.json({
      configured,
      localCounts: {
        candidates: candidateCount,
        clients: clientCount,
        contacts: contactCount,
        jobs: jobCount,
      },
      zohoCounts,
    });
  } catch (error) {
    console.error("Zoho status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Zoho status" },
      { status: 500 },
    );
  }
}
