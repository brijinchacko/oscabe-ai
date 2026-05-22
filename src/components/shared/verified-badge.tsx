import { ShieldCheck } from "lucide-react";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function VerifiedBadge({ size = "md", className = "" }: VerifiedBadgeProps) {
  const sizes = {
    sm: { box: "px-2 py-0.5 text-[10px]", icon: "h-3 w-3" },
    md: { box: "px-2.5 py-1 text-xs", icon: "h-3.5 w-3.5" },
    lg: { box: "px-3 py-1.5 text-sm", icon: "h-4 w-4" },
  };
  const s = sizes[size];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 font-semibold text-emerald-300 ${s.box} ${className}`}
    >
      <ShieldCheck className={s.icon} />
      OSCABE Verified
    </span>
  );
}
