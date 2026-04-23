import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { searchPeople } from "@/lib/apollo";
import { verifyEmail as verifyViaZeroBounce } from "@/lib/zerobounce";
import { sendEmail } from "@/lib/resend";
import { classifyReply } from "@/lib/outreach-ai";
import { wrapEmailHtml } from "@/lib/email-html";

// ---------------------------------------------------------------------------
// Schedule (UK time — Europe/London)
// ---------------------------------------------------------------------------
// Monday 08:00        → discover
// Mon-Fri 08:30       → verify
// Mon-Fri 09:30       → outreach
// Mon-Fri 14:00       → followup
// Mon-Fri 15:00       → classify
// Mon-Fri 17:00       → report
// ---------------------------------------------------------------------------

type TaskName = "discover" | "verify" | "outreach" | "followup" | "classify" | "report";

function determineTask(now: Date): TaskName | null {
  // Convert to UK time
  const ukTime = new Date(
    now.toLocaleString("en-GB", { timeZone: "Europe/London" })
  );
  const hour = ukTime.getHours();
  const minute = ukTime.getMinutes();
  const dayOfWeek = ukTime.getDay(); // 0=Sun, 1=Mon...6=Sat
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const isMonday = dayOfWeek === 1;

  // Allow a 15-minute window around scheduled time
  const timeMinutes = hour * 60 + minute;

  if (isMonday && timeMinutes >= 480 && timeMinutes < 495) return "discover"; // 08:00
  if (isWeekday && timeMinutes >= 510 && timeMinutes < 525) return "verify"; // 08:30
  if (isWeekday && timeMinutes >= 570 && timeMinutes < 585) return "outreach"; // 09:30
  if (isWeekday && timeMinutes >= 840 && timeMinutes < 855) return "followup"; // 14:00
  if (isWeekday && timeMinutes >= 900 && timeMinutes < 915) return "classify"; // 15:00
  if (isWeekday && timeMinutes >= 1020 && timeMinutes < 1035) return "report"; // 17:00

  return null;
}

// ---------------------------------------------------------------------------
// Lightweight task runners (mirror of /api/automation/run logic, no auth)
// ---------------------------------------------------------------------------

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
      "Engineering Manager", "Engineering Director", "Head of Engineering",
      "Controls Manager", "Automation Manager", "Operations Director",
      "Operations Manager", "Plant Manager", "Manufacturing Director",
      "HR Manager", "Talent Acquisition Manager", "Head of Talent",
      "CTO", "Technical Director",
    ],
    industries: [
      "Manufacturing", "Energy", "Oil & Gas", "Pharmaceuticals",
      "Automotive", "Food & Beverage", "Water & Utilities",
      "Industrial Automation", "Logistics",
    ],
    companySizeMin: 50,
    companySizeMax: 1000,
    locations: ["United Kingdom"],
    dailyEmailLimit: 50,
    followUpIntervalDays: 4,
  };
}

function getSequenceType(jobTitle: string): string {
  const lower = (jobTitle || "").toLowerCase();
  if (["hr", "human resources", "talent", "people", "recruitment"].some((k) => lower.includes(k))) return "hr";
  if (["operations", "plant", "facilities", "manufacturing director", "production"].some((k) => lower.includes(k))) return "operations";
  return "engineering";
}

function getSequenceName(type: string): string {
  switch (type) {
    case "hr": return "HR Manager Sequence";
    case "operations": return "Operations Manager Sequence";
    default: return "Engineering Manager Sequence";
  }
}

function replaceTokens(
  text: string,
  tokens: Record<string, string>
): string {
  let result = text;
  for (const [key, value] of Object.entries(tokens)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return result;
}

async function cronDiscover() {
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
    return { imported: 0 };
  }

  const emails = result.contacts.map((c) => c.email).filter(Boolean);
  const [existing, suppressed] = await Promise.all([
    prisma.prospect.findMany({ where: { email: { in: emails } }, select: { email: true } }),
    prisma.suppressionList.findMany({ where: { email: { in: emails } }, select: { email: true } }),
  ]);
  const skip = new Set([...existing.map((p) => p.email), ...suppressed.map((s) => s.email)]);

  let imported = 0;
  for (const person of result.contacts) {
    if (!person.email || skip.has(person.email)) continue;
    try {
      await prisma.prospect.create({
        data: {
          firstName: person.first_name, lastName: person.last_name,
          email: person.email, company: person.company || null,
          jobTitle: person.title || null, industry: person.industry || null,
          location: person.location || null, linkedIn: person.linkedin_url || null,
          apolloId: person.id, source: "APOLLO", status: "NEW",
        },
      });
      imported++;
    } catch { /* dup */ }
  }

  await prisma.activity.create({
    data: { type: "AUTOMATION", title: "Cron: Lead Discovery", content: `Imported ${imported} prospects` },
  });

  return { imported };
}

