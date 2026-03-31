import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { getEmails } from "@/lib/microsoft";

export async function POST() {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    // Get recent emails (last 50)
    const result = await getEmails(user!.id, undefined, 50, 0, "inbox");
    const emails = result.value || [];

    // Get all contact and candidate email addresses
    const contacts = await prisma.contact.findMany({
      where: { email: { not: null } },
      select: { email: true, clientId: true },
    });
    const candidates = await prisma.candidate.findMany({
      select: { email: true, id: true },
    });

    const contactEmails = new Map(
      contacts.filter((c) => c.email).map((c) => [c.email!.toLowerCase(), c.clientId])
    );
    const candidateEmails = new Map(
      candidates.map((c) => [c.email.toLowerCase(), c.id])
    );

    let syncCount = 0;

    for (const email of emails) {
      const fromAddress = (
        email.from?.emailAddress?.address || ""
      ).toLowerCase();
      const toAddresses = (email.toRecipients || []).map(
        (r: { emailAddress: { address: string } }) =>
          r.emailAddress.address.toLowerCase()
      );
      const allAddresses = [fromAddress, ...toAddresses];

      let matchedCandidateId: string | undefined;
      let matchedClientId: string | undefined;

      for (const addr of allAddresses) {
        if (candidateEmails.has(addr)) {
          matchedCandidateId = candidateEmails.get(addr);
        }
        if (contactEmails.has(addr)) {
          matchedClientId = contactEmails.get(addr);
        }
      }

      if (matchedCandidateId || matchedClientId) {
        // Check if we already logged this email (by subject + date combo)
        const existingLog = await prisma.emailLog.findFirst({
          where: {
            toEmail: fromAddress,
            subject: email.subject || "(No Subject)",
            sentById: user!.id,
          },
        });

        if (!existingLog) {
          await prisma.emailLog.create({
            data: {
              sentById: user!.id,
              toEmail: fromAddress,
              toName: email.from?.emailAddress?.name || undefined,
              subject: email.subject || "(No Subject)",
              status: "synced",
            },
          });

          // Create activity
          await prisma.activity.create({
            data: {
              type: "EMAIL_SYNCED",
              title: `Synced: ${email.subject || "(No Subject)"}`,
              content: `Email from ${email.from?.emailAddress?.name || fromAddress}`,
              userId: user!.id,
              candidateId: matchedCandidateId || undefined,
              clientId: matchedClientId || undefined,
            },
          });

          syncCount++;
        }
      }
    }

    return NextResponse.json({ success: true, syncCount });
  } catch (err) {
    console.error("Email sync failed:", err);
    return NextResponse.json({ error: "Email sync failed" }, { status: 500 });
  }
}
