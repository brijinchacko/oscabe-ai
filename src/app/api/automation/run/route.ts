import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { searchPeople } from "@/lib/apollo";
import { verifyEmail as verifyViaZeroBounce } from "@/lib/zerobounce";
import { sendEmail } from "@/lib/resend";
import { classifyReply } from "@/lib/outreach-ai";
import { wrapEmailHtml } from "@/lib/email-html";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type TaskName =
  | "discover"
  | "verify"
  | "outreach"
  | "followup"
  | "classify"
  | "report"
  | "all";

interface TaskResult {
  task: string;
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

/** Fetch the latest ICP config or return defaults */
async function getIcpConfig() {
  const record = await prisma.activity.findFirst({
    where: { type: "SYSTEM_CONFIG", title: "ICP_CONFIG" },
    orderBy: { createdAt: "desc" },
  });
  if (record?.content) {
    try {
      return JSON.parse(record.content);
    } catch {
      /* fall through */
    }
  }
  return {
    jobTitles: [
      "Engineering Manager",
      "Engineering Director",
      "Head of Engineering",
      "Controls Manager",
      "Automation Manager",
      "Operations Director",
      "Operations Manager",
      "Plant Manager",
      "Manufacturing Director",
      "HR Manager",
      "Talent Acquisition Manager",
      "Head of Talent",
      "CTO",
      "Technical Director",
    ],
    industries: [
      "Manufacturing",
      "Energy",
      "Oil & Gas",
      "Pharmaceuticals",
      "Automotive",
      "Food & Beverage",
      "Water & Utilities",
      "Industrial Automation",
      "Logistics",
    ],
    companySizeMin: 50,
    companySizeMax: 1000,
    locations: ["United Kingdom"],
    dailyEmailLimit: 50,
    followUpIntervalDays: 4,
  };
}

/** Determine persona sequence type from job title */
function getSequenceType(jobTitle: string): string {
  const lower = (jobTitle || "").toLowerCase();
  const hrKeywords = [
    "hr",
    "human resources",
    "talent",
    "people",
    "recruitment",
  ];
  const opsKeywords = [
    "operations",
    "plant",
    "facilities",
    "manufacturing director",
    "production",
  ];
  if (hrKeywords.some((k) => lower.includes(k))) return "hr";
  if (opsKeywords.some((k) => lower.includes(k))) return "operations";
  return "engineering";
}

/** Map sequence type to the seeded sequence name */
function getSequenceName(type: string): string {
  switch (type) {
    case "hr":
      return "HR Manager Sequence";
    case "operations":
      return "Operations Manager Sequence";
    default:
      return "Engineering Manager Sequence";
  }
}

// ---------------------------------------------------------------------------
// Task implementations
// ---------------------------------------------------------------------------

async function runDiscover(userId: string): Promise<TaskResult> {
  try {
    const config = await getIcpConfig();
    const result = await searchPeople({
      job_titles: config.jobTitles,
      industries: config.industries,
      locations: config.locations,
      company_size_min: config.companySizeMin,
      company_size_max: config.companySizeMax,
      per_page: 100,
    });

    if (!result.contacts || result.contacts.length === 0) {
      return {
        task: "discover",
        success: true,
        data: { imported: 0, message: "No prospects found from Apollo" },
      };
    }

    // Deduplicate against existing prospects and suppression list
    const emails = result.contacts
      .map((c) => c.email)
      .filter(Boolean);
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

    let imported = 0;
    for (const person of result.contacts) {
      if (!person.email || existingSet.has(person.email)) continue;
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
        // Skip duplicates
      }
    }

    await prisma.activity.create({
      data: {
        type: "AUTOMATION",
        title: "Lead Discovery",
        content: `Discovered ${imported} new prospects from Apollo (${result.contacts.length} total, ${result.contacts.length - imported} duplicates/suppressed)`,
        userId,
      },
    });

    return {
      task: "discover",
      success: true,
      data: {
        imported,
        total: result.contacts.length,
        skipped: result.contacts.length - imported,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { task: "discover", success: false, error: message };
  }
}

async function runVerify(userId: string): Promise<TaskResult> {
  try {
    const unverified = await prisma.prospect.findMany({
      where: { status: "NEW", emailVerified: false },
      take: 100,
      select: { id: true, email: true },
    });

    if (unverified.length === 0) {
      return {
        task: "verify",
        success: true,
        data: { verified: 0, message: "No unverified prospects" },
      };
    }

    let valid = 0;
    let invalid = 0;

    for (const prospect of unverified) {
      try {
        const result = await verifyViaZeroBounce(prospect.email);
        if (result.isValid) {
          await prisma.prospect.update({
            where: { id: prospect.id },
            data: { emailVerified: true, verifiedAt: new Date() },
          });
          valid++;
        } else {
          await prisma.prospect.update({
            where: { id: prospect.id },
            data: { emailVerified: false, status: "INVALID" },
          });
          // Add to suppression list
          try {
            await prisma.suppressionList.create({
              data: {
                email: prospect.email,
                reason: `ZeroBounce: ${result.status} (${result.subStatus})`,
                source: "AUTOMATION_VERIFY",
              },
            });
          } catch {
            // Already in suppression list
          }
          invalid++;
        }
      } catch {
        // Skip on individual error
      }
    }

    await prisma.activity.create({
      data: {
        type: "AUTOMATION",
        title: "Email Verification",
        content: `Verified ${unverified.length} emails: ${valid} valid, ${invalid} invalid`,
        userId,
      },
    });

    return {
      task: "verify",
      success: true,
      data: { checked: unverified.length, valid, invalid },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { task: "verify", success: false, error: message };
  }
}

async function runOutreach(userId: string): Promise<TaskResult> {
  try {
    const config = await getIcpConfig();

    // Find verified prospects not yet contacted (no sequence enrollment)
    const enrolledEmails = await prisma.sequenceEnrollment.findMany({
      select: { contactEmail: true },
    });
    const enrolledSet = new Set(enrolledEmails.map((e) => e.contactEmail));

    const prospects = await prisma.prospect.findMany({
      where: {
        emailVerified: true,
        status: "NEW",
        lastContactedAt: null,
      },
      take: config.dailyEmailLimit,
    });

    const eligible = prospects.filter((p) => !enrolledSet.has(p.email));

    if (eligible.length === 0) {
      return {
        task: "outreach",
        success: true,
        data: { enrolled: 0, message: "No eligible prospects for outreach" },
      };
    }

    let enrolled = 0;
    let emailsSent = 0;

    for (const prospect of eligible) {
      try {
        // Determine persona sequence
        const seqType = getSequenceType(prospect.jobTitle || "");
        const seqName = getSequenceName(seqType);

        // Find the matching sequence
        const sequence = await prisma.followUpSequence.findFirst({
          where: { name: seqName, isActive: true },
          include: { steps: { orderBy: { stepOrder: "asc" } } },
        });

        if (!sequence || sequence.steps.length === 0) continue;

        const firstStep = sequence.steps[0];

        // Create enrollment
        const nextStep = sequence.steps[1];
        const nextActionAt = nextStep
          ? new Date(Date.now() + nextStep.dayDelay * 86400000)
          : null;

        await prisma.sequenceEnrollment.create({
          data: {
            sequenceId: sequence.id,
            contactEmail: prospect.email,
            currentStep: 1,
            status: "ACTIVE",
            lastActionAt: new Date(),
            nextActionAt,
            enrolledBy: userId,
          },
        });
        enrolled++;

        // Send step 1 email immediately
        const subject = (firstStep.subject || "")
          .replace(/\{\{firstName\}\}/g, prospect.firstName)
          .replace(/\{\{lastName\}\}/g, prospect.lastName)
          .replace(/\{\{company\}\}/g, prospect.company || "your company")
          .replace(/\{\{location\}\}/g, prospect.location || "the UK")
          .replace(/\{\{industry\}\}/g, prospect.industry || "your industry");

        const body = (firstStep.body || "")
          .replace(/\{\{firstName\}\}/g, prospect.firstName)
          .replace(/\{\{lastName\}\}/g, prospect.lastName)
          .replace(/\{\{company\}\}/g, prospect.company || "your company")
          .replace(/\{\{location\}\}/g, prospect.location || "the UK")
          .replace(/\{\{industry\}\}/g, prospect.industry || "your industry")
          .replace(/\{\{senderName\}\}/g, "The Oscabe Team");

        const html = wrapEmailHtml(
          body.replace(/\n/g, "<br>"),
          subject
        );

        const emailResult = await sendEmail({
          to: prospect.email,
          subject,
          html,
        });

        if (emailResult.success) {
          emailsSent++;
          await prisma.prospect.update({
            where: { id: prospect.id },
            data: { lastContactedAt: new Date(), status: "CONTACTED" },
          });
        }
      } catch {
        // Skip individual failures
      }
    }

    // Log activity
    await prisma.activity.create({
      data: {
        type: "AUTOMATION",
        title: "Outreach Sent",
        content: `Enrolled ${enrolled} prospects into sequences, sent ${emailsSent} initial emails`,
        userId,
      },
    });

    // Notify admins
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: "Outreach batch completed",
          message: `${emailsSent} emails sent to ${enrolled} new prospects`,
          type: "AUTOMATION",
          link: "/crm/automation",
        },
      });
    }