async function cronVerify() {
  const unverified = await prisma.prospect.findMany({
    where: { status: "NEW", emailVerified: false }, take: 100,
    select: { id: true, email: true },
  });
  let valid = 0;
  let invalid = 0;
  for (const p of unverified) {
    try {
      const r = await verifyViaZeroBounce(p.email);
      if (r.isValid) {
        await prisma.prospect.update({ where: { id: p.id }, data: { emailVerified: true, verifiedAt: new Date() } });
        valid++;
      } else {
        await prisma.prospect.update({ where: { id: p.id }, data: { emailVerified: false, status: "INVALID" } });
        try {
          await prisma.suppressionList.create({ data: { email: p.email, reason: `ZeroBounce: ${r.status}`, source: "CRON_VERIFY" } });
        } catch { /* dup */ }
        invalid++;
      }
    } catch { /* skip */ }
  }
  await prisma.activity.create({
    data: { type: "AUTOMATION", title: "Cron: Email Verification", content: `Checked ${unverified.length}: ${valid} valid, ${invalid} invalid` },
  });
  return { checked: unverified.length, valid, invalid };
}

async function cronOutreach() {
  const config = await getIcpConfig();
  const enrolledEmails = await prisma.sequenceEnrollment.findMany({ select: { contactEmail: true } });
  const enrolledSet = new Set(enrolledEmails.map((e) => e.contactEmail));

  const prospects = await prisma.prospect.findMany({
    where: { emailVerified: true, status: "NEW", lastContactedAt: null },
    take: config.dailyEmailLimit,
  });
  const eligible = prospects.filter((p) => !enrolledSet.has(p.email));

  let enrolled = 0;
  let sent = 0;
  for (const prospect of eligible) {
    try {
      const seqName = getSequenceName(getSequenceType(prospect.jobTitle || ""));
      const sequence = await prisma.followUpSequence.findFirst({
        where: { name: seqName, isActive: true },
        include: { steps: { orderBy: { stepOrder: "asc" } } },
      });
      if (!sequence || sequence.steps.length === 0) continue;

      const firstStep = sequence.steps[0];
      const nextStep = sequence.steps[1];
      const nextActionAt = nextStep ? new Date(Date.now() + nextStep.dayDelay * 86400000) : null;

      await prisma.sequenceEnrollment.create({
        data: {
          sequenceId: sequence.id, contactEmail: prospect.email,
          currentStep: 1, status: "ACTIVE",
          lastActionAt: new Date(), nextActionAt,
        },
      });
      enrolled++;

      const tokens: Record<string, string> = {
        firstName: prospect.firstName, lastName: prospect.lastName,
        company: prospect.company || "your company",
        location: prospect.location || "the UK",
        industry: prospect.industry || "your industry",
        senderName: "The Oscabe Team",
      };
      const subject = replaceTokens(firstStep.subject || "", tokens);
      const body = replaceTokens(firstStep.body || "", tokens);
      const html = wrapEmailHtml(body.replace(/\n/g, "<br>"), subject);

      const r = await sendEmail({ to: prospect.email, subject, html });
      if (r.success) {
        sent++;
        await prisma.prospect.update({ where: { id: prospect.id }, data: { lastContactedAt: new Date(), status: "CONTACTED" } });
      }
    } catch { /* skip */ }
  }

  await prisma.activity.create({
    data: { type: "AUTOMATION", title: "Cron: Outreach", content: `Enrolled ${enrolled}, sent ${sent} emails` },
  });
  return { enrolled, sent };
}

async function cronFollowup() {
  const now = new Date();
  const due = await prisma.sequenceEnrollment.findMany({
    where: { status: "ACTIVE", nextActionAt: { lte: now } },
    include: { sequence: { include: { steps: { orderBy: { stepOrder: "asc" } } } } },
  });

  let processed = 0;
  let completed = 0;
  for (const enrollment of due) {
    try {
      const steps = enrollment.sequence.steps;
      if (enrollment.currentStep >= steps.length) {
        await prisma.sequenceEnrollment.update({ where: { id: enrollment.id }, data: { status: "COMPLETED" } });
        completed++;
        continue;
      }
      const step = steps[enrollment.currentStep];
      if (step.action === "EMAIL" && step.subject && step.body) {
        const prospect = await prisma.prospect.findUnique({ where: { email: enrollment.contactEmail } });
        const tokens: Record<string, string> = {
          firstName: prospect?.firstName || "there",
          lastName: prospect?.lastName || "",
          company: prospect?.company || "your company",
          location: prospect?.location || "the UK",
          industry: prospect?.industry || "your industry",
          senderName: "The Oscabe Team",
        };
        const subject = replaceTokens(step.subject, tokens);
        const body = replaceTokens(step.body, tokens);
        await sendEmail({ to: enrollment.contactEmail, subject, html: wrapEmailHtml(body.replace(/\n/g, "<br>"), subject) });
      }
      const nextIdx = enrollment.currentStep + 1;
      let nextActionAt: Date | null = null;
      let newStatus = "ACTIVE";
      if (nextIdx < steps.length) {
        nextActionAt = new Date(Date.now() + steps[nextIdx].dayDelay * 86400000);
      } else {
        newStatus = "COMPLETED";
        completed++;
      }
      await prisma.sequenceEnrollment.update({
        where: { id: enrollment.id },
        data: { currentStep: nextIdx, lastActionAt: now, nextActionAt, status: newStatus },
      });
      processed++;
    } catch { /* skip */ }
  }

  if (processed > 0) {
    await prisma.activity.create({
      data: { type: "AUTOMATION", title: "Cron: Follow-ups", content: `Processed ${processed}, completed ${completed}` },
    });
  }
  return { processed, completed };
}

