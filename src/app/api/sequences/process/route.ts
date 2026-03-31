import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

// POST: Process all active enrollments where nextActionAt <= now
export async function POST() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const now = new Date();

  // Find all due enrollments
  const dueEnrollments = await prisma.sequenceEnrollment.findMany({
    where: {
      status: "ACTIVE",
      nextActionAt: { lte: now },
    },
    include: {
      sequence: {
        include: { steps: { orderBy: { stepOrder: "asc" } } },
      },
    },
  });

  let processed = 0;
  let completed = 0;
  let errors = 0;

  for (const enrollment of dueEnrollments) {
    try {
      const steps = enrollment.sequence.steps;
      const currentStepIndex = enrollment.currentStep;

      if (currentStepIndex >= steps.length) {
        // All steps done — mark completed
        await prisma.sequenceEnrollment.update({
          where: { id: enrollment.id },
          data: { status: "COMPLETED" },
        });
        completed++;
        continue;
      }

      const step = steps[currentStepIndex];

      // Execute step action
      if (step.action === "EMAIL") {
        // Try to send via Resend or Outlook
        // For now, log the email action and create an activity
        await prisma.activity.create({
          data: {
            type: "SEQUENCE_EMAIL",
            title: `Sequence email: ${step.subject || "Follow-up"}`,
            content: `Auto follow-up email to ${enrollment.contactEmail} - Step ${step.stepOrder}: ${step.subject || "Follow-up"}`,
            userId: enrollment.enrolledBy || undefined,
            clientId: enrollment.clientId || undefined,
            candidateId: enrollment.candidateId || undefined,
            metadata: JSON.stringify({
              sequenceId: enrollment.sequenceId,
              enrollmentId: enrollment.id,
              stepOrder: step.stepOrder,
              action: step.action,
            }),
          },
        });

        // Create an email log entry for tracking
        if (enrollment.enrolledBy) {
          await prisma.emailLog.create({
            data: {
              sentById: enrollment.enrolledBy,
              toEmail: enrollment.contactEmail,
              subject: step.subject || "Follow-up",
              bodyPreview: step.body
                ? step.body.substring(0, 200)
                : "Automated follow-up",
              direction: "sent",
              status: "queued",
              clientId: enrollment.clientId || undefined,
              candidateId: enrollment.candidateId || undefined,
            },
          });
        }
      } else if (step.action === "TASK") {
        // Create a FollowUp reminder
        if (enrollment.clientId) {
          await prisma.followUp.create({
            data: {
              clientId: enrollment.clientId,
              title: step.subject || `Sequence follow-up step ${step.stepOrder}`,
              description:
                step.body ||
                `Automated task from sequence: ${enrollment.sequence.name}`,
              channel: "EMAIL",
              priority: "HIGH",
              status: "PENDING",
              dueDate: now,
              createdById: enrollment.enrolledBy || undefined,
            },
          });
        }

        await prisma.activity.create({
          data: {
            type: "SEQUENCE_TASK",
            title: `Sequence task created: ${step.subject || "Follow-up task"}`,
            content: `Task created for ${enrollment.contactEmail} - Step ${step.stepOrder}`,
            userId: enrollment.enrolledBy || undefined,
            clientId: enrollment.clientId || undefined,
            candidateId: enrollment.candidateId || undefined,
          },
        });
      } else if (step.action === "NOTIFICATION") {
        // Create Notification for the enrolled-by user or all admins
        if (enrollment.enrolledBy) {
          await prisma.notification.create({
            data: {
              userId: enrollment.enrolledBy,
              title: `Sequence reminder: ${enrollment.sequence.name}`,
              message: step.body || `Step ${step.stepOrder} reached for ${enrollment.contactEmail}`,
              type: "SEQUENCE",
              link: enrollment.clientId
                ? `/crm/clients/${enrollment.clientId}`
                : enrollment.candidateId
                  ? `/crm/candidates/${enrollment.candidateId}`
                  : "/crm/sequences",
            },
          });
        }

        await prisma.activity.create({
          data: {
            type: "SEQUENCE_NOTIFICATION",
            title: `Sequence notification: ${step.subject || "Reminder"}`,
            content: `Notification for ${enrollment.contactEmail} - Step ${step.stepOrder}`,
            userId: enrollment.enrolledBy || undefined,
            clientId: enrollment.clientId || undefined,
            candidateId: enrollment.candidateId || undefined,
          },
        });
      }

      // Advance to next step
      const nextStepIndex = currentStepIndex + 1;
      let nextActionAt: Date | null = null;
      let newStatus = "ACTIVE";

      if (nextStepIndex < steps.length) {
        nextActionAt = new Date();
        nextActionAt.setDate(
          nextActionAt.getDate() + steps[nextStepIndex].dayDelay
        );
      } else {
        newStatus = "COMPLETED";
        completed++;
      }

      await prisma.sequenceEnrollment.update({
        where: { id: enrollment.id },
        data: {
          currentStep: nextStepIndex,
          lastActionAt: now,
          nextActionAt,
          status: newStatus,
        },
      });

      processed++;
    } catch (err) {
      console.error(
        `Error processing enrollment ${enrollment.id}:`,
        err
      );
      errors++;
    }
  }

  return NextResponse.json({
    success: true,
    processed,
    completed,
    errors,
    total: dueEnrollments.length,
  });
}
