"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { X } from "lucide-react";
import {
  ROLE_CATEGORIES,
  PLATFORM_OPTIONS,
  SENIORITY_OPTIONS,
  AVAILABILITY_OPTIONS,
  RATE_BANDS,
} from "@/lib/engineers-data";

export function EngineerFilterBar() {
  const router = useRouter();
  const params = useSearchParams();

  const role = params.get("role") ?? "";
  const platform = params.get("platform") ?? "";
  const seniority = params.get("seniority") ?? "";
  const availability = params.get("availability") ?? "";
  const rate = params.get("rate") ?? "";

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(Array.from(params.entries()));
      if (value) next.set(key, value);
      else next.delete(key);
      router.push(`/engineers?${next.toString()}`, { scroll: false });
    },
    [params, router],
  );

  const clearAll = () => router.push("/engineers", { scroll: false });
  const hasFilters = role || platform || seniority || availability || rate;

  return (
    <div className="sticky top-16 z-30 -mx-4 border-y border-white/[0.06] bg-[#02012B]/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <FilterSelect
            label="Role"
            value={role}
            onChange={(v) => setParam("role", v)}
            options={[
              { value: "", label: "All roles" },
              ...ROLE_CATEGORIES.map((r) => ({ value: r, label: r })),
            ]}
          />
          <FilterSelect
            label="Platform"
            value={platform}
            onChange={(v) => setParam("platform", v)}
            options={[
              { value: "", label: "All platforms" },
              ...PLATFORM_OPTIONS.map((p) => ({ value: p, label: p })),
            ]}
          />
          <FilterSelect
            label="Seniority"
            value={seniority}
            onChange={(v) => setParam("seniority", v)}
            options={[
              { value: "", label: "All seniority" },
              ...SENIORITY_OPTIONS.map((s) => ({ value: s.value, label: s.label })),
            ]}
          />
          <FilterSelect
            label="Availability"
            value={availability}
            onChange={(v) => setParam("availability", v)}
            options={[
              { value: "", label: "Any availability" },
              ...AVAILABILITY_OPTIONS.map((a) => ({ value: a.value, label: a.label })),
            ]}
          />
          <FilterSelect
            label="Rate"
            value={rate}
            onChange={(v) => setParam("rate", v)}
            options={[
              { value: "", label: "Any rate" },
              ...RATE_BANDS.map((r) => ({ value: r.value, label: r.label })),
            ]}
          />

          {hasFilters && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-gray-300 transition-all hover:border-white/20 hover:bg-white/[0.08]"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] py-1.5 pl-3 pr-1.5 text-xs">
      <span className="font-medium text-gray-400">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer rounded-md bg-transparent py-1 pr-2 font-medium text-white outline-none focus:ring-2 focus:ring-[#4540DB]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#02012B] text-white">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
