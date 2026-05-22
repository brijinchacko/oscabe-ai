"use client";

import { useMemo, useState } from "react";
import { TrendingDown } from "lucide-react";

interface RoleOption {
  value: string;
  label: string;
  ukAllInLow: number; // £/month
  ukAllInHigh: number;
  oscabeLow: number;
  oscabeHigh: number;
}

const ROLES: RoleOption[] = [
  {
    value: "plc-mid",
    label: "PLC Programmer (Mid)",
    ukAllInLow: 7200,
    ukAllInHigh: 8400,
    oscabeLow: 4800,
    oscabeHigh: 5600,
  },
  {
    value: "plc-senior",
    label: "PLC / SCADA Lead (Senior)",
    ukAllInLow: 9800,
    ukAllInHigh: 11200,
    oscabeLow: 7200,
    oscabeHigh: 8400,
  },
  {
    value: "scada-mid",
    label: "SCADA Engineer (Mid)",
    ukAllInLow: 7800,
    ukAllInHigh: 9000,
    oscabeLow: 5600,
    oscabeHigh: 6400,
  },
  {
    value: "ml-mid",
    label: "ML / Computer Vision Engineer",
    ukAllInLow: 9200,
    ukAllInHigh: 10600,
    oscabeLow: 6800,
    oscabeHigh: 7600,
  },
  {
    value: "dcs-senior",
    label: "DCS / EC&I Senior",
    ukAllInLow: 11200,
    ukAllInHigh: 13000,
    oscabeLow: 8400,
    oscabeHigh: 9600,
  },
];

const fmt = (v: number) => `£${v.toLocaleString()}`;

export function SavingsCalculator() {
  const [roleId, setRoleId] = useState<string>("scada-mid");
  const role = useMemo(() => ROLES.find((r) => r.value === roleId)!, [roleId]);

  const ukMid = (role.ukAllInLow + role.ukAllInHigh) / 2;
  const oscabeMid = (role.oscabeLow + role.oscabeHigh) / 2;
  const monthlySavings = ukMid - oscabeMid;
  const annualSavings = monthlySavings * 12;
  const savingsPct = Math.round((monthlySavings / ukMid) * 100);

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Savings Calculator</h3>
          <p className="mt-1 text-sm text-gray-400">
            Compare UK all-in cost to OSCABE monthly rate. All figures GBP, 2026.
          </p>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-gray-400">Role</span>
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm font-medium text-white focus:border-[#4540DB] focus:outline-none focus:ring-2 focus:ring-[#4540DB]/30 sm:min-w-[260px]"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value} className="bg-[#02012B] text-white">
                {r.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="UK all-in cost / month"
          value={`${fmt(role.ukAllInLow)}-${fmt(role.ukAllInHigh)}`}
          accent="text-red-300"
          note="Salary + NI + pension + recruitment + admin"
        />
        <Stat
          label="OSCABE / month"
          value={`${fmt(role.oscabeLow)}-${fmt(role.oscabeHigh)}`}
          accent="text-emerald-300"
          note="All-inclusive, GBP, no admin"
        />
        <Stat
          label="Your saving"
          value={`${fmt(monthlySavings)}/mo`}
          accent="text-white"
          note={`${fmt(annualSavings)}/year (${savingsPct}%)`}
          highlight
        />
      </div>

      <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/30 bg-[#00D4FF]/10 px-3 py-1.5 text-xs font-medium text-[#33D9FF]">
        <TrendingDown className="h-3.5 w-3.5" />
        Numbers based on 2026 UK market benchmarks. Email info@oscabe.com for a tailored estimate.
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  note,
  highlight = false,
}: {
  label: string;
  value: string;
  accent: string;
  note?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        highlight
          ? "border-[#4540DB]/40 bg-gradient-to-br from-[#4540DB]/10 to-[#00D4FF]/10"
          : "border-white/[0.06] bg-white/[0.02]"
      }`}
    >
      <p className="text-xs uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`mt-2 text-xl font-bold ${accent} sm:text-2xl`}>{value}</p>
      {note && <p className="mt-1.5 text-[11px] leading-tight text-gray-500">{note}</p>}
    </div>
  );
}
