import prisma from "../src/lib/prisma";
import * as XLSX from "xlsx";

const FILE = "/var/www/oscabe-ai/OSCABE_DATA/JOB_1_MassEmail_LeadGen_Client_DBSheet.xlsx";

async function main() {
  const wb = XLSX.readFile(FILE);
  console.log("Sheets:", wb.SheetNames.join(", "));

  // ===================== LinkedIn Client Leads =====================
  console.log("\n=== Importing LinkedIn Client Leads ===");
  const mainSheet = wb.Sheets["LinkedIn_LeadGen_Client_DB"];
  if (mainSheet) {
    const rows = XLSX.utils.sheet_to_json(mainSheet, { defval: "", range: 2 }) as Record<string, string>[];
    console.log(`  Total rows: ${rows.length}`);

    // Column mapping (from __EMPTY_X pattern)
    // __EMPTY = Date, Sl.No. = serial, __EMPTY_1 = Company, __EMPTY_3 = Contact person
    // __EMPTY_5 = Contact position, __EMPTY_7 = Phone, __EMPTY_8 = Email
    // __EMPTY_9 = LinkedIn, __EMPTY_10 = Position contacted, __EMPTY_11 = Location
    // __EMPTY_12 = Date2, __EMPTY_13 = Contacted Y/N, __EMPTY_14 = Zoho updated

    let clientsCreated = 0, contactsCreated = 0, activitiesCreated = 0, skipped = 0;
    const seen = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const company = String(row["__EMPTY_1"] || "").trim();
      const contactPerson = String(row["__EMPTY_3"] || "").trim();
      const position = String(row["__EMPTY_5"] || "").trim();
      const phone = String(row["__EMPTY_7"] || "").trim();
      const email = String(row["__EMPTY_8"] || "").trim().toLowerCase();
      const linkedIn = String(row["__EMPTY_9"] || "").trim();
      const positionContacted = String(row["__EMPTY_10"] || "").trim();
      const location = String(row["__EMPTY_11"] || "").trim();
      const contacted = String(row["__EMPTY_13"] || "").trim().toLowerCase();
      const zohoUpdated = String(row["__EMPTY_14"] || "").trim();

      if (!company || company.length < 2) continue;

      // Deduplicate by company+email
      const key = `${company.toLowerCase()}|${email}`;
      if (seen.has(key)) { skipped++; continue; }
      seen.add(key);

      // Find or create client
      let client = await prisma.client.findFirst({ where: { companyName: company } });
      if (!client) {
        try {
          client = await prisma.client.create({
            data: {
              companyName: company,
              location: location || undefined,
              pipelineStage: contacted === "yes" ? "CONTACTED" : "LEAD",
              source: "LinkedIn_LeadGen",
            },
          });
          clientsCreated++;
        } catch {
          client = await prisma.client.findFirst({ where: { companyName: company } });
          if (!client) { skipped++; continue; }
        }
      }

      // Create contact
      if (email && email !== "nil" && email.includes("@") && contactPerson) {
        const existingContact = await prisma.contact.findFirst({ where: { email } });
        if (!existingContact) {
          try {
            const parts = contactPerson.split(" ");
            const fn = parts[0] || contactPerson;
            const ln = parts.slice(1).join(" ") || "";
            await prisma.contact.create({
              data: {
                clientId: client.id,
                firstName: fn,
                lastName: ln,
                email,
                phone: phone && phone !== "NIL" && phone !== "nil" ? phone : undefined,
                jobTitle: position || undefined,
                linkedIn: linkedIn.startsWith("http") ? linkedIn : undefined,
                isPrimary: true,
                notes: [
                  positionContacted ? `Role: ${positionContacted}` : "",
                  contacted === "yes" ? "Contacted" : "",
                  zohoUpdated === "Yes" ? "In Zoho" : "",
                ].filter(Boolean).join(" | ") || undefined,
              },
            });
            contactsCreated++;
          } catch {}
        }
      }

      // Activity for contacted leads
      if (contacted === "yes" && client) {
        try {
          await prisma.activity.create({
            data: {
              type: "EMAIL",
              title: `Contacted ${contactPerson || "contact"} at ${company}`,
              content: [
                position ? `Position: ${position}` : "",
                positionContacted ? `Role: ${positionContacted}` : "",
                email ? `Email: ${email}` : "",
              ].filter(Boolean).join(" | "),
              clientId: client.id,
            },
          });
          activitiesCreated++;
        } catch {}
      }

      if ((i + 1) % 5000 === 0) console.log(`  Progress: ${i + 1}/${rows.length}`);
    }
    console.log(`  Clients: created=${clientsCreated} | Contacts: created=${contactsCreated}`);
    console.log(`  Activities: ${activitiesCreated} | Skipped: ${skipped}`);
  }

  // ===================== Do Not Contact =====================
  console.log("\n=== Do Not Contact List ===");
  const dncSheet = wb.Sheets["DoNotContactAgain"];
  if (dncSheet) {
    const rows = XLSX.utils.sheet_to_json(dncSheet, { defval: "", range: 1 }) as Record<string, string>[];
    let suppressed = 0;
    for (const row of rows) {
      const vals = Object.values(row);
      const email = String(vals[8] || "").trim().toLowerCase();
      const company = String(vals[2] || "").trim();
      const name = String(vals[3] || "").trim();
      if (!email || !email.includes("@")) continue;
      try {
        await prisma.suppressionList.upsert({
          where: { email },
          update: {},
          create: { email, reason: "DO_NOT_CONTACT", source: `${company} - ${name}` },
        });
        suppressed++;
      } catch {}
    }
    console.log(`  Suppressed: ${suppressed}`);
  }

  // ===================== Mass Mailing Replies =====================
  console.log("\n=== Mass Mailing Replies ===");
  const repliesSheet = wb.Sheets["Mass Mailing Replies"];
  if (repliesSheet) {
    const rows = XLSX.utils.sheet_to_json(repliesSheet, { defval: "" }) as Record<string, string>[];
    let imported = 0;
    for (const row of rows) {
      const company = String(row["Company"] || "").trim();
      const contact = String(row["Contact Person"] || "").trim();
      const email = String(row["Email ID"] || "").trim();
      const response = String(row["Email Response"] || "").trim();
      const ourReply = String(row["Response Sent"] || "").trim();
      const position = String(row["Position"] || "").trim();
      if (!company) continue;

      const client = await prisma.client.findFirst({ where: { companyName: company } });
      if (client) {
        await prisma.activity.create({
          data: {
            type: "EMAIL",
            title: `Reply from ${contact} at ${company}`,
            content: `Their reply: ${response.substring(0, 500)}${ourReply ? `\n\nOur response: ${ourReply.substring(0, 500)}` : ""}`,
            clientId: client.id,
          },
        }).catch(() => {});
        imported++;
      }
    }
    console.log(`  Imported: ${imported}`);
  }

  // ===================== Zoho Checklist Notes =====================
  console.log("\n=== Zoho Checklist Notes ===");
  const zohoSheet = wb.Sheets["ZOHO_Update_CheckList"];
  if (zohoSheet) {
    const rows = XLSX.utils.sheet_to_json(zohoSheet, { defval: "" }) as Record<string, string>[];
    let notes = 0;
    for (const row of rows) {
      const company = String(row["Company"] || "").trim();
      const contact = String(row["Contact person"] || "").trim();
      const response = String(row["Response"] || "").trim();
      if (!company || !response || response === "No response") continue;

      const client = await prisma.client.findFirst({ where: { companyName: company } });
      if (client) {
        await prisma.activity.create({
          data: {
            type: "NOTE",
            title: `${contact} at ${company}: ${response.substring(0, 80)}`,
            content: response,
            clientId: client.id,
          },
        }).catch(() => {});
        notes++;
      }
    }
    console.log(`  Notes: ${notes}`);
  }

  // Final
  console.log("\n=== FINAL COUNTS ===");
  console.log("Clients:", await prisma.client.count());
  console.log("Contacts:", await prisma.contact.count());
  console.log("Activities:", await prisma.activity.count());
  console.log("Suppression:", await prisma.suppressionList.count());

  await prisma.$disconnect();
}

main().catch(console.error);
