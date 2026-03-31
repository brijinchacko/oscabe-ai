import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import * as XLSX from "xlsx";
import { readFileSync, readdirSync, statSync, existsSync, copyFileSync, mkdirSync } from "fs";
import path from "path";

const DATA_ROOT = path.resolve(process.cwd(), "..", "OSCABE DATA");
const CLIENTS_DIR = path.join(DATA_ROOT, "Client data", "CLIENTS");

// ---------- helpers ----------

function safeRead(filePath: string) {
  try {
    return readFileSync(filePath);
  } catch {
    return null;
  }
}

function listDir(dir: string): string[] {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}

function isDir(p: string) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function cellVal(sheet: XLSX.WorkSheet, row: number, col: number): string {
  const addr = XLSX.utils.encode_cell({ r: row, c: col });
  const cell = sheet[addr];
  return cell ? String(cell.v ?? "").trim() : "";
}

function mapJobStatus(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes("open") || s.includes("active")) return "ACTIVE";
  if (s.includes("hold")) return "ON_HOLD";
  if (s.includes("closed") || s.includes("close")) return "CLOSED";
  if (s.includes("filled")) return "FILLED";
  return "ACTIVE";
}

function copyFileToUploads(srcPath: string, category: string): string | null {
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "documents", category);
    mkdirSync(uploadsDir, { recursive: true });
    const baseName = path.basename(srcPath);
    const safeName = baseName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const destName = `${Date.now()}_${safeName}`;
    const destPath = path.join(uploadsDir, destName);
    copyFileSync(srcPath, destPath);
    return `/uploads/documents/${category}/${destName}`;
  } catch (e) {
    console.error("Failed to copy file:", srcPath, e);
    return null;
  }
}

// ---------- import functions ----------

async function importClients(log: string[]) {
  if (!existsSync(CLIENTS_DIR)) {
    log.push(`CLIENTS_DIR not found: ${CLIENTS_DIR}`);
    return;
  }

  const folders = listDir(CLIENTS_DIR).filter((f) => {
    const fp = path.join(CLIENTS_DIR, f);
    return isDir(fp);
  });

  log.push(`Found ${folders.length} client folders`);

  for (const folder of folders) {
    const companyName = folder.replace(/_/g, " ").trim();

    // Upsert client
    let client = await prisma.client.findFirst({
      where: { companyName },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          companyName,
          pipelineStage: "ACTIVE",
          source: "OSCABE_DATA_IMPORT",
        },
      });
      log.push(`Created client: ${companyName}`);
    } else {
      log.push(`Client exists: ${companyName}`);
    }

    // Scan client folder for files
    const clientDir = path.join(CLIENTS_DIR, folder);
    await scanClientFolder(clientDir, client.id, log);
  }
}

async function scanClientFolder(dir: string, clientId: string, log: string[]) {
  const items = listDir(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);

    if (isDir(fullPath)) {
      const lower = item.toLowerCase();
      // Recurse into subdirectories
      if (lower.includes("t&c") || lower.includes("terms") || lower.includes("t & c")) {
        await scanAndCreateDocuments(fullPath, clientId, "TERMS", log);
      } else if (lower.includes("jd") || lower.includes("job")) {
        await scanAndCreateDocuments(fullPath, clientId, "JD", log);
      } else if (
        lower.includes("cand") ||
        lower.includes("prof") ||
        lower.includes("sent") ||
        lower.includes("outsource") ||
        lower.includes("application")
      ) {
        await scanAndCreateDocuments(fullPath, clientId, "PROFILE", log);
      } else {
        // Recurse generically
        await scanClientFolder(fullPath, clientId, log);
      }
    } else {
      // File in root of client folder
      const lower = item.toLowerCase();
      let category = "GENERAL";
      if (lower.includes("term") || lower.includes("t&c")) category = "TERMS";
      else if (lower.includes("jd") || lower.includes("job description")) category = "JD";
      else if (lower.endsWith(".pdf") && (lower.includes("cand") || lower.includes("prof"))) category = "PROFILE";
      else if (lower.endsWith(".docx") && lower.includes("jd")) category = "JD";

      await createDocumentRecord(fullPath, item, clientId, category, log);
    }
  }
}

