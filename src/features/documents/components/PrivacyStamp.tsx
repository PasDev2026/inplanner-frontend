import { Badge } from '@/components/ui/badge'
import { cn } from '@/features/shared/lib/utils'
import { privacyDot, privacyLabel, privacyTone } from '../lib/privacy'

export function PrivacyStamp({
  level,
  className,
}: {
  level: number
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 rounded-full border-doc-line bg-transparent px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em]',
        privacyTone(level),
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', privacyDot(level))} />
      {privacyLabel(level)}
    </Badge>
  )
}
