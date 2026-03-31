import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") || "5", 10)));

    if (!q) {
      return NextResponse.json({ candidates: [], clients: [], jobs: [], contacts: [] });
    }

    const term = `%${q.toLowerCase()}%`;

    const [candidates, clients, jobs, contacts] = await Promise.all([
      prisma.$queryRawUnsafe<
        { id: string; firstName: string; lastName: string; email: string; headline: string | null }[]
      >(
        `SELECT id, firstName, lastName, email, headline FROM Candidate WHERE LOWER(firstName) LIKE ? OR LOWER(lastName) LIKE ? OR LOWER(email) LIKE ? OR LOWER(headline) LIKE ? LIMIT ?`,
        term, term, term, term, limit
      ),
      prisma.$queryRawUnsafe<
        { id: string; companyName: string; industry: string | null }[]
      >(
        `SELECT id, companyName, industry FROM Client WHERE LOWER(companyName) LIKE ? OR LOWER(industry) LIKE ? LIMIT ?`,
        term, term, limit
      ),
      prisma.$queryRawUnsafe<
        { id: string; title: string; location: string | null; status: string }[]
      >(
        `SELECT id, title, location, status FROM Job WHERE LOWER(title) LIKE ? OR LOWER(location) LIKE ? LIMIT ?`,
        term, term, limit
      ),
      prisma.$queryRawUnsafe<
        { id: string; firstName: string; lastName: string; email: string | null; clientId: string }[]
      >(
        `SELECT c.id, c.firstName, c.lastName, c.email, c.clientId FROM Contact c WHERE LOWER(c.firstName) LIKE ? OR LOWER(c.lastName) LIKE ? OR LOWER(c.email) LIKE ? LIMIT ?`,
        term, term, term, limit
      ),
    ]);

    // Fetch client company names for contacts
    const clientIds = [...new Set(contacts.map((c) => c.clientId))];
    let clientMap: Record<string, string> = {};
    if (clientIds.length > 0) {
      const clientRows = await prisma.client.findMany({
        where: { id: { in: clientIds } },
        select: { id: true, companyName: true },
      });
      clientMap = Object.fromEntries(clientRows.map((c) => [c.id, c.companyName]));
    }

    return NextResponse.json({
      candidates: candidates.map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        email: c.email,
        headline: c.headline,
      })),
      clients: clients.map((c) => ({
        id: c.id,
        companyName: c.companyName,
        industry: c.industry,
      })),
      jobs: jobs.map((j) => ({
        id: j.id,
        title: j.title,
        location: j.location,
        status: j.status,
      })),
      contacts: contacts.map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        email: c.email,
        company: clientMap[c.clientId] || null,
      })),
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