async function scanAndCreateDocuments(dir: string, clientId: string, category: string, log: string[]) {
  const items = listDir(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (isDir(fullPath)) {
      await scanAndCreateDocuments(fullPath, clientId, category, log);
    } else {
      await createDocumentRecord(fullPath, item, clientId, category, log);
    }
  }
}

async function createDocumentRecord(
  filePath: string,
  fileName: string,
  clientId: string,
  category: string,
  log: string[]
) {
  // Skip hidden files and temp files
  if (fileName.startsWith(".") || fileName.startsWith("~$")) return;

  // Check if already imported
  const existing = await prisma.document.findFirst({
    where: { fileName, clientId, category },
  });
  if (existing) return;

  // Copy file to uploads
  const relativePath = copyFileToUploads(filePath, category);
  if (!relativePath) return;

  let fileSize: number | null = null;
  try {
    fileSize = statSync(filePath).size;
  } catch { /* ignore */ }

  const ext = path.extname(fileName).toLowerCase();
  let mimeType = "application/octet-stream";
  if (ext === ".pdf") mimeType = "application/pdf";
  else if (ext === ".docx") mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  else if (ext === ".xlsx") mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  else if (ext === ".doc") mimeType = "application/msword";
  else if (ext === ".rtf") mimeType = "application/rtf";

  await prisma.document.create({
    data: {
      name: fileName.replace(/\.[^.]+$/, ""),
      fileName,
      filePath: relativePath,
      fileSize,
      mimeType,
      category,
      clientId,
      uploadedBy: null,
      notes: `Imported from OSCABE DATA`,
    },
  });

  log.push(`  Doc: ${fileName} [${category}]`);
}

