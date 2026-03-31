import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { getEmails } from "@/lib/microsoft";

interface EmailAddress {
  emailAddress: { name: string; address: string };
}

interface GraphEmail {
  id: string;
  subject?: string;
  from?: EmailAddress;
  toRecipients?: EmailAddress[];
  ccRecipients?: EmailAddress[];
  receivedDateTime?: string;
  bodyPreview?: string;
  isRead?: boolean;
  conversationId?: string;
}

// ─── Response Classification ────────────────────────────────────────────

const POSITIVE_KEYWORDS = [
  "interested", "yes", "let's talk", "lets talk", "schedule", "available",
  "send me", "tell me more", "sounds good", "great", "love to", "happy to",
  "look forward", "keen", "absolutely", "when can we", "set up a call",
  "book a meeting", "let's discuss", "lets discuss", "perfect",
];

const NEGATIVE_KEYWORDS = [
  "not interested", "no thank you", "no thanks", "remove me", "unsubscribe",
  "not looking", "already have", "pass on this", "not right now",
  "not at this time", "decline", "not for us", "no need", "stop emailing",
  "do not contact", "please remove", "opt out",
];

const OOO_KEYWORDS = [
  "out of office", "ooo", "annual leave", "vacation", "will return",
  "away from", "on leave", "auto-reply", "automatic reply", "currently away",
  "limited access", "returning on",
];

function classifyEmailBody(body: string): {
  classification: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "OUT_OF_OFFICE";
  keywords: string[];
} {
  const lower = body.toLowerCase();
  const matched: string[] = [];

  // Check OOO first
  for (const kw of OOO_KEYWORDS) {
    if (lower.includes(kw)) matched.push(kw);
  }
  if (matched.length > 0) return { classification: "OUT_OF_OFFICE", keywords: matched };

  // Check negative
  let negScore = 0;
  let posScore = 0;
  for (const kw of NEGATIVE_KEYWORDS) {
    if (lower.includes(kw)) { negScore++; matched.push(kw); }
  }
  for (const kw of POSITIVE_KEYWORDS) {
    if (lower.includes(kw)) { posScore++; matched.push(kw); }
  }

  if (negScore > posScore && negScore > 0) return { classification: "NEGATIVE", keywords: matched };
  if (posScore > 0) return { classification: "POSITIVE", keywords: matched };
  return { classification: "NEUTRAL", keywords: [] };
}

