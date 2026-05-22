import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { EngineerProfile } from "@/lib/engineers-data";
import { VerifiedBadge } from "./verified-badge";
import { AvailabilityBadge } from "./availability-badge";

interface EngineerCardProps {
  engineer: EngineerProfile;
}

export function EngineerCard({ engineer: e }: EngineerCardProps) {
  const platformsShown = e.platforms.slice(0, 4);
  const platformsMore = e.platforms.length - platformsShown.length;
  const industriesShown = e.industries.slice(0, 2);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.04]">
      {/* Top: avatar + identity */}
      <div className="flex items-start gap-3 p-5 pb-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4540DB] to-[#00D4FF] text-base font-bold text-white">
          {e.avatarInitials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold leading-tight text-white">
            {e.name}
          </h3>
          <p className="mt-0.5 truncate text-sm text-gray-400">{e.title}</p>
          <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{e.location}</span>
          </div>
        </div>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-2 px-5 pb-3">
        {e.verified && <VerifiedBadge size="sm" />}
        <AvailabilityBadge availability={e.availability} size="sm" />
      </div>

      {/* Platforms */}
      <div className="px-5 pb-2">
        <div className="flex flex-wrap gap-1.5">
          {platformsShown.map((p) => (
            <span
              key={p}
              className="rounded-md border border-[#4540DB]/30 bg-[#4540DB]/10 px-2 py-0.5 text-[11px] font-medium text-[#8A85F0]"
            >
              {p}
            </span>
          ))}
          {platformsMore > 0 && (
            <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-gray-400">
              +{platformsMore} more
            </span>
          )}
        </div>
      </div>

      {/* Industries */}
      <div className="px-5 pb-4">
        <div className="flex flex-wrap gap-1.5">
          {industriesShown.map((ind) => (
            <span
              key={ind}
              className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-gray-400"
            >
              {ind}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom stats */}
      <div className="mt-auto border-t border-white/[0.06] bg-white/[0.01] px-5 py-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs text-gray-500">{e.seniority}</span>
          <span className="text-sm font-semibold text-white">
            £{e.monthlyRateLow.toLocaleString()}-{e.monthlyRateHigh.toLocaleString()}
            <span className="text-xs font-normal text-gray-500">/mo</span>
          </span>
        </div>
      </div>

      {/* CTAs */}
      <div className="grid grid-cols-2 gap-2 p-3">
        <Link
          href={`/engineers/${e.slug}`}
          className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#4540DB] px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-[#3733B0]"
        >
          View Profile
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link
          href={`/contact?type=engineer-request&engineer=${e.slug}`}
          className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-gray-200 transition-all hover:border-white/30 hover:bg-white/[0.08]"
        >
          Enquire
        </Link>
      </div>
    </article>
  );
}
