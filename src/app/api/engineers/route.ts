/**
 * GET /api/engineers
 *
 * Returns published engineer profiles for the public portal.
 * For MVP this reads from src/lib/engineers-data.ts. When real profiles
 * are migrated into the EngineerProfile Prisma table, swap the source
 * here without touching consumers.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getPublishedEngineers,
  RATE_BANDS,
  type EngineerProfile,
} from "@/lib/engineers-data";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const role = params.get("role") ?? undefined;
  const platform = params.get("platform") ?? undefined;
  const seniority = params.get("seniority") ?? undefined;
  const availability = params.get("availability") ?? undefined;
  const rateBand = params.get("rate") ?? undefined;
  const minRate = params.get("minRate") ? parseInt(params.get("minRate")!, 10) : undefined;
  const maxRate = params.get("maxRate") ? parseInt(params.get("maxRate")!, 10) : undefined;

  let engineers: EngineerProfile[] = getPublishedEngineers();
  if (role) engineers = engineers.filter((e) => e.category === role);
  if (platform)
    engineers = engineers.filter((e) =>
      e.platforms.some((p) => p.toLowerCase().includes(platform.toLowerCase())),
    );
  if (seniority) engineers = engineers.filter((e) => e.seniorityBucket === seniority);
  if (availability) engineers = engineers.filter((e) => e.availability === availability);

  if (rateBand) {
    const band = RATE_BANDS.find((b) => b.value === rateBand);
    if (band) {
      engineers = engineers.filter(
        (e) => e.monthlyRateLow <= band.max && e.monthlyRateHigh >= band.min,
      );
    }
  }
  if (typeof minRate === "number") {
    engineers = engineers.filter((e) => e.monthlyRateHigh >= minRate);
  }
  if (typeof maxRate === "number") {
    engineers = engineers.filter((e) => e.monthlyRateLow <= maxRate);
  }

  // Strip internal-only fields for public consumers
  const publicEngineers = engineers.map((e) => ({
    slug: e.slug,
    name: e.name,
    title: e.title,
    category: e.category,
    seniority: e.seniority,
    seniorityBucket: e.seniorityBucket,
    location: e.location,
    platforms: e.platforms,
    industries: e.industries,
    availability: e.availability,
    availableFrom: e.availableFrom,
    monthlyRate: e.monthlyRate,
    monthlyRateLow: e.monthlyRateLow,
    monthlyRateHigh: e.monthlyRateHigh,
    verified: e.verified,
    featured: e.featured,
    avatarInitials: e.avatarInitials,
    photoUrl: e.photoUrl,
  }));

  return NextResponse.json({
    count: publicEngineers.length,
    engineers: publicEngineers,
  });
}
