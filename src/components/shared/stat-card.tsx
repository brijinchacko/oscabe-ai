"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown } from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────

export interface StatCardProps {
  label: string
  value: string | number
  change?: string
  changeType?: "up" | "down"
  icon?: LucideIcon
}

// ── Component ──────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  change,
  changeType,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {change && (
            <div className="flex items-center gap-1 mt-1">
              {changeType === "up" && (
                <TrendingUp className="size-3.5 text-emerald-600" />
              )}
              {changeType === "down" && (
                <TrendingDown className="size-3.5 text-red-500" />
              )}
              <span
                className={`text-xs font-medium ${
                  changeType === "up"
                    ? "text-emerald-600"
                    : changeType === "down"
                      ? "text-red-500"
                      : "text-muted-foreground"
                }`}
              >
                {change}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-5 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  )
}
