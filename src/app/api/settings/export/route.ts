import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(headers: string[], rows: Record<string, unknown>[]): string {
  const headerLine = headers.map(escapeCsv).join(",");
  const dataLines = rows.map((row) =>
    headers.map((h) => escapeCsv(row[h])).join(",")
  );
  return [headerLine, ...dataLines].join("\n");
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");

    if (!type || !["candidates", "clients", "jobs", "placements"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be candidates, clients, jobs, or placements" },
        { status: 400 }
      );
    }

    let csv = "";
    let filename = "";

    if (type === "candidates") {
      const data = await prisma.candidate.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          location: true,
          status: true,
          source: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });
      const rows = data.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      }));
      csv = toCsv(
        ["id", "firstName", "lastName", "email", "phone", "location", "status", "source", "createdAt"],
        rows
      );
      filename = "candidates.csv";
    } else if (type === "clients") {
      const data = await prisma.client.findMany({
        select: {
          id: true,
          companyName: true,
          industry: true,
          location: true,
          pipelineStage: true,
          source: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });
      const rows = data.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      }));
      csv = toCsv(
        ["id", "companyName", "industry", "location", "pipelineStage", "source", "createdAt"],
        rows
      );
      filename = "clients.csv";
    } else if (type === "jobs") {
      const data = await prisma.job.findMany({
        select: {
          id: true,
          title: true,
          location: true,
          contractType: true,
          status: true,
          source: true,
          salaryMin: true,
          salaryMax: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });
      const rows = data.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      }));
      csv = toCsv(
        ["id", "title", "location", "contractType", "status", "source", "salaryMin", "salaryMax", "createdAt"],
        rows
      );
      filename = "jobs.csv";
    } else {
      const data = await prisma.placement.findMany({
        select: {
          id: true,
          role: true,
          salary: true,
          feeAmount: true,
          feePercent: true,
          startDate: true,
          source: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });
      const rows = data.map((r) => ({
        ...r,
        startDate: r.startDate.toISOString(),
        createdAt: r.createdAt.toISOString(),
      }));
      csv = toCsv(
        ["id", "role", "salary", "feeAmount", "feePercent", "startDate", "source", "status", "createdAt"],
        rows
      );
      filename = "placements.csv";
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Failed to export:", error);
    return NextResponse.json(
      { error: "Failed to generate export" },
      { status: 500 }
    );
  }
}
