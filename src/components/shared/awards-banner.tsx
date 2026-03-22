"use client";

import Image from "next/image";
import { Trophy } from "lucide-react";
import { AWARDS } from "@/lib/constants";

interface AwardsBannerProps {
  /** Compact mode shows fewer awards in a single row */
  compact?: boolean;
  /** Optional accent color for the section */
  accentColor?: string;
}

export function AwardsBanner({ compact = false, accentColor = "#4540DB" }: AwardsBannerProps) {
  if (compact) {
    return (
      <div className="border-y border-white/[0.06] bg-white/[0.02] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 text-center">
            <Trophy className="h-4 w-4" style={{ color: accentColor }} />
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Award-Winning, Our Parent Company Wartens
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {AWARDS.slice(0, 4).map((award) => (
              <div
                key={award.name}
                className="group flex flex-col items-center gap-2 transition-all"
              >
                <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.05] p-1.5 transition-all group-hover:border-white/[0.2] group-hover:bg-white/[0.08] sm:h-16 sm:w-16">
                  <Image
                    src={award.image}
                    alt={award.name}
                    fill
                    className="object-contain p-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider" style={{ borderColor: `${accentColor}40`, background: `${accentColor}10`, color: accentColor }}>
            <Trophy className="h-3.5 w-3.5" />
            Award-Winning Heritage
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Backed by Wartens, Award-Winning Innovation
          </h2>
          <p className="mt-4 text-base text-gray-400">
            OSCABE is part of the Wartens group, recognised nationally for excellence in technology, entrepreneurship, and innovation.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {AWARDS.map((award) => (
            <div
              key={award.name}
              className="group relative flex flex-col items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-center backdrop-blur-sm transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]"
            >
              {/* Hover glow */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100"
                style={{ background: `radial-gradient(circle at center, ${accentColor}08, transparent 70%)` }}
              />
              <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.05] p-2 sm:h-24 sm:w-24">
                <Image
                  src={award.image}
                  alt={award.name}
                  fill
                  className="object-contain p-1"
                />
              </div>
              <p className="relative text-[11px] font-semibold leading-tight text-gray-400 transition-colors group-hover:text-white sm:text-xs">
                {award.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