export async function POST() {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    // Fetch last 100 emails from inbox and sent
    const [inboxResult, sentResult] = await Promise.all([
      getEmails(user!.id, undefined, 50, 0, "inbox"),
      getEmails(user!.id, undefined, 50, 0, "sent"),
    ]);

    const inboxEmails: GraphEmail[] = inboxResult.value || [];
    const sentEmails: GraphEmail[] = sentResult.value || [];

    // Tag direction
    const allEmails = [
      ...inboxEmails.map((e) => ({ ...e, _direction: "received" as const })),
      ...sentEmails.map((e) => ({ ...e, _direction: "sent" as const })),
    ];

    // Get all contact and candidate email addresses for matching
    const contacts = await prisma.contact.findMany({
      where: { email: { not: null } },
      select: { email: true, clientId: true },
    });
    const candidates = await prisma.candidate.findMany({
      select: { email: true, id: true },
    });

    const contactEmailMap = new Map<string, string>();
    for (const c of contacts) {
      if (c.email) contactEmailMap.set(c.email.toLowerCase(), c.clientId);
    }
    const candidateEmailMap = new Map<string, string>();
    for (const c of candidates) {
      candidateEmailMap.set(c.email.toLowerCase(), c.id);
    }

    // Get user's Microsoft email for direction detection
    const userEmail = user!.microsoftEmail?.toLowerCase() || user!.email.toLowerCase();

    let syncCount = 0;
    let linkedCandidates = 0;
    let linkedClients = 0;
    let skippedCount = 0;

    for (const email of allEmails) {
      const messageId = email.id;
      if (!messageId) continue;

      // Skip if already synced by microsoftMessageId
      const existing = await prisma.emailLog.findUnique({
        where: { microsoftMessageId: messageId },
      });
      if (existing) {
        skippedCount++;
        continue;
      }

      // Extract ALL email addresses: from, to, cc
      const fromAddress = (email.from?.emailAddress?.address || "").toLowerCase();
      const fromName = email.from?.emailAddress?.name || "";
      const toAddresses = (email.toRecipients || []).map(
        (r: EmailAddress) => r.emailAddress.address.toLowerCase()
      );
      const ccAddresses = (email.ccRecipients || []).map(
        (r: EmailAddress) => r.emailAddress.address.toLowerCase()
      );
      const allAddresses = [fromAddress, ...toAddresses, ...ccAddresses].filter(Boolean);

      // Determine direction
      const direction = email._direction === "sent" ? "sent" : "received";

      // Match addresses against candidates and contacts
      let matchedCandidateId: string | undefined;
      let matchedClientId: string | undefined;

      for (const addr of allAddresses) {
        if (addr === userEmail) continue; // Skip user's own address
        if (!matchedCandidateId && candidateEmailMap.has(addr)) {
          matchedCandidateId = candidateEmailMap.get(addr);
        }
        if (!matchedClientId && contactEmailMap.has(addr)) {
          matchedClientId = contactEmailMap.get(addr);
        }
      }

      // Only create records for emails that match at least one entity
      if (!matchedCandidateId && !matchedClientId) continue;

      // Build to field
      const toEmail = toAddresses[0] || "";
      const toName = email.toRecipients?.[0]?.emailAddress?.name || "";

      // Create EmailLog
      await prisma.emailLog.create({
        data: {
          sentById: user!.id,
          toEmail,
          toName: toName || undefined,
          fromEmail: fromAddress,
          fromName: fromName || undefined,
          subject: email.subject || "(No Subject)",
          bodyPreview: email.bodyPreview || "",
          direction,
          status: "synced",
          microsoftMessageId: messageId,
          emailDate: email.receivedDateTime ? new Date(email.receivedDateTime) : new Date(),
          candidateId: matchedCandidateId || undefined,
          clientId: matchedClientId || undefined,
        },
      });

      // Create Activity record
      const activityType = direction === "sent" ? "EMAIL_SENT" : "EMAIL_RECEIVED";
      const activityTitle =
        direction === "sent"
          ? `Email sent: ${email.subject || "(No Subject)"}`
          : `Email received: ${email.subject || "(No Subject)"}`;
      const activityContent =
        direction === "sent"
          ? `To: ${toName || toEmail}`
          : `From: ${fromName || fromAddress}`;

      await prisma.activity.create({
        data: {
          type: activityType,
          title: activityTitle,
          content: activityContent,
          userId: user!.id,
          candidateId: matchedCandidateId || undefined,
          clientId: matchedClientId || undefined,
        },
      });

      // ── Auto-classify incoming emails ──────────────────────────────
      if (direction === "received" && (matchedClientId || matchedCandidateId)) {
        const bodyText = email.bodyPreview || "";
        const { classification, keywords } = classifyEmailBody(bodyText);

        // Store classification in activity metadata
        if (classification !== "NEUTRAL") {
          await prisma.activity.create({
            data: {
              type: "EMAIL_CLASSIFIED",
              title: `Email classified: ${classification}`,
              content: `Response from ${fromName || fromAddress} classified as ${classification}. Keywords: ${keywords.join(", ")}`,
              userId: user!.id,
              clientId: matchedClientId || undefined,
              candidateId: matchedCandidateId || undefined,
              metadata: JSON.stringify({ classification, keywords, emailId: messageId }),
            },
          });
        }

        // Handle POSITIVE response
        if (classification === "POSITIVE" && matchedClientId) {
          // Update client pipeline to INTERESTED
          await prisma.client.update({
            where: { id: matchedClientId },
            data: { pipelineStage: "INTERESTED" },
          });

          // Pause any active follow-up sequences for this client
          await prisma.sequenceEnrollment.updateMany({
            where: { clientId: matchedClientId, status: "ACTIVE" },
            data: { status: "REPLIED" },
          });

          // Get client name for notification
          const client = await prisma.client.findUnique({
            where: { id: matchedClientId },
            select: { companyName: true },
          });

          // Create hot lead notification
          await prisma.notification.create({
            data: {
              userId: user!.id,
              title: `Hot lead: ${client?.companyName || "Unknown"} responded positively`,
              message: `${fromName || fromAddress} replied positively. Consider scheduling a meeting.`,
              type: "HOT_LEAD",
              link: `/crm/clients/${matchedClientId}`,
            },
          });
        }

        // Handle NEGATIVE response
        if (classification === "NEGATIVE" && matchedClientId) {
          // Pause active sequences
          await prisma.sequenceEnrollment.updateMany({
            where: { clientId: matchedClientId, status: "ACTIVE" },
            data: { status: "REPLIED" },
          });
        }
      }

      syncCount++;
      if (matchedCandidateId) linkedCandidates++;
      if (matchedClientId) linkedClients++;
    }

    return NextResponse.json({
      success: true,
      synced: syncCount,
      linked: { candidates: linkedCandidates, clients: linkedClients },
      skipped: skippedCount,
    });
  } catch (err) {
    console.error("Email sync failed:", err);
    return NextResponse.json({ error: "Email sync failed" }, { status: 500 });
  }
}
