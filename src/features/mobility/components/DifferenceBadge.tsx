import { AlertTriangle, Minus, TrendingDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/features/shared/lib/utils'
import { formatAmount } from '../lib/format'

export default function DifferenceBadge({
  value,
  currency,
  className,
}: {
  value: number | null
  currency: string
  className?: string
}) {
  if (value === null) {
    return <span className="text-sm text-muted-foreground">—</span>
  }

  if (value > 0) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'gap-1 border-amber-200 bg-amber-50 font-semibold text-amber-700 tabular-nums dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
          className,
        )}
      >
        <AlertTriangle className="h-3 w-3" />+{formatAmount(value, currency)}
      </Badge>
    )
  }

  if (value < 0) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'gap-1 border-emerald-200 bg-emerald-50 font-semibold text-emerald-700 tabular-nums dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
          className,
        )}
      >
        <TrendingDown className="h-3 w-3" />
        {formatAmount(value, currency)}
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 font-semibold text-muted-foreground tabular-nums',
        className,
      )}
    >
      <Minus className="h-3 w-3" />
      {formatAmount(0, currency)}
    </Badge>
  )
}