async function importJobs(log: string[]) {
  const trackerPath = path.join(DATA_ROOT, "Oscabe_Recruitment_Tracker.xlsx");
  const buf = safeRead(trackerPath);
  if (!buf) {
    log.push("Recruitment tracker not found");
    return;
  }

  const wb = XLSX.read(buf, { type: "buffer" });
  const sheetNames = wb.SheetNames;
  log.push(`Tracker sheets: ${sheetNames.join(", ")}`);

  for (const sheetName of sheetNames) {
    if (!sheetName.toLowerCase().includes("job tracker")) continue;

    const sheet = wb.Sheets[sheetName];
    const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
    log.push(`Processing sheet "${sheetName}" rows: ${range.e.r}`);

    // Find header row (row 0 or 1)
    let headerRow = 0;
    for (let r = 0; r <= Math.min(3, range.e.r); r++) {
      if (cellVal(sheet, r, 0).toLowerCase().includes("job id") || cellVal(sheet, r, 1).toLowerCase().includes("company")) {
        headerRow = r;
        break;
      }
    }

    // Map column indices by header
    const headers: Record<string, number> = {};
    for (let c = range.s.c; c <= range.e.c; c++) {
      const h = cellVal(sheet, headerRow, c).toLowerCase();
      if (h.includes("job id")) headers.jobId = c;
      else if (h.includes("company")) headers.company = c;
      else if (h.includes("job role") || h.includes("role")) headers.role = c;
      else if (h.includes("location")) headers.location = c;
      else if (h.includes("job open date") || h.includes("open date")) headers.openDate = c;
      else if (h.includes("job status") || h.includes("status")) headers.status = c;
      else if (h.includes("days")) headers.daysOpen = c;
      else if (h.includes("total resumes") || h.includes("resumes received")) headers.totalResumes = c;
      else if (h.includes("suitable")) headers.suitable = c;
      else if (h.includes("submitted")) headers.submitted = c;
      else if (h.includes("interview")) headers.interview = c;
      else if (h.includes("client feedback") || h.includes("feedback")) headers.feedback = c;
      else if (h.includes("remarks") || h.includes("remark")) headers.remarks = c;
    }

    let created = 0;
    let skipped = 0;

    for (let r = headerRow + 1; r <= range.e.r; r++) {
      const companyName = cellVal(sheet, r, headers.company ?? 1);
      const jobRole = cellVal(sheet, r, headers.role ?? 2);
      const location = cellVal(sheet, r, headers.location ?? 3);
      const statusRaw = cellVal(sheet, r, headers.status ?? 5);
      const interview = cellVal(sheet, r, headers.interview ?? -1);
      const feedback = cellVal(sheet, r, headers.feedback ?? -1);
      const remarks = cellVal(sheet, r, headers.remarks ?? -1);

      if (!jobRole && !companyName) continue;

      // Look up client
      let client = null;
      if (companyName) {
        client = await prisma.client.findFirst({
          where: { companyName: { contains: companyName } },
        });
        if (!client) {
          client = await prisma.client.create({
            data: {
              companyName,
              pipelineStage: "ACTIVE",
              source: "OSCABE_DATA_IMPORT",
            },
          });
        }
      }

      // Deduplicate by title + client
      const existing = await prisma.job.findFirst({
        where: {
          title: jobRole || "Untitled Role",
          clientId: client?.id ?? null,
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      const job = await prisma.job.create({
        data: {
          title: jobRole || "Untitled Role",
          description: `${jobRole} at ${companyName}`,
          clientId: client?.id ?? null,
          companyName: companyName || null,
          location: location || null,
          status: mapJobStatus(statusRaw),
          source: "OSCABE_DATA_IMPORT",
        },
      });

      // Create activity for remarks/feedback
      const noteParts = [];
      if (interview) noteParts.push(`Interview: ${interview}`);
      if (feedback) noteParts.push(`Client Feedback: ${feedback}`);
      if (remarks) noteParts.push(`Remarks: ${remarks}`);

      if (noteParts.length > 0) {
        await prisma.activity.create({
          data: {
            type: "NOTE",
            title: "Import notes",
            content: noteParts.join("\n"),
            jobId: job.id,
            clientId: client?.id ?? null,
          },
        });
      }

      created++;
    }

    log.push(`  Jobs: ${created} created, ${skipped} skipped (duplicates)`);
  }
}

async function importCandidatesQuickLook(log: string[]) {
  const filePath = path.join(DATA_ROOT, "QUICK_LOOK_CV.xlsx");
  const buf = safeRead(filePath);
  if (!buf) {
    log.push("QUICK_LOOK_CV.xlsx not found");
    return;
  }

  const wb = XLSX.read(buf, { type: "buffer" });
  // Use first sheet
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");

  // Find header row
  let headerRow = 0;
  for (let r = 0; r <= Math.min(5, range.e.r); r++) {
    const v = cellVal(sheet, r, 0).toLowerCase();
    if (v.includes("name") || v.includes("s.no") || v.includes("sl")) {
      headerRow = r;
      break;
    }
  }

  const headers: Record<string, number> = {};
  for (let c = range.s.c; c <= range.e.c; c++) {
    const h = cellVal(sheet, headerRow, c).toLowerCase();
    if (h.includes("name") && !h.includes("company")) headers.name = c;
    else if (h.includes("email")) headers.email = c;
    else if (h.includes("phone")) headers.phone = c;
    else if (h === "field" || h.includes("field")) headers.field = c;
    else if (h.includes("subfield")) headers.subfield = c;
    else if (h.includes("experience")) headers.experience = c;
    else if (h.includes("driving")) headers.driving = c;
    else if (h.includes("visa")) headers.visa = c;
    else if (h.includes("tier")) headers.tier = c;
    else if (h.includes("training")) headers.training = c;
    else if (h.includes("interview")) headers.interviews = c;
  }

  let created = 0;
  let skipped = 0;

  for (let r = headerRow + 1; r <= range.e.r; r++) {
    const name = cellVal(sheet, r, headers.name ?? 1);
    const email = cellVal(sheet, r, headers.email ?? 2);
    const phone = cellVal(sheet, r, headers.phone ?? 3);
    const field = cellVal(sheet, r, headers.field ?? 4);
    const subfield = cellVal(sheet, r, headers.subfield ?? 5);
    const experience = cellVal(sheet, r, headers.experience ?? 6);
    const driving = cellVal(sheet, r, headers.driving ?? 7);
    const visa = cellVal(sheet, r, headers.visa ?? 8);
    const tier = cellVal(sheet, r, headers.tier ?? 9);

    if (!name && !email) continue;

    // Parse name into first/last
    const parts = name.split(/\s+/);
    const firstName = parts[0] || "Unknown";
    const lastName = parts.slice(1).join(" ") || "Unknown";

    // Validate/skip if no email
    const candidateEmail = email || `import_${firstName.toLowerCase()}_${lastName.toLowerCase()}_${r}@placeholder.oscabe.com`;

    // Deduplicate by email
    const existing = await prisma.candidate.findFirst({
      where: { email: candidateEmail },
    });
    if (existing) {
      skipped++;
      continue;
    }

    const noteParts = [];
    if (field) noteParts.push(`Field: ${field}`);
    if (subfield) noteParts.push(`Subfield: ${subfield}`);
    if (experience) noteParts.push(`Experience: ${experience}`);
    if (driving) noteParts.push(`Driving Licence: ${driving}`);
    if (visa) noteParts.push(`Visa Status: ${visa}`);
    if (tier) noteParts.push(`Tier: ${tier}`);

    // Collect company remarks
    for (let c = range.s.c; c <= range.e.c; c++) {
      const h = cellVal(sheet, headerRow, c).toLowerCase();
      if (h.includes("company") || h.includes("remark")) {
        const v = cellVal(sheet, r, c);
        if (v) noteParts.push(`${cellVal(sheet, headerRow, c)}: ${v}`);
      }
    }

    const candidate = await prisma.candidate.create({
      data: {
        firstName,
        lastName,
        email: candidateEmail,
        phone: phone || null,
        headline: field ? `${field}${subfield ? ` - ${subfield}` : ""}` : null,
        rightToWork: visa ? visa.toLowerCase().includes("uk") || visa.toLowerCase().includes("settled") : false,
        status: "ACTIVE",
        source: "OSCABE_DATA_IMPORT",
        notes: noteParts.join("\n") || null,
      },
    });

    // Create activity
    if (noteParts.length > 0) {
      await prisma.activity.create({
        data: {
          type: "NOTE",
          title: "Quick Look CV Import",
          content: noteParts.join("\n"),
          candidateId: candidate.id,
        },
      });
    }

    created++;
  }

  log.push(`Quick Look CV: ${created} candidates created, ${skipped} skipped`);
}

async function importCandidateScreening(log: string[]) {
  const filePath = path.join(DATA_ROOT, "Candidate Screening level -1.xlsx");
  const buf = safeRead(filePath);
  if (!buf) {
    log.push("Candidate Screening file not found");
    return;
  }

  const wb = XLSX.read(buf, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");

  // Find headers
  let headerRow = 0;
  for (let r = 0; r <= Math.min(5, range.e.r); r++) {
    for (let c = 0; c <= Math.min(10, range.e.c); c++) {
      const v = cellVal(sheet, r, c).toLowerCase();
      if (v.includes("full name") || v.includes("date") || v.includes("name")) {
        headerRow = r;
        break;
      }
    }
  }

  const headers: Record<string, number> = {};
  for (let c = range.s.c; c <= range.e.c; c++) {
    const h = cellVal(sheet, headerRow, c).toLowerCase();
    if (h.includes("full name") || (h === "name")) headers.name = c;
    else if (h.includes("contact") || h.includes("phone")) headers.phone = c;
    else if (h.includes("email")) headers.email = c;
    else if (h.includes("source")) headers.source = c;
    else if (h.includes("location") && !h.includes("reloc")) headers.location = c;
    else if (h.includes("relocation")) headers.relocation = c;
    else if (h.includes("driving")) headers.driving = c;
    else if (h.includes("work auth")) headers.workAuth = c;
    else if (h.includes("visa")) headers.visa = c;
    else if (h.includes("employment status")) headers.empStatus = c;
    else if (h.includes("job title") || h.includes("current role")) headers.jobTitle = c;
    else if (h.includes("company") && !h.includes("remark")) headers.company = c;
    else if (h.includes("experience") || h.includes("exp")) headers.experience = c;
    else if (h.includes("skill")) headers.skills = c;
    else if (h.includes("salary")) headers.salary = c;
    else if (h.includes("notice")) headers.notice = c;
    else if (h.includes("cv received") || h.includes("cv")) headers.cv = c;
    else if (h.includes("interview")) headers.interview = c;
    else if (h.includes("remark")) headers.remarks = c;
    else if (h.includes("recruiter")) headers.recruiter = c;
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (let r = headerRow + 1; r <= range.e.r; r++) {
    const name = cellVal(sheet, r, headers.name ?? 1);
    const email = cellVal(sheet, r, headers.email ?? 3);
    const phone = cellVal(sheet, r, headers.phone ?? 2);
    const location = cellVal(sheet, r, headers.location ?? -1);
    const visa = cellVal(sheet, r, headers.visa ?? -1);
    const workAuth = cellVal(sheet, r, headers.workAuth ?? -1);
    const jobTitle = cellVal(sheet, r, headers.jobTitle ?? -1);
    const skills = cellVal(sheet, r, headers.skills ?? -1);
    const salary = cellVal(sheet, r, headers.salary ?? -1);
    const notice = cellVal(sheet, r, headers.notice ?? -1);
    const remarks = cellVal(sheet, r, headers.remarks ?? -1);
    const source = cellVal(sheet, r, headers.source ?? -1);

    if (!name && !email) continue;

    const parts = name.split(/\s+/);
    const firstName = parts[0] || "Unknown";
    const lastName = parts.slice(1).join(" ") || "Unknown";

    const candidateEmail = email || `screening_${firstName.toLowerCase()}_${lastName.toLowerCase()}_${r}@placeholder.oscabe.com`;

    // Build notes
    const noteParts = [];
    if (skills) noteParts.push(`Skills: ${skills}`);
    if (salary) noteParts.push(`Salary: ${salary}`);
    if (notice) noteParts.push(`Notice Period: ${notice}`);
    if (remarks) noteParts.push(`Remarks: ${remarks}`);
    if (visa) noteParts.push(`Visa: ${visa}`);
    if (workAuth) noteParts.push(`Work Auth: ${workAuth}`);

    // Deduplicate by email
    const existing = await prisma.candidate.findFirst({
      where: { email: candidateEmail },
    });

    if (existing) {
      // Update with screening data if we have more info
      if (noteParts.length > 0) {
        const existingNotes = existing.notes || "";
        const screeningNotes = `\n--- Screening Data ---\n${noteParts.join("\n")}`;
        if (!existingNotes.includes("Screening Data")) {
          await prisma.candidate.update({
            where: { id: existing.id },
            data: { notes: existingNotes + screeningNotes },
          });
          updated++;
        } else {
          skipped++;
        }
      }
      continue;
    }

    const candidate = await prisma.candidate.create({
      data: {
        firstName,
        lastName,
        email: candidateEmail,
        phone: phone || null,
        location: location || null,
        headline: jobTitle || null,
        noticePeriod: notice || null,
        rightToWork: workAuth ? (workAuth.toLowerCase().includes("uk") || workAuth.toLowerCase().includes("yes") || workAuth.toLowerCase().includes("settled")) : false,
        status: "ACTIVE",
        source: source || "SCREENING_IMPORT",
        notes: noteParts.join("\n") || null,
      },
    });

    // Create screening activity
    await prisma.activity.create({
      data: {
        type: "SCREENING",
        title: "Candidate Screening Import",
        content: noteParts.join("\n"),
        candidateId: candidate.id,
      },
    });

    created++;
  }

  log.push(`Screening: ${created} created, ${updated} updated, ${skipped} skipped`);
}

// ---------- main route ----------

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    // Check admin role
    if (user!.role !== "ADMIN" && user!.role !== "RECRUITER") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const importType = (body as { type?: string }).type || "all";

    const log: string[] = [];
    log.push(`Starting OSCABE data import (type: ${importType})`);
    log.push(`Data root: ${DATA_ROOT}`);

    if (!existsSync(DATA_ROOT)) {
      return NextResponse.json({ error: `Data directory not found: ${DATA_ROOT}` }, { status: 400 });
    }

    if (importType === "all" || importType === "clients") {
      log.push("\n=== Importing Clients ===");
      await importClients(log);
    }

    if (importType === "all" || importType === "jobs") {
      log.push("\n=== Importing Jobs ===");
      await importJobs(log);
    }

    if (importType === "all" || importType === "candidates") {
      log.push("\n=== Importing Candidates (Quick Look CV) ===");
      await importCandidatesQuickLook(log);

      log.push("\n=== Importing Candidates (Screening) ===");
      await importCandidateScreening(log);
    }

    // Get counts
    const [clientCount, jobCount, candidateCount, documentCount] = await Promise.all([
      prisma.client.count(),
      prisma.job.count(),
      prisma.candidate.count(),
      prisma.document.count(),
    ]);

    return NextResponse.json({
      success: true,
      log,
      counts: {
        clients: clientCount,
        jobs: jobCount,
        candidates: candidateCount,
        documents: documentCount,
      },
    });
  } catch (err) {
    console.error("Import error:", err);
    return NextResponse.json(
      { error: "Import failed", details: String(err) },
      { status: 500 }
    );
  }
}