async function cronClassify() {
  const unclassified = await prisma.outreachReply.findMany({
    where: { sentiment: null }, take: 50,
    include: { prospect: { select: { id: true, status: true } } },
  });
  let classified = 0;
  for (const reply of unclassified) {
    try {
      const c = await classifyReply(reply.body);
      await prisma.outreachReply.update({
        where: { id: reply.id },
        data: { sentiment: c.sentiment, aiClassification: JSON.stringify(c) },
      });
      if (reply.prospect) {
        let newStatus: string | undefined;
        if (c.sentiment === "INTERESTED" || c.sentiment === "MEETING_REQUEST") newStatus = "INTERESTED";
        else if (c.sentiment === "NOT_INTERESTED") newStatus = "REJECTED";
        if (newStatus) await prisma.prospect.update({ where: { id: reply.prospect.id }, data: { status: newStatus } });
      }
      classified++;
    } catch { /* skip */ }
  }
  if (classified > 0) {
    await prisma.activity.create({
      data: { type: "AUTOMATION", title: "Cron: Reply Classification", content: `Classified ${classified} replies` },
    });
  }
  return { classified };
}

async function cronReport() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [prospects, emails, replies, positive] = await Promise.all([
    prisma.prospect.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.sequenceEnrollment.count({ where: { lastActionAt: { gte: todayStart } } }),
    prisma.outreachReply.count({ where: { receivedAt: { gte: todayStart } } }),
    prisma.outreachReply.count({ where: { receivedAt: { gte: todayStart }, sentiment: { in: ["INTERESTED", "MEETING_REQUEST"] } } }),
  ]);
  const negative = await prisma.outreachReply.count({
    where: { receivedAt: { gte: todayStart }, sentiment: "NOT_INTERESTED" },
  });

  const date = todayStart.toISOString().split("T")[0];
  await prisma.activity.create({
    data: {
      type: "DAILY_REPORT",
      title: `Daily Report - ${date}`,
      content: `Prospects: ${prospects}, Emails: ${emails}, Replies: ${replies}, Positive: ${positive}, Negative: ${negative}`,
      metadata: JSON.stringify({ prospects, emails, replies, positive, negative }),
    },
  });

  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { email: true } });
  const htmlReport = `<h2>Daily Automation Report - ${date}</h2>
    <table style="border-collapse:collapse;width:100%;max-width:400px;">
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Prospects</td><td style="padding:8px;border:1px solid #ddd;">${prospects}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Emails</td><td style="padding:8px;border:1px solid #ddd;">${emails}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Replies</td><td style="padding:8px;border:1px solid #ddd;">${replies}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Positive</td><td style="padding:8px;border:1px solid #ddd;color:green;">${positive}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Negative</td><td style="padding:8px;border:1px solid #ddd;color:red;">${negative}</td></tr>
    </table>`;

  for (const admin of admins) {
    try { await sendEmail({ to: admin.email, subject: `Oscabe Daily Report - ${date}`, html: htmlReport }); } catch { /* skip */ }
  }

  return { prospects, emails, replies, positive, negative, adminNotified: admins.length };
}

const CRON_TASKS: Record<TaskName, () => Promise<Record<string, unknown>>> = {
  discover: cronDiscover,
  verify: cronVerify,
  outreach: cronOutreach,
  followup: cronFollowup,
  classify: cronClassify,
  report: cronReport,
};

// ---------------------------------------------------------------------------
// GET handler — called by VPS cron
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  // Verify cron secret
  const secret = req.nextUrl.searchParams.get("secret");
  const expected = process.env.AUTOMATION_CRON_SECRET;

  if (!expected) {
    return NextResponse.json(
      { error: "AUTOMATION_CRON_SECRET not configured" },
      { status: 500 }
    );
  }

  if (secret !== expected) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  // Determine which task to run based on UK time
  const now = new Date();
  const task = determineTask(now);

  if (!task) {
    return NextResponse.json({
      status: "idle",
      message: "No task scheduled for current time",
      time: now.toLocaleString("en-GB", { timeZone: "Europe/London" }),
    });
  }

  try {
    const result = await CRON_TASKS[task]();
    return NextResponse.json({
      status: "ok",
      task,
      result,
      time: now.toLocaleString("en-GB", { timeZone: "Europe/London" }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[cron] Task ${task} failed:`, err);
    return NextResponse.json(
      { status: "error", task, error: message },
      { status: 500 }
    );
  }
}
