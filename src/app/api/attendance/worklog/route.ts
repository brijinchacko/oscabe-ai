import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const { description, type } = await request.json();

    if (!description || !type) {
      return NextResponse.json(
        { error: "description and type are required" },
        { status: 400 }
      );
    }

    const validTypes = ["TASK", "CALL", "MEETING", "NOTE"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const activeSession = await prisma.employeeWorkSession.findFirst({
      where: {
        userId: user.id,
        status: { in: ["CHECKED_IN", "ON_BREAK", "IDLE"] },
      },
    });

    if (!activeSession) {
      return NextResponse.json(
        { error: "No active session. Please check in first." },
        { status: 400 }
      );
    }

    const now = new Date();

    const activity = await prisma.employeeActivity.create({
      data: {
        sessionId: activeSession.id,
        type,
        startedAt: now,
        endedAt: now,
        durationMin: 0,
        description: `${type}: ${description}`,
      },
    });

    return NextResponse.json(
      { message: "Work log added", activity },
      { status: 201 }
    );
  } catch (error) {
    console.error("Worklog error:", error);
    return NextResponse.json(
      { error: "Failed to add work log" },
      { status: 500 }
    );
  }
}
