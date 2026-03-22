"use client"

import * as React from "react"
import {
  StickyNote,
  Phone,
  Mail,
  Users,
  ArrowRightLeft,
  ChevronDown,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// ── Types ──────────────────────────────────────────────────────────────

export type ActivityType = "NOTE" | "CALL" | "EMAIL" | "MEETING" | "STATUS_CHANGE"

export interface Activity {
  id: string
  type: ActivityType
  title: string
  content?: string
  user: string
  createdAt: string | Date
}

export interface ActivityTimelineProps {
  activities: Activity[]
  onAddNote?: (content: string) => void
  hasMore?: boolean
  onLoadMore?: () => void
}

// ── Helpers ────────────────────────────────────────────────────────────

const ACTIVITY_CONFIG: Record<
  ActivityType,
  { icon: React.ElementType; bgColor: string; iconColor: string }
> = {
  NOTE: {
    icon: StickyNote,
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  CALL: {
    icon: Phone,
    bgColor: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
  },
  EMAIL: {
    icon: Mail,
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  MEETING: {
    icon: Users,
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  STATUS_CHANGE: {
    icon: ArrowRightLeft,
    bgColor: "bg-gray-100 dark:bg-gray-800",
    iconColor: "text-gray-600 dark:text-gray-400",
  },
}

function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffSecs < 60) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return "yesterday"
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffWeeks < 5) return `${diffWeeks}w ago`
  return `${diffMonths}mo ago`
}

// ── Add Note Form ──────────────────────────────────────────────────────

function AddNoteForm({ onAddNote }: { onAddNote: (content: string) => void }) {
  const [content, setContent] = React.useState("")
  const [isFocused, setIsFocused] = React.useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return
    onAddNote(trimmed)
    setContent("")
    setIsFocused(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div
        className={`rounded-lg border bg-background transition-shadow ${
          isFocused ? "ring-2 ring-ring/50 border-ring" : ""
        }`}
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            if (!content.trim()) setIsFocused(false)
          }}
          placeholder="Add a note..."
          rows={isFocused ? 3 : 1}
          className="w-full resize-none rounded-lg bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
        />
        {isFocused && (
          <div className="flex justify-end border-t px-3 py-2">
            <Button type="submit" size="sm" disabled={!content.trim()}>
              <Send className="size-3.5" />
              Add Note
            </Button>
          </div>
        )}
      </div>
    </form>
  )
}

// ── Timeline Item ──────────────────────────────────────────────────────

function TimelineItem({ activity }: { activity: Activity }) {
  const config = ACTIVITY_CONFIG[activity.type]
  const Icon = config.icon

  return (
    <div className="relative flex gap-3 pb-6 last:pb-0">
      {/* Vertical line */}
      <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border last:hidden" />

      {/* Icon */}
      <div
        className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ${config.bgColor}`}
      >
        <Icon className={`size-3.5 ${config.iconColor}`} />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-0.5 pt-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-medium text-foreground">
            {activity.title}
          </p>
          <time className="shrink-0 text-xs text-muted-foreground">
            {formatRelativeTime(activity.createdAt)}
          </time>
        </div>
        <p className="text-xs text-muted-foreground">{activity.user}</p>
        {activity.content && (
          <p className="mt-1 text-sm leading-relaxed text-foreground/80">
            {activity.content}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────

export function ActivityTimeline({
  activities,
  onAddNote,
  hasMore = false,
  onLoadMore,
}: ActivityTimelineProps) {
  return (
    <div className="flex flex-col">
      {onAddNote && <AddNoteForm onAddNote={onAddNote} />}

      <div className="flex flex-col">
        {activities.map((activity) => (
          <TimelineItem key={activity.id} activity={activity} />
        ))}
      </div>

      {activities.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">No activity yet</p>
        </div>
      )}

      {hasMore && onLoadMore && (
        <div className="mt-4 flex justify-center">
          <Button variant="ghost" size="sm" onClick={onLoadMore}>
            <ChevronDown className="size-4" />
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
