import { cn } from "@/features/shared/lib/utils"
import { RISK_META } from "@/features/ml-dashboard/lib/risk"
import type { RiskLevel } from "@/features/ml-dashboard/types"

type RiskBadgeProps = {
  level: RiskLevel
  className?: string
  withDot?: boolean
}

export default function RiskBadge({ level, className, withDot = true }: RiskBadgeProps) {
  const meta = RISK_META[level]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        meta.badgeClass,
        className,
      )}
    >
      {withDot && <span className={cn("h-1.5 w-1.5 rounded-full", meta.dotClass)} aria-hidden="true" />}
      {meta.shortLabel}
    </span>
  )
}
