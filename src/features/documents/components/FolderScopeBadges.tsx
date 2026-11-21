import { Building2, Layers3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/features/shared/lib/utils'
import { formatSedeName } from '../lib/folder-utils'

export function FolderScopeBadges({
  sedeName,
  areaName,
  compact = false,
  showEmpty = false,
  showSede = true,
  showArea = true,
  className,
}: {
  sedeName?: string | null
  areaName?: string | null
  compact?: boolean
  showEmpty?: boolean
  showSede?: boolean
  showArea?: boolean
  className?: string
}) {
  const sede = formatSedeName(sedeName)

  if (!showSede && !showArea) return null
  if (!sede && !areaName && !showEmpty) return null

  return (
    <span
      className={cn(
        'inline-flex flex-wrap items-center gap-1',
        className,
      )}
    >
      {showSede && (sede || showEmpty) && (
        <Badge
          variant="outline"
          className={cn(
            'gap-1 rounded-full border-doc-line bg-transparent font-medium text-doc-muted',
            compact ? 'px-1.5 py-0 text-[8px]' : 'px-2 py-0.5 text-[9px]',
          )}
        >
          <Building2 className={compact ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
          {sede ?? 'Sin sede'}
        </Badge>
      )}

      {showArea && (areaName || showEmpty) && (
        <Badge
          variant="outline"
          className={cn(
            'gap-1 rounded-full border-doc-line bg-transparent font-medium text-doc-muted',
            compact ? 'px-1.5 py-0 text-[8px]' : 'px-2 py-0.5 text-[9px]',
          )}
        >
          <Layers3 className={compact ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
          {areaName ?? 'Sin área'}
        </Badge>
      )}
    </span>
  )
}
