import { cn } from "@/features/shared/lib/utils"
import { RISK_META, RISK_ORDER } from "@/features/ml-dashboard/lib/risk"
import type { RiskLevel } from "@/features/ml-dashboard/types"

type RiskLegendProps = {
  levels?: RiskLevel[]
  className?: string
  compact?: boolean
}

export default function RiskLegend({
  levels = RISK_ORDER,
  className,
  compact = false,
}: RiskLegendProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground",
        compact ? "text-[11px]" : "text-xs",
        className,
      )}
    >
      {levels.map((level) => (
        <span key={level} className="inline-flex items-center gap-1.5">
          <span className={cn("h-2 w-2 rounded-full", RISK_META[level].dotClass)} aria-hidden="true" />
          {RISK_META[level].shortLabel}
        </span>
      ))}
    </div>
  )
}
