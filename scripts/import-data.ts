import prisma from "../src/lib/prisma";
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

const DATA_ROOT = path.resolve(process.cwd(), "OSCABE_DATA");
const UPLOAD_DIR = path.resolve(process.cwd(), "public", "uploads", "documents");
const CLIENTS_DIR = path.join(DATA_ROOT, "Client data", "CLIENTS");

async function main() {
  console.log("Data root:", DATA_ROOT);
  console.log("Exists:", fs.existsSync(DATA_ROOT));

  // Ensure upload dirs
  for (const cat of ["TERMS", "JD", "PROFILE", "CV", "GENERAL", "OTHER"]) {
    fs.mkdirSync(path.join(UPLOAD_DIR, cat), { recursive: true });
  }

  let totalErrors = 0;

  // ===================== IMPORT CLIENTS =====================
  console.log("\n=== Importing Clients ===");
  let clientsCreated = 0, clientsSkipped = 0, docsCreated = 0;

  if (fs.existsSync(CLIENTS_DIR)) {
    const folders = fs.readdirSync(CLIENTS_DIR).filter(f => {
      try { return fs.statSync(path.join(CLIENTS_DIR, f)).isDirectory(); } catch { return false; }
    });

    for (const folder of folders) {
      try {
        const existing = await prisma.client.findFirst({ where: { companyName: folder } });
        let clientId: string;

        if (existing) {
          clientId = existing.id;
          clientsSkipped++;
        } else {
          const client = await prisma.client.create({
            data: { companyName: folder, industry: "Engineering", pipelineStage: "ACTIVE", source: "OSCABE_DATA_IMPORT" },
          });
          clientId = client.id;
          clientsCreated++;
          console.log("  + Client:", folder);
        }

        // Scan for documents
        const scanDir = (dir: string, depth = 0) => {
          if (depth > 4) return;
          try {
            const items = fs.readdirSync(dir);
            for (const item of items) {
              const fullPath = path.join(dir, item);
              try {
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                  scanDir(fullPath, depth + 1);
                } else if (stat.isFile()) {
                  const ext = path.extname(item).toLowerCase();
                  if ([".pdf", ".docx", ".doc", ".xlsx", ".rtf", ".pptx"].includes(ext)) {
                    let category = "OTHER";
                    const parentName = path.basename(dir).toLowerCase();
                    if (parentName.includes("t&c") || parentName.includes("terms")) category = "TERMS";
                    else if (item.toLowerCase().includes("jd") || parentName.includes("jd")) category = "JD";
                    else if (ext === ".pdf") category = "PROFILE";

                    const safeName = item.replace(/[^a-zA-Z0-9._-]/g, "_");
                    const destPath = path.join(UPLOAD_DIR, category, safeName);
                    try {
                      fs.copyFileSync(fullPath, destPath);
                    } catch {}

                    prisma.document.create({
                      data: {
                        name: item,
                        fileName: safeName,
                        filePath: `/uploads/documents/${category}/${safeName}`,
                        fileSize: stat.size,
                        mimeType: ext === ".pdf" ? "application/pdf" : "application/octet-stream",
                        category,
                        clientId,
                        notes: `Imported from ${folder}`,
                      },
                    }).then(() => docsCreated++).catch(() => {});
                  }
                }
              } catch {}
            }
          } catch {}
        };
        scanDir(path.join(CLIENTS_DIR, folder));
      } catch (err) {
        console.error("  Error:", folder, err);
        totalErrors++;
      }
    }
  }

  await new Promise(r => setTimeout(r, 3000));
  console.log(`Clients: created=${clientsCreated} skipped=${clientsSkipped} docs=${docsCreated}`);

  // ===================== IMPORT JOBS =====================
  console.log("\n=== Importing Jobs ===");
  let jobsCreated = 0, jobsSkipped = 0;

  const trackerPath = path.join(DATA_ROOT, "Oscabe_Recruitment_Tracker.xlsx");
  if (fs.existsSync(trackerPath)) {
    const wb = XLSX.readFile(trackerPath);
    for (const sheetName of wb.SheetNames) {
      if (!sheetName.includes("Job Tracker")) continue;
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: "" }) as Record<string, string>[];
      console.log(`  Sheet: ${sheetName} (${rows.length} rows)`);

      for (const row of rows) {
        const company = String(row["Company Name"] || "").trim();
        const role = String(row["Job Role"] || "").trim();
        const location = String(row["Location"] || "").trim();
        const statusRaw = String(row["Job Status"] || "").trim();
        const remarks = String(row["Remarks"] || "").trim();
        const feedback = String(row["Client Feedback"] || "").trim();

        if (!company || !role) continue;

        let status = "ACTIVE";
        if (statusRaw.toLowerCase().includes("hold")) status = "ON_HOLD";
        else if (statusRaw.toLowerCase().includes("close") || statusRaw.toLowerCase().includes("fill")) status = "CLOSED";

        const client = await prisma.client.findFirst({ where: { companyName: company } });

        const existingJob = await prisma.job.findFirst({
          where: { title: role, ...(client ? { clientId: client.id } : {}) },
        });
        if (existingJob) { jobsSkipped++; continue; }

        try {
          const job = await prisma.job.create({
            data: {
              title: role,
              location: location || "UK",
              status,
              source: "OSCABE_DATA_IMPORT",
              ...(client ? { clientId: client.id } : {}),
            },
          });

          if (remarks || feedback) {
            await prisma.activity.create({
              data: {
                type: "NOTE",
                title: "Import Notes",
                content: [remarks, feedback ? `Client Feedback: ${feedback}` : ""].filter(Boolean).join(" | "),
                jobId: job.id,
              },
            });
          }
          jobsCreated++;
        } catch { totalErrors++; }
      }
    }
  }
  console.log(`Jobs: created=${jobsCreated} skipped=${jobsSkipped}`);

  // ===================== IMPORT CANDIDATES =====================
  console.log("\n=== Importing Candidates ===");
  let candsCreated = 0, candsSkipped = 0;

  const cvPath = path.join(DATA_ROOT, "QUICK_LOOK_CV.xlsx");
  if (fs.existsSync(cvPath)) {
    const wb = XLSX.readFile(cvPath);

    // QUICK_LOOK_CV
    const qlSheet = wb.Sheets["QUICK_LOOK_CV"];
    if (qlSheet) {
      const rows = XLSX.utils.sheet_to_json(qlSheet, { defval: "" }) as Record<string, string>[];
      console.log(`  QUICK_LOOK_CV: ${rows.length} rows`);
      for (const row of rows) {
        const name = (row["Name "] || row["Name"] || "").trim();
        const email = String(row["email ID"] || "").trim().toLowerCase();
        const phone = String(row["Phone No"] || "").trim();
        const field = String(row["Field "] || "").trim();
        const subfield = String(row["Subfield "] || "").trim();
        const visa = String(row["Visa Status with Expiry"] || "").trim();
        if (!name) continue;
        const [firstName, ...rest] = name.split(" ");
        const lastName = rest.join(" ");

        if (email) {
          const exists = await prisma.candidate.findFirst({ where: { email } });
          if (exists) { candsSkipped++; continue; }
        }

        try {
          const cand = await prisma.candidate.create({
            data: {
              firstName, lastName: lastName || "",
              email: email || `${name.toLowerCase().replace(/[^a-z]/g, "")}@imported.local`,
              phone: phone || undefined,
              headline: [field, subfield].filter(Boolean).join(" - ") || undefined,
              status: "ACTIVE", source: "OSCABE_DATA_IMPORT",
            },
          });
          if (visa) {
            await prisma.activity.create({
              data: { type: "NOTE", title: "Visa Info", content: `Visa: ${visa}`, candidateId: cand.id },
            });
          }
          candsCreated++;
        } catch { candsSkipped++; }
      }
    }

    // LinkedIn Connections
    const liSheet = wb.Sheets["LinkedIn Connections"];
    if (liSheet) {
      const rows = XLSX.utils.sheet_to_json(liSheet, { defval: "" }) as Record<string, string>[];
      console.log(`  LinkedIn Connections: ${rows.length} rows`);
      let liCreated = 0;
      for (const row of rows) {
        const name = String(row["Name"] || "").trim();
        const field = String(row["Field "] || "").trim();
        const phone = String(row["Contact Num"] || "").trim();
        if (!name || name === "Name") continue;
        const [firstName, ...rest] = name.split(" ");

        try {
          await prisma.candidate.create({
            data: {
              firstName, lastName: rest.join(" ") || "",
              email: `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}@linkedin.local`,
              phone: phone || undefined, headline: field || undefined,
              status: "SOURCED", source: "LinkedIn",
            },
          });
          liCreated++;
        } catch {}
      }
      console.log(`  LinkedIn created: ${liCreated}`);
      candsCreated += liCreated;
    }

    // Present CVs Received
    const presentSheet = wb.Sheets["Present CVs Recieved"];
    if (presentSheet) {
      const rows = XLSX.utils.sheet_to_json(presentSheet, { defval: "", range: 2 }) as Record<string, string>[];
      console.log(`  Present CVs: ${rows.length} rows`);
      for (const row of rows) {
        const name = String(row["Name"] || "").trim();
        const designation = String(row["Designation"] || "").trim();
        const location = String(row["Location"] || "").trim();
        const email = String(row["Email Address"] || "").trim().toLowerCase();
        if (!name) continue;
        const [firstName, ...rest] = name.split(" ");

        try {
          await prisma.candidate.create({
            data: {
              firstName, lastName: rest.join(" ") || "",
              email: email || `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}@cvreceived.local`,
              headline: designation || undefined, location: location || undefined,
              status: "ACTIVE", source: "CV_Received",
            },
          });
          candsCreated++;
        } catch { candsSkipped++; }
      }
    }
  }

  // Screening data
  const screenPath = path.join(DATA_ROOT, "Candidate Screening level -1.xlsx");
  if (fs.existsSync(screenPath)) {
    const wb = XLSX.readFile(screenPath);
    for (const sheetName of wb.SheetNames) {
      if (!sheetName.includes("Screening") && !sheetName.includes("Level")) continue;
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: "", range: 2 }) as Record<string, string>[];
      console.log(`  Screening ${sheetName}: ${rows.length} rows`);

      for (const row of rows) {
        const name = String(row["Full Name"] || "").trim();
        const email = String(row["Email Address"] || "").trim().toLowerCase();
        const phone = String(row["Contact Number"] || "").trim();
        const location = String(row["Current Location"] || "").trim();
        const jobTitle = String(row["Current Job Title"] || "").trim();
        const salary = String(row["Current Salary"] || "").trim();
        const expected = String(row["Expected Salary"] || "").trim();
        const notice = String(row["Notice Period"] || "").trim();
        const remarks = String(row["Remarks / Notes"] || "").trim();
        const recruiter = String(row["Recruiter"] || "").trim();
        if (!name) continue;
        const [firstName, ...rest] = name.split(" ");

        if (email) {
          const exists = await prisma.candidate.findFirst({ where: { email } });
          if (exists) { candsSkipped++; continue; }
        }

        try {
          const cand = await prisma.candidate.create({
            data: {
              firstName, lastName: rest.join(" ") || "",
              email: email || `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}@screened.local`,
              phone: phone || undefined, headline: jobTitle || undefined,
              location: location || undefined, status: "ACTIVE", source: "Screening",
            },
          });
          if (remarks || salary || notice || recruiter) {
            await prisma.activity.create({
              data: {
                type: "NOTE", title: "Screening Notes",
                content: [remarks, salary ? `Salary: ${salary}` : "", expected ? `Expected: ${expected}` : "", notice ? `Notice: ${notice}` : "", recruiter ? `Recruiter: ${recruiter}` : ""].filter(Boolean).join(" | "),
                candidateId: cand.id,
              },
            });
          }
          candsCreated++;
        } catch { candsSkipped++; }
      }
    }
  }

  console.log(`Candidates: created=${candsCreated} skipped=${candsSkipped}`);

  // Final counts
  await new Promise(r => setTimeout(r, 2000));
  console.log("\n=== FINAL COUNTS ===");
  console.log("Clients:", await prisma.client.count());
  console.log("Jobs:", await prisma.job.count());
  console.log("Candidates:", await prisma.candidate.count());
  console.log("Documents:", await prisma.document.count());
  console.log("Activities:", await prisma.activity.count());
  console.log("Errors:", totalErrors);

  await prisma.$disconnect();
}

main().catch(console.error);
