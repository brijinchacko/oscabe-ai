#!/usr/bin/env node

/**
 * Link Zoho exported resume attachments to existing candidates.
 *
 * Reads:
 *   - /var/www/oscabe-ai/zoho-import/Attachments_001.csv  (File Name → Parent Id)
 *   - /var/www/oscabe-ai/zoho-import/Candidates_001.csv  (Candidate Id → Email)
 *   - /var/www/oscabe-ai/zoho-import/attachments/*.pdf|doc|docx
 *
 * For each attachment file:
 *   1. Find its row in Attachments CSV by matching "File Name" field
 *   2. Get the Parent Id (candidate's Zoho ID)
 *   3. Look up the candidate's email in Candidates CSV
 *   4. Find the DB candidate by email (must already exist)
 *   5. If they don't have a cvUrl → copy file + update cvUrl / cvFileName
 *
 * SAFE:
 *   - Does NOT override candidates who already have a CV (preserves 125 existing)
 *   - Does NOT create new candidates
 *   - Does NOT delete anything
 *   - Writes CVs to /public/uploads/documents/CV/ using unique names
 */

const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const BASE = "/var/www/oscabe-ai";
const DB_PATH = path.join(BASE, "dev.db");
const IMPORT_DIR = path.join(BASE, "zoho-import");
const ATTACHMENTS_DIR = path.join(IMPORT_DIR, "attachments");
const CV_UPLOAD_DIR = path.join(BASE, "public", "uploads", "documents", "CV");

// Ensure upload directory exists
fs.mkdirSync(CV_UPLOAD_DIR, { recursive: true });

/* ------------------------------------------------------------------
 * Minimal CSV parser that handles quoted fields and newlines inside fields.
 * ------------------------------------------------------------------ */
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const rows = [];
  let field = "";
  let row = [];
  let inQuote = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (inQuote) {
      if (ch === '"' && content[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') { inQuote = false; }
      else { field += ch; }
    } else {
      if (ch === '"') { inQuote = true; }
      else if (ch === ",") { row.push(field); field = ""; }
      else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && content[i + 1] === "\n") i++;
        row.push(field);
        if (row.length > 1 || (row.length === 1 && row[0] !== "")) rows.push(row);
        row = [];
        field = "";
      } else { field += ch; }
    }
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }

  if (rows.length === 0) return [];
  const header = rows[0];
  return rows.slice(1).map(r => {
    const obj = {};
    header.forEach((h, i) => { obj[h.trim()] = (r[i] || "").trim(); });
    return obj;
  });
}

/* ------------------------------------------------------------------ */
/* Load CSVs and build lookup maps                                    */
/* ------------------------------------------------------------------ */
console.log("Loading CSVs…");
const attachmentsRows = parseCSV(path.join(IMPORT_DIR, "Attachments_001.csv"));
const candidatesRows = parseCSV(path.join(IMPORT_DIR, "Candidates_001.csv"));
console.log(`  Attachments: ${attachmentsRows.length} rows`);
console.log(`  Candidates:  ${candidatesRows.length} rows`);

// FileName → ParentId (candidate Zoho ID)
const fileNameToParentId = new Map();
for (const a of attachmentsRows) {
  const fn = a["File Name"];
  const pid = a["Parent Id"];
  if (fn && pid) {
    fileNameToParentId.set(fn, pid);
  }
}
console.log(`  File → ParentId map: ${fileNameToParentId.size}`);

// Candidate Zoho ID → Email
const candidateIdToEmail = new Map();
for (const c of candidatesRows) {
  const cid = c["Candidate Id"];
  const email = (c["Email"] || "").toLowerCase().trim();
  if (cid && email) {
    candidateIdToEmail.set(cid, email);
  }
}
console.log(`  CandidateId → Email map: ${candidateIdToEmail.size}`);

/* ------------------------------------------------------------------ */
/* DB setup                                                            */
/* ------------------------------------------------------------------ */
const db = new Database(DB_PATH);

