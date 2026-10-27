import { cn } from "@/features/shared/lib/utils"
import { formatProbability, RISK_META } from "@/features/ml-dashboard/lib/risk"
import type { RiskLevel } from "@/features/ml-dashboard/types"

type ProbabilityBarProps = {
  value: number
  level: RiskLevel
  className?: string
  showValue?: boolean
}

export default function ProbabilityBar({
  value,
  level,
  className,
  showValue = true,
}: ProbabilityBarProps) {
  const meta = RISK_META[level]

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="h-1.5 min-w-10 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", meta.barClass)}
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
      {showValue && (
        <span className={cn("w-9 shrink-0 text-right text-xs font-semibold tabular-nums", meta.textClass)}>
          {formatProbability(value)}
        </span>
      )}
    </div>
  )
}
