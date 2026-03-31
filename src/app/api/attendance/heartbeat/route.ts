import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";

const IDLE_THRESHOLD_MINUTES = 20;

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const { isActive } = await request.json();

    // Find active work session
    const activeSession = await prisma.employeeWorkSession.findFirst({
      where: {
        userId: user.id,
        status: { in: ["CHECKED_IN", "IDLE"] },
      },
    });

    // Skip if no session or on break
    if (!activeSession) {
      return NextResponse.json({ status: "no_active_session" });
    }

    // Find latest open activity (endedAt is null)
    const latestActivity = await prisma.employeeActivity.findFirst({
      where: {
        sessionId: activeSession.id,
        endedAt: null,
      },
      orderBy: { startedAt: "desc" },
    });

    if (!latestActivity) {
      return NextResponse.json({ status: "no_open_activity" });
    }

    const now = new Date();

    // ACTIVE -> IDLE: if isActive=false AND current activity ACTIVE AND duration >= threshold
    if (
      !isActive &&
      latestActivity.type === "ACTIVE"
    ) {
      const durationMs = now.getTime() - latestActivity.startedAt.getTime();
      const durationMin = durationMs / (1000 * 60);

      if (durationMin >= IDLE_THRESHOLD_MINUTES) {
        await prisma.$transaction(async (tx) => {
          // End ACTIVE activity
          await tx.employeeActivity.update({
            where: { id: latestActivity.id },
            data: {
              endedAt: now,
              durationMin: Math.round(durationMin),
            },
          });

          // Create IDLE activity
          await tx.employeeActivity.create({
            data: {
              sessionId: activeSession.id,
              type: "IDLE",
              startedAt: now,
            },
          });

          // Update session status to IDLE
          await tx.employeeWorkSession.update({
            where: { id: activeSession.id },
            data: { status: "IDLE" },
          });

          // Send notification to ADMIN users
          const admins = await tx.user.findMany({
            where: { role: "ADMIN", isActive: true },
          });

          const userName = [user.firstName, user.lastName]
            .filter(Boolean)
            .join(" ") || user.email;

          if (admins.length > 0) {
            await tx.notification.createMany({
              data: admins.map((admin) => ({
                userId: admin.id,
                title: "Employee Idle Alert",
                message: `${userName} has been idle for over ${IDLE_THRESHOLD_MINUTES} minutes.`,
                type: "WARNING",
                link: `/crm/attendance`,
              })),
            });
          }
        });

        return NextResponse.json({ status: "transitioned_to_idle" });
      }
    }

    // IDLE -> ACTIVE: if isActive=true AND current activity IDLE
    if (isActive && latestActivity.type === "IDLE") {
      const durationMs = now.getTime() - latestActivity.startedAt.getTime();
      const durationMin = Math.round(durationMs / (1000 * 60));

      await prisma.$transaction(async (tx) => {
        // End IDLE activity
        await tx.employeeActivity.update({
          where: { id: latestActivity.id },
          data: {
            endedAt: now,
            durationMin,
          },
        });

        // Create ACTIVE activity
        await tx.employeeActivity.create({
          data: {
            sessionId: activeSession.id,
            type: "ACTIVE",
            startedAt: now,
          },
        });

        // Update session status back to CHECKED_IN
        await tx.employeeWorkSession.update({
          where: { id: activeSession.id },
          data: { status: "CHECKED_IN" },
        });
      });

      return NextResponse.json({ status: "transitioned_to_active" });
    }

    return NextResponse.json({ status: "no_change" });
  } catch (error) {
    console.error("Heartbeat error:", error);
    return NextResponse.json(
      { error: "Heartbeat processing failed" },
      { status: 500 }
    );
  }
}