// Preload all candidates by email, with their current cvUrl
const allCandidates = db.prepare("SELECT id, email, cvUrl FROM Candidate").all();
const emailToCandidate = new Map();
for (const c of allCandidates) {
  emailToCandidate.set(c.email.toLowerCase(), c);
}
console.log(`  DB candidates loaded: ${allCandidates.length}`);

const updateStmt = db.prepare(
  "UPDATE Candidate SET cvUrl = ?, cvFileName = ? WHERE id = ? AND (cvUrl IS NULL OR cvUrl = '')"
);

/* ------------------------------------------------------------------ */
/* Process each attachment file                                       */
/* ------------------------------------------------------------------ */
console.log("\nProcessing attachment files…");

if (!fs.existsSync(ATTACHMENTS_DIR)) {
  console.error(`Attachments directory not found: ${ATTACHMENTS_DIR}`);
  process.exit(1);
}

const files = fs.readdirSync(ATTACHMENTS_DIR).filter(f => {
  const ext = path.extname(f).toLowerCase();
  return [".pdf", ".doc", ".docx"].includes(ext);
});
console.log(`  Found ${files.length} resume files on disk`);

let matched = 0;
let linkedNew = 0;
let skippedAlreadyHasCv = 0;
let noAttachmentRow = 0;
let noCandidateInCsv = 0;
let noDbCandidate = 0;

for (const fileName of files) {
  const fullPath = path.join(ATTACHMENTS_DIR, fileName);

  // Step 1: Find attachment row by file name
  const parentId = fileNameToParentId.get(fileName);
  if (!parentId) {
    noAttachmentRow++;
    continue;
  }

  // Step 2: Find candidate email by Zoho ID
  const email = candidateIdToEmail.get(parentId);
  if (!email) {
    noCandidateInCsv++;
    continue;
  }

  // Step 3: Find candidate in DB by email
  const candidate = emailToCandidate.get(email);
  if (!candidate) {
    noDbCandidate++;
    continue;
  }

  matched++;

  // Step 4: Skip if candidate already has a CV
  if (candidate.cvUrl && candidate.cvUrl !== "") {
    skippedAlreadyHasCv++;
    continue;
  }

  // Step 5: Copy file to uploads with unique name + update DB
  const ext = path.extname(fileName);
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueName = `${path.basename(safeName, ext)}_${Date.now()}${ext}`;
  const destPath = path.join(CV_UPLOAD_DIR, uniqueName);

  try {
    fs.copyFileSync(fullPath, destPath);
  } catch (err) {
    console.error(`  copy failed for ${fileName}: ${err.message}`);
    continue;
  }

  const relativePath = `/uploads/documents/CV/${uniqueName}`;
  const result = updateStmt.run(relativePath, fileName, candidate.id);
  if (result.changes > 0) {
    linkedNew++;
    // Keep local cache in sync so this candidate isn't re-linked with another file
    candidate.cvUrl = relativePath;
  } else {
    // Race condition shouldn't happen but clean up if write didn't occur
    try { fs.unlinkSync(destPath); } catch {}
  }
}

/* ------------------------------------------------------------------ */
/* Summary                                                             */
/* ------------------------------------------------------------------ */
const finalWithCv = db.prepare(
  "SELECT COUNT(*) AS n FROM Candidate WHERE cvUrl IS NOT NULL AND cvUrl != ''"
).get();

console.log("\n=== IMPORT SUMMARY ===");
console.log(`Resume files scanned:                ${files.length}`);
console.log(`Matched to an existing candidate:    ${matched}`);
console.log(`  → Newly linked (didn't have CV):   ${linkedNew}`);
console.log(`  → Skipped (already had CV):        ${skippedAlreadyHasCv}`);
console.log(`Not matched — no attachment row:     ${noAttachmentRow}`);
console.log(`Not matched — no candidate in CSV:   ${noCandidateInCsv}`);
console.log(`Not matched — no candidate in DB:    ${noDbCandidate}`);
console.log(`\nTotal candidates with CV (after):    ${finalWithCv.n}`);

db.close();
console.log("\nDone!");
