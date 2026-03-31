import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/resend";
import { replaceTokens, generateUnsubscribeLink } from "@/lib/email-tokens";
import { wrapEmailHtml } from "@/lib/email-html";

type RouteContext = { params: Promise<{ id: string }> };

interface RecipientQuery {
  status?: string;
  location?: string;
  source?: string;
  industry?: string;
  pipelineStage?: string;
  skills?: string[];
}

function buildCandidateWhere(query: RecipientQuery): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  if (query.status) where.status = query.status;
  if (query.location) where.location = { contains: query.location };
  if (query.source) where.source = query.source;
  if (query.skills && query.skills.length > 0) {
    where.skills = {
      some: {
        skill: {
          name: { in: query.skills },
        },
      },
    };
  }
  return where;
}

function buildClientWhere(query: RecipientQuery): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  if (query.industry) where.industry = query.industry;
  if (query.pipelineStage) where.pipelineStage = query.pipelineStage;
  if (query.location) where.location = { contains: query.location };
  return where;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { id } = await context.params;

    const campaign = await prisma.emailCampaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.status === "SENT") {
      return NextResponse.json({ error: "Campaign has already been sent" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const senderName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "OSCABE";
    const senderEmail = user?.email || "info@oscabe.com";

    // Parse recipient query
    let recipientQuery: RecipientQuery = {};
    if (campaign.recipientQuery) {
      try {
        recipientQuery = JSON.parse(campaign.recipientQuery);
      } catch {
        return NextResponse.json({ error: "Invalid recipientQuery JSON" }, { status: 400 });
      }
    }

    // Build list of recipients with email, name, and token data
    interface Recipient {
      email: string;
      name: string;
      tokenData: Record<string, string | undefined>;
    }

    const recipients: Recipient[] = [];

    if (campaign.recipientType === "CANDIDATES") {
      const where = buildCandidateWhere(recipientQuery);
      const candidates = await prisma.candidate.findMany({
        where,
        include: {
          skills: {
            include: { skill: true },
            orderBy: { proficiency: "desc" },
          },
        },
      });

      for (const c of candidates) {
        const skillNames = c.skills.map((cs) => cs.skill.name);
        recipients.push({
          email: c.email,
          name: `${c.firstName} ${c.lastName}`,
          tokenData: {
            "{{firstName}}": c.firstName,
            "{{lastName}}": c.lastName,
            "{{fullName}}": `${c.firstName} ${c.lastName}`,
            "{{email}}": c.email,
            "{{location}}": c.location || "",
            "{{topSkill}}": skillNames[0] || "",
            "{{skills}}": skillNames.join(", "),
            "{{senderName}}": senderName,
            "{{senderEmail}}": senderEmail,
          },
        });
      }
    } else {
      // CLIENTS - send to each contact that has an email
      const where = buildClientWhere(recipientQuery);
      const clients = await prisma.client.findMany({
        where,
        include: {
          contacts: true,
        },
      });

      for (const client of clients) {
        const contactsWithEmail = client.contacts.filter((ct) => ct.email);
        for (const contact of contactsWithEmail) {
          recipients.push({
            email: contact.email!,
            name: `${contact.firstName} ${contact.lastName}`,
            tokenData: {
              "{{firstName}}": contact.firstName,
              "{{lastName}}": contact.lastName,
              "{{fullName}}": `${contact.firstName} ${contact.lastName}`,
              "{{email}}": contact.email!,
              "{{companyName}}": client.companyName,
              "{{contactName}}": `${contact.firstName} ${contact.lastName}`,
              "{{senderName}}": senderName,
              "{{senderEmail}}": senderEmail,
            },
          });
        }
      }
    }

    // Filter out recipients without marketing GDPR consent
    const recipientEmails = recipients.map((r) => r.email);
    const gdprRecords = await prisma.gdprConsent.findMany({
      where: {
        email: { in: recipientEmails },
        consentType: "MARKETING",
        consented: true,
        withdrawnAt: null,
      },
    });
    const consentedEmails = new Set(gdprRecords.map((g) => g.email));

    // Mark campaign as sending
    await prisma.emailCampaign.update({
      where: { id },
      data: { status: "SENDING" },
    });

    let sent = 0;
    let skipped = 0;
    let errors = 0;
    const BATCH_SIZE = 10;

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);

      const batchPromises = batch.map(async (recipient) => {
        // Check GDPR consent
        if (!consentedEmails.has(recipient.email)) {
          skipped++;
          return;
        }

        try {
          // Generate unsubscribe link and add to token data
          const unsubscribeLink = generateUnsubscribeLink(recipient.email);
          recipient.tokenData["{{unsubscribeLink}}"] = unsubscribeLink;

          // Replace tokens in subject and body
          const personalizedSubject = replaceTokens(campaign.subject, recipient.tokenData);
          const personalizedBody = replaceTokens(campaign.body, recipient.tokenData);

          // Wrap in HTML email template
          const html = wrapEmailHtml(personalizedBody, personalizedSubject);

          // Send via Resend
          const result = await sendEmail({
            to: recipient.email,
            subject: personalizedSubject,
            html,
          });

          // Create EmailLog record
          await prisma.emailLog.create({
            data: {
              campaignId: id,
              sentById: user?.id,
              toEmail: recipient.email,
              toName: recipient.name,
              subject: personalizedSubject,
              status: result.success ? "sent" : "failed",
              resendId: result.id || null,
            },
          });

          if (result.success) {
            // Increment campaign sentCount
            await prisma.emailCampaign.update({
              where: { id },
              data: { sentCount: { increment: 1 } },
            });
            sent++;
          } else {
            errors++;
          }
        } catch (err) {
          console.error(`Failed to send to ${recipient.email}:`, err);
          errors++;
        }
      });

      await Promise.all(batchPromises);

      // Small delay between batches to avoid rate limits
      if (i + BATCH_SIZE < recipients.length) {
        await sleep(200);
      }
    }

    // Update campaign status to SENT
    await prisma.emailCampaign.update({
      where: { id },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });

    return NextResponse.json({ sent, skipped, errors });
  } catch (error) {
    console.error("Campaign send error:", error);
    return NextResponse.json({ error: "Failed to send campaign" }, { status: 500 });
  }
}
