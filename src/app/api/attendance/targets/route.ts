import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";

interface TargetConfig {
  [role: string]: Record<string, number>;
}

const DEFAULT_TARGETS: TargetConfig = {
  RECRUITER: {
    candidatesSourced: 20,
    emailsSent: 10,
    callsMade: 5,
    applicationsSubmitted: 2,
    interviewsScheduled: 1,
  },
  ADMIN: {
    dataEntries: 50,
    screenings: 10,
    emailsSent: 15,
  },
  SALES: {
    clientsContacted: 10,
    emailsSent: 15,
    callsMade: 8,
    proposalsSent: 2,
  },
};

async function getTargets(): Promise<TargetConfig> {
  try {
    // Store targets in an Activity record with a special type, or use metadata
    // We use a convention: Activity with type "SYSTEM_CONFIG" and title "daily_targets"
    const config = await prisma.activity.findFirst({
      where: { type: "SYSTEM_CONFIG", title: "daily_targets" },
      orderBy: { createdAt: "desc" },
    });
    if (config?.metadata) {
      return JSON.parse(config.metadata) as TargetConfig;
    }
  } catch {
    // fallback to defaults
  }
  return DEFAULT_TARGETS;
}

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const targets = await getTargets();
    const userRole = user.role?.toUpperCase() || "RECRUITER";
    const roleTargets = targets[userRole] || targets["RECRUITER"] || {};

    return NextResponse.json({
      targets,
      userTargets: roleTargets,
      userRole,
    });
  } catch (err) {
    console.error("Targets GET error:", err);
    return NextResponse.json({ error: "Failed to fetch targets" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { role, targets: newTargets } = body;

    if (!role || !newTargets) {
      return NextResponse.json({ error: "role and targets are required" }, { status: 400 });
    }

    const currentTargets = await getTargets();
    currentTargets[role.toUpperCase()] = newTargets;

    // Upsert by creating a new config record (latest wins)
    await prisma.activity.create({
      data: {
        type: "SYSTEM_CONFIG",
        title: "daily_targets",
        metadata: JSON.stringify(currentTargets),
        userId: user.id,
      },
    });

    return NextResponse.json({ message: "Targets updated", targets: currentTargets });
  } catch (err) {
    console.error("Targets PUT error:", err);
    return NextResponse.json({ error: "Failed to update targets" }, { status: 500 });
  }
}
