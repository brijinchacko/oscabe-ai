import prisma from "@/lib/prisma";

export interface SubscriberCriteria {
  roles?: string[];
  locations?: string[];
  platforms?: string[];
}

export interface TalentRadarCandidate {
  id: string;
  firstName: string;
  lastName: string;
  headline: string | null;
  location: string | null;
  skills: string[];
  availableFrom: string | null;
  contractType: string | null;
  createdAt: string;
}

export interface TalentRadarDigest {
  newCandidates: number;
  highlights: string[];
  matchedCandidates: TalentRadarCandidate[];
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
}

export async function generateTalentRadarDigest(
  subscriberCriteria: SubscriberCriteria,
): Promise<TalentRadarDigest> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Build where clause for candidates added in the last 7 days
  const whereClause: Record<string, unknown> = {
    createdAt: { gte: sevenDaysAgo },
    status: "ACTIVE",
  };

  // Filter by location if specified
  if (subscriberCriteria.locations && subscriberCriteria.locations.length > 0) {
    whereClause.OR = subscriberCriteria.locations.map((loc) => ({
      location: { contains: loc },
    }));
  }

  const candidates = await prisma.candidate.findMany({
    where: whereClause,
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Filter by platforms (match against skill names or platform field)
  let filtered = candidates;
  if (subscriberCriteria.platforms && subscriberCriteria.platforms.length > 0) {
    const platformSet = new Set(
      subscriberCriteria.platforms.map((p) => p.toLowerCase()),
    );
    filtered = candidates.filter((c) =>
      c.skills.some(
        (cs) =>
          platformSet.has(cs.skill.name.toLowerCase()) ||
          (cs.skill.platform &&
            platformSet.has(cs.skill.platform.toLowerCase())),
      ),
    );
  }

  // Filter by roles (match against headline)
  if (subscriberCriteria.roles && subscriberCriteria.roles.length > 0) {
    const roleLower = subscriberCriteria.roles.map((r) => r.toLowerCase());
    filtered = filtered.filter(
      (c) =>
        c.headline &&
        roleLower.some((role) => c.headline!.toLowerCase().includes(role)),
    );
  }

  const matchedCandidates: TalentRadarCandidate[] = filtered.map((c) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    headline: c.headline,
    location: c.location,
    skills: c.skills.map((cs) => cs.skill.name),
    availableFrom: c.availableFrom ? c.availableFrom.toISOString() : null,
    contractType: null,
    createdAt: c.createdAt.toISOString(),
  }));

  // Generate highlights
  const highlights: string[] = [];
  if (matchedCandidates.length > 0) {
    highlights.push(
      `${matchedCandidates.length} new candidate${matchedCandidates.length > 1 ? "s" : ""} matching your criteria this week`,
    );
  }

  // Top skills among matched candidates
  const skillCounts: Record<string, number> = {};
  for (const c of matchedCandidates) {
    for (const s of c.skills) {
      skillCounts[s] = (skillCounts[s] || 0) + 1;
    }
  }
  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  if (topSkills.length > 0) {
    highlights.push(`Top skills: ${topSkills.join(", ")}`);
  }

  // Location summary
  const locationCounts: Record<string, number> = {};
  for (const c of matchedCandidates) {
    if (c.location) {
      locationCounts[c.location] = (locationCounts[c.location] || 0) + 1;
    }
  }
  const topLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  if (topLocations.length > 0) {
    highlights.push(`Top locations: ${topLocations.join(", ")}`);
  }

  return {
    newCandidates: matchedCandidates.length,
    highlights,
    matchedCandidates,
    generatedAt: now.toISOString(),
    periodStart: sevenDaysAgo.toISOString(),
    periodEnd: now.toISOString(),
  };
}

export function formatDigestEmailHtml(digest: TalentRadarDigest): string {
  const candidateRows = digest.matchedCandidates
    .slice(0, 10)
    .map(
      (c) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;">
          ${c.firstName} ${c.lastName}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;color:#666;">
          ${c.headline || "—"}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;color:#666;">
          ${c.location || "—"}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;color:#666;">
          ${c.skills.slice(0, 3).join(", ")}
        </td>
      </tr>`,
    )
    .join("");

  const highlightItems = digest.highlights
    .map((h) => `<li style="margin-bottom:4px;color:#333;">${h}</li>`)
    .join("");

  return `
    <h2 style="color:#02012B;margin:0 0 16px;">Talent Radar Weekly Digest</h2>
    <p style="color:#666;margin:0 0 20px;">
      Here is your weekly summary of new automation engineering talent matching your criteria.
    </p>

    ${
      digest.highlights.length > 0
        ? `<div style="background:#f8f7ff;border-radius:8px;padding:16px;margin-bottom:20px;">
        <h3 style="color:#4540DB;margin:0 0 8px;font-size:15px;">Highlights</h3>
        <ul style="margin:0;padding-left:20px;font-size:14px;">${highlightItems}</ul>
      </div>`
        : ""
    }

    ${
      digest.matchedCandidates.length > 0
        ? `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #eee;border-radius:4px;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="text-align:left;padding:10px 12px;font-size:13px;color:#666;font-weight:600;">Name</th>
            <th style="text-align:left;padding:10px 12px;font-size:13px;color:#666;font-weight:600;">Role</th>
            <th style="text-align:left;padding:10px 12px;font-size:13px;color:#666;font-weight:600;">Location</th>
            <th style="text-align:left;padding:10px 12px;font-size:13px;color:#666;font-weight:600;">Skills</th>
          </tr>
        </thead>
        <tbody>${candidateRows}</tbody>
      </table>
      ${digest.matchedCandidates.length > 10 ? `<p style="color:#999;font-size:13px;margin-top:8px;">...and ${digest.matchedCandidates.length - 10} more candidates</p>` : ""}`
        : `<p style="color:#999;font-size:14px;">No new candidates matched your criteria this week. We will keep looking!</p>`
    }

    <div style="margin-top:24px;text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/portal/employer" style="display:inline-block;background:#4540DB;color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">
        View Full Talent Pool
      </a>
    </div>
  `;
}
