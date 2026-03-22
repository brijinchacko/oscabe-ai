"use client"

import * as React from "react"
import { CheckCircle2 } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// ── Types ──────────────────────────────────────────────────────────────

export interface SkillBadgeProps {
  name: string
  proficiency?: number
  isVerified?: boolean
  yearsExp?: number
  lastUsed?: string
}

// ── Helpers ────────────────────────────────────────────────────────────

function getProficiencyColor(value: number): string {
  if (value >= 80) return "bg-emerald-500"
  if (value >= 40) return "bg-amber-500"
  return "bg-red-500"
}

function getProficiencyLabel(value: number): string {
  if (value >= 80) return "Advanced"
  if (value >= 40) return "Intermediate"
  return "Beginner"
}

// ── Component ──────────────────────────────────────────────────────────

export function SkillBadge({
  name,
  proficiency,
  isVerified,
  yearsExp,
  lastUsed,
}: SkillBadgeProps) {
  const hasTooltipContent =
    proficiency !== undefined || yearsExp !== undefined || lastUsed !== undefined

  const badge = (
    <div className="inline-flex flex-col">
      {/* Badge */}
      <span
        className={`inline-flex items-center gap-1 rounded-md border bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground ${
          isVerified ? "border-emerald-200 dark:border-emerald-800" : ""
        }`}
      >
        {name}
        {isVerified && (
          <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
        )}
      </span>

      {/* Proficiency bar */}
      {proficiency !== undefined && (
        <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${getProficiencyColor(proficiency)}`}
            style={{ width: `${Math.min(100, Math.max(0, proficiency))}%` }}
          />
        </div>
      )}
    </div>
  )

  if (!hasTooltipContent) return badge

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span className="inline-flex cursor-default">{badge}</span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-semibold">{name}</span>
            {proficiency !== undefined && (
              <span>
                Proficiency: {proficiency}% ({getProficiencyLabel(proficiency)})
              </span>
            )}
            {yearsExp !== undefined && (
              <span>
                Experience: {yearsExp} {yearsExp === 1 ? "year" : "years"}
              </span>
            )}
            {lastUsed && <span>Last used: {lastUsed}</span>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
