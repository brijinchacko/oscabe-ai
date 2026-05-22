import type { Availability } from "@/lib/engineers-data";

interface AvailabilityBadgeProps {
  availability: Availability;
  size?: "sm" | "md";
}

const CONFIG: Record<Availability, { label: string; dot: string; text: string; bg: string }> = {
  available: {
    label: "Available now",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    bg: "bg-emerald-400/10 border-emerald-400/30",
  },
  "2-weeks": {
    label: "Available in 2 weeks",
    dot: "bg-amber-400",
    text: "text-amber-300",
    bg: "bg-amber-400/10 border-amber-400/30",
  },
  "part-time": {
    label: "Part-time available",
    dot: "bg-sky-400",
    text: "text-sky-300",
    bg: "bg-sky-400/10 border-sky-400/30",
  },
};

export function AvailabilityBadge({ availability, size = "md" }: AvailabilityBadgeProps) {
  const c = CONFIG[availability];
  const dotSize = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";
  const boxSize = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${c.bg} ${c.text} ${boxSize}`}
    >
      <span className={`rounded-full ${c.dot} ${dotSize}`} />
      {c.label}
    </span>
  );
}
