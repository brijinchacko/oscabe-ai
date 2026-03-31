import prisma from "../src/lib/prisma";

async function main() {
  console.log("=== Starting Deduplication ===\n");

  // 1. DEDUPLICATE CLIENTS
  console.log("--- Deduplicating Clients ---");
  const allClients = await prisma.client.findMany({
    select: { id: true, companyName: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const clientMap = new Map<string, string[]>();
  for (const c of allClients) {
    const key = c.companyName.toLowerCase().trim();
    if (!clientMap.has(key)) clientMap.set(key, []);
    clientMap.get(key)!.push(c.id);
  }

  let clientsRemoved = 0;
  for (const [, ids] of clientMap) {
    if (ids.length <= 1) continue;
    const keepId = ids[0];
    for (const removeId of ids.slice(1)) {
      await prisma.job.updateMany({ where: { clientId: removeId }, data: { clientId: keepId } });
      await prisma.contact.updateMany({ where: { clientId: removeId }, data: { clientId: keepId } });
      await prisma.activity.updateMany({ where: { clientId: removeId }, data: { clientId: keepId } });
      await prisma.document.updateMany({ where: { clientId: removeId }, data: { clientId: keepId } });
      await prisma.placement.updateMany({ where: { clientId: removeId }, data: { clientId: keepId } });
      await prisma.followUp.updateMany({ where: { clientId: removeId }, data: { clientId: keepId } });
      await prisma.client.delete({ where: { id: removeId } });
      clientsRemoved++;
    }
  }
  console.log(`  Removed ${clientsRemoved} duplicate clients`);

  // 2. DEDUPLICATE JOBS
  console.log("\n--- Deduplicating Jobs ---");
  const allJobs = await prisma.job.findMany({
    select: { id: true, title: true, clientId: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const jobMap = new Map<string, string[]>();
  for (const j of allJobs) {
    const key = `${j.title.toLowerCase().trim()}|${j.clientId || "none"}`;
    if (!jobMap.has(key)) jobMap.set(key, []);
    jobMap.get(key)!.push(j.id);
  }

  let jobsRemoved = 0;
  for (const [, ids] of jobMap) {
    if (ids.length <= 1) continue;
    const keepId = ids[0];
    for (const removeId of ids.slice(1)) {
      await prisma.application.updateMany({ where: { jobId: removeId }, data: { jobId: keepId } });
      await prisma.activity.updateMany({ where: { jobId: removeId }, data: { jobId: keepId } });
      await prisma.document.updateMany({ where: { jobId: removeId }, data: { jobId: keepId } });
      await prisma.interview.updateMany({ where: { jobId: removeId }, data: { jobId: keepId } });
      await prisma.job.delete({ where: { id: removeId } });
      jobsRemoved++;
    }
  }
  console.log(`  Removed ${jobsRemoved} duplicate jobs`);

  // 3. DEDUPLICATE DOCUMENTS
  console.log("\n--- Deduplicating Documents ---");
  const allDocs = await prisma.document.findMany({
    select: { id: true, fileName: true, clientId: true, candidateId: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const docMap = new Map<string, string[]>();
  for (const d of allDocs) {
    const key = `${d.fileName}|${d.clientId || ""}|${d.candidateId || ""}`;
    if (!docMap.has(key)) docMap.set(key, []);
    docMap.get(key)!.push(d.id);
  }

  let docsRemoved = 0;
  for (const [, ids] of docMap) {
    if (ids.length <= 1) continue;
    for (const removeId of ids.slice(1)) {
      await prisma.document.delete({ where: { id: removeId } });
      docsRemoved++;
    }
  }
  console.log(`  Removed ${docsRemoved} duplicate documents`);

  // 4. DEDUPLICATE CANDIDATES by name (for placeholder emails)
  console.log("\n--- Deduplicating Candidates ---");
  const placeholders = await prisma.candidate.findMany({
    where: {
      OR: [
        { email: { endsWith: "@linkedin.local" } },
        { email: { endsWith: "@imported.local" } },
        { email: { endsWith: "@screened.local" } },
        { email: { endsWith: "@cvreceived.local" } },
      ],
    },
    select: { id: true, firstName: true, lastName: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const candMap = new Map<string, string[]>();
  for (const c of placeholders) {
    const key = `${c.firstName.toLowerCase().trim()}|${c.lastName.toLowerCase().trim()}`;
    if (!candMap.has(key)) candMap.set(key, []);
    candMap.get(key)!.push(c.id);
  }

  let candsRemoved = 0;
  for (const [, ids] of candMap) {
    if (ids.length <= 1) continue;
    const keepId = ids[0];
    for (const removeId of ids.slice(1)) {
      try {
        await prisma.application.updateMany({ where: { candidateId: removeId }, data: { candidateId: keepId } });
        await prisma.activity.updateMany({ where: { candidateId: removeId }, data: { candidateId: keepId } });
        await prisma.document.updateMany({ where: { candidateId: removeId }, data: { candidateId: keepId } });
        await prisma.interview.updateMany({ where: { candidateId: removeId }, data: { candidateId: keepId } });
        await prisma.candidate.delete({ where: { id: removeId } });
        candsRemoved++;
      } catch {}
    }
  }
  console.log(`  Removed ${candsRemoved} duplicate candidates`);

  // 5. Remove garbage candidates
  console.log("\n--- Removing garbage ---");
  const garbage = await prisma.candidate.deleteMany({
    where: { firstName: { in: ["", " ", "undefined", "null", "Name", "Si N"] } },
  });
  console.log(`  Removed ${garbage.count} garbage records`);

  // Final
  console.log("\n=== FINAL COUNTS ===");
  console.log("Clients:", await prisma.client.count());
  console.log("Jobs:", await prisma.job.count());
  console.log("Candidates:", await prisma.candidate.count());
  console.log("Documents:", await prisma.document.count());

  await prisma.$disconnect();
}

main().catch(console.error);