    return {
      task: "outreach",
      success: true,
      data: { enrolled, emailsSent },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { task: "outreach", success: false, error: message };
  }
}

async function runFollowup(userId: string): Promise<TaskResult> {
  try {
    const now = new Date();
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

    for (const enrollment of dueEnrollments) {
      try {
        const steps = enrollment.sequence.steps;
        const currentStepIndex = enrollment.currentStep;

        if (currentStepIndex >= steps.length) {
          await prisma.sequenceEnrollment.update({
            where: { id: enrollment.id },
            data: { status: "COMPLETED" },
          });
          completed++;
          continue;
        }

        const step = steps[currentStepIndex];

        if (step.action === "EMAIL" && step.subject && step.body) {
          // Lookup prospect for token replacement
          const prospect = await prisma.prospect.findUnique({
            where: { email: enrollment.contactEmail },
          });

          const firstName = prospect?.firstName || "there";
          const company = prospect?.company || "your company";
          const location = prospect?.location || "the UK";
          const industry = prospect?.industry || "your industry";

          const subject = (step.subject || "")
            .replace(/\{\{firstName\}\}/g, firstName)
            .replace(/\{\{company\}\}/g, company)
            .replace(/\{\{location\}\}/g, location)
            .replace(/\{\{industry\}\}/g, industry);

          const body = (step.body || "")
            .replace(/\{\{firstName\}\}/g, firstName)
            .replace(/\{\{company\}\}/g, company)
            .replace(/\{\{location\}\}/g, location)
            .replace(/\{\{industry\}\}/g, industry)
            .replace(/\{\{senderName\}\}/g, "The Oscabe Team");

          const html = wrapEmailHtml(
            body.replace(/\n/g, "<br>"),
            subject
          );

          await sendEmail({
            to: enrollment.contactEmail,
            subject,
            html,
          });
        }

        // Advance to next step
        const nextStepIndex = currentStepIndex + 1;
        let nextActionAt: Date | null = null;
        let newStatus = "ACTIVE";

        if (nextStepIndex < steps.length) {
          nextActionAt = new Date(
            Date.now() + steps[nextStepIndex].dayDelay * 86400000
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
      } catch {
        // Skip individual errors
      }
    }

    if (processed > 0) {
      await prisma.activity.create({
        data: {
          type: "AUTOMATION",
          title: "Follow-ups Processed",
          content: `Processed ${processed} follow-ups, ${completed} sequences completed`,
          userId,
        },
      });
    }

    return {
      task: "followup",
      success: true,
      data: { total: dueEnrollments.length, processed, completed },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { task: "followup", success: false, error: message };
  }
}

async function runClassify(userId: string): Promise<TaskResult> {
  try {
    const unclassified = await prisma.outreachReply.findMany({
      where: { sentiment: null },
      take: 50,
      include: {
        prospect: { select: { id: true, status: true } },
      },
    });

    if (unclassified.length === 0) {
      return {
        task: "classify",
        success: true,
        data: { classified: 0, message: "No unclassified replies" },
      };
    }

    let classified = 0;
    const sentimentCounts: Record<string, number> = {};

    for (const reply of unclassified) {
      try {
        const classification = await classifyReply(reply.body);

        await prisma.outreachReply.update({
          where: { id: reply.id },
          data: {
            sentiment: classification.sentiment,
            aiClassification: JSON.stringify(classification),
          },
        });

        // Update prospect status based on classification
        if (reply.prospect) {
          let newStatus: string | undefined;
          if (classification.sentiment === "INTERESTED" || classification.sentiment === "MEETING_REQUEST") {
            newStatus = "INTERESTED";
          } else if (classification.sentiment === "NOT_INTERESTED") {
            newStatus = "REJECTED";
          }
          if (newStatus) {
            await prisma.prospect.update({
              where: { id: reply.prospect.id },
              data: { status: newStatus },
            });
          }
        }

        sentimentCounts[classification.sentiment] =
          (sentimentCounts[classification.sentiment] || 0) + 1;
        classified++;
      } catch {
        // Skip individual errors
      }
    }

    await prisma.activity.create({
      data: {
        type: "AUTOMATION",
        title: "Replies Classified",
        content: `Classified ${classified} replies: ${Object.entries(sentimentCounts)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")}`,
        userId,
      },
    });

    return {
      task: "classify",
      success: true,
      data: { classified, sentiments: sentimentCounts },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { task: "classify", success: false, error: message };
  }
}

async function runReport(userId: string): Promise<TaskResult> {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      prospectsToday,
      emailsSentToday,
      repliesToday,
      positiveToday,
    ] = await Promise.all([
      prisma.prospect.count({
        where: { createdAt: { gte: todayStart } },
      }),
      prisma.sequenceEnrollment.count({
        where: { lastActionAt: { gte: todayStart } },
      }),
      prisma.outreachReply.count({
        where: { receivedAt: { gte: todayStart } },
      }),
      prisma.outreachReply.count({
        where: {
          receivedAt: { gte: todayStart },
          sentiment: { in: ["INTERESTED", "MEETING_REQUEST"] },
        },
      }),
    ]);

    const negativeToday = await prisma.outreachReply.count({
      where: {
        receivedAt: { gte: todayStart },
        sentiment: "NOT_INTERESTED",
      },
    });

    const reportContent = [
      `Daily Automation Report - ${todayStart.toISOString().split("T")[0]}`,
      ``,
      `New Prospects: ${prospectsToday}`,
      `Emails Sent / Follow-ups: ${emailsSentToday}`,
      `Replies Received: ${repliesToday}`,
      `Positive Responses: ${positiveToday}`,
      `Negative Responses: ${negativeToday}`,
    ].join("\n");

    // Store report as activity
    await prisma.activity.create({
      data: {
        type: "DAILY_REPORT",
        title: `Daily Report - ${todayStart.toISOString().split("T")[0]}`,
        content: reportContent,
        userId,
        metadata: JSON.stringify({
          prospectsToday,
          emailsSentToday,
          repliesToday,
          positiveToday,
          negativeToday,
        }),
      },
    });

    // Send summary email to all admin users
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { email: true, firstName: true },
    });

    const htmlReport = `
      <h2>Daily Automation Report</h2>
      <p><strong>Date:</strong> ${todayStart.toISOString().split("T")[0]}</p>
      <table style="border-collapse:collapse;width:100%;max-width:400px;">
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">New Prospects</td><td style="padding:8px;border:1px solid #ddd;">${prospectsToday}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Emails Sent</td><td style="padding:8px;border:1px solid #ddd;">${emailsSentToday}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Replies</td><td style="padding:8px;border:1px solid #ddd;">${repliesToday}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Positive</td><td style="padding:8px;border:1px solid #ddd;color:green;">${positiveToday}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Negative</td><td style="padding:8px;border:1px solid #ddd;color:red;">${negativeToday}</td></tr>
      </table>
    `;

    for (const admin of admins) {
      try {
        await sendEmail({
          to: admin.email,
          subject: `Oscabe Daily Report - ${todayStart.toISOString().split("T")[0]}`,
          html: htmlReport,
        });
      } catch {
        // Non-critical
      }
    }

    return {
      task: "report",
      success: true,
      data: {
        prospectsToday,
        emailsSentToday,
        repliesToday,
        positiveToday,
        negativeToday,
        adminNotified: admins.length,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { task: "report", success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

const TASK_MAP: Record<
  Exclude<TaskName, "all">,
  (userId: string) => Promise<TaskResult>
> = {
  discover: runDiscover,
  verify: runVerify,
  outreach: runOutreach,
  followup: runFollowup,
  classify: runClassify,
  report: runReport,
};

const VALID_TASKS: TaskName[] = [
  "discover",
  "verify",
  "outreach",
  "followup",
  "classify",
  "report",
  "all",
];

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const task = body.task as TaskName;

  if (!task || !VALID_TASKS.includes(task)) {
    return NextResponse.json(
      {
        error: `Invalid task. Must be one of: ${VALID_TASKS.join(", ")}`,
      },
      { status: 400 }
    );
  }

  const userId = user!.id;

  if (task === "all") {
    // Run all tasks in sequence
    const pipeline: Exclude<TaskName, "all">[] = [
      "discover",
      "verify",
      "outreach",
      "followup",
      "classify",
      "report",
    ];
    const results: TaskResult[] = [];

    for (const t of pipeline) {
      const result = await TASK_MAP[t](userId);
      results.push(result);
    }

    return NextResponse.json({
      success: results.every((r) => r.success),
      results,
    });
  }

  const result = await TASK_MAP[task](userId);
  return NextResponse.json(result);
}
