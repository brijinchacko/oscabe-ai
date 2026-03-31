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
