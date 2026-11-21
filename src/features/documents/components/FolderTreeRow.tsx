import { format } from 'date-fns'
import { ChevronRight, Folder } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/features/shared/lib/utils'
import type { FolderNode } from '../lib/types'
import { FolderScopeBadges } from './FolderScopeBadges'
import { PrivacyStamp } from './PrivacyStamp'

export function FolderTreeRow({
  folder,
  depth,
  rootId,
  expandedIds,
  onToggle,
  onOpenFolder,
  sedeNames,
}: {
  folder: FolderNode
  depth: number
  rootId: string
  expandedIds: Set<string>
  onToggle: (id: string) => void
  onOpenFolder: (folderId: string, rootId: string) => void
  sedeNames: Map<string, string>
}) {
  const children = folder.children ?? []
  const hasChildren = children.length > 0
  const isExpanded = expandedIds.has(folder.id)

  return (
    <Collapsible
      open={hasChildren ? isExpanded : false}
      onOpenChange={() => onToggle(folder.id)}
    >
      <div
        role="treeitem"
        aria-level={depth + 1}
        aria-expanded={hasChildren ? isExpanded : undefined}
        tabIndex={0}
        onClick={() => onOpenFolder(folder.id, rootId)}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onOpenFolder(folder.id, rootId)
          }
        }}
        className="flex cursor-pointer items-start gap-3 border-b border-doc-line/70 px-4 py-2.5 transition-colors hover:bg-doc-paper-strong/60"
      >
        <div
          className="flex min-w-0 flex-1 items-start gap-1.5"
          style={{ paddingLeft: depth * 18 }}
        >
          {hasChildren ? (
            <CollapsibleTrigger
              className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-doc-muted hover:bg-doc-paper-strong hover:text-doc-ink"
              aria-label={
                isExpanded
                  ? `Contraer ${folder.name}`
                  : `Expandir ${folder.name}`
              }
              onClick={(event) => event.stopPropagation()}
            >
              <ChevronRight
                className={cn(
                  'h-3.5 w-3.5 transition-transform',
                  isExpanded && 'rotate-90',
                )}
              />
            </CollapsibleTrigger>
          ) : (
            <span className="h-6 w-6 shrink-0" />
          )}

          <Folder className="mt-0.5 h-4 w-4 shrink-0 text-doc-accent" />

          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-doc-ink">
              {folder.name}
            </p>
            <FolderScopeBadges
              className="mt-1 md:hidden"
              sedeName={sedeNames.get(folder.sedeId ?? '')}
              areaName={folder.areaName}
              compact
              showEmpty={sedeNames.size > 0}
            />
          </div>
        </div>

        <div className="hidden w-[120px] shrink-0 pt-0.5 md:block">
          <FolderScopeBadges
            sedeName={sedeNames.get(folder.sedeId ?? '')}
            areaName={null}
            compact
            showEmpty={sedeNames.size > 0}
            showArea={false}
          />
        </div>

        <div className="hidden w-[140px] shrink-0 pt-0.5 lg:block">
          <FolderScopeBadges
            sedeName={null}
            areaName={folder.areaName}
            compact
            showEmpty
            showSede={false}
          />
        </div>

        <div className="hidden w-[110px] shrink-0 pt-0.5 sm:block">
          <PrivacyStamp level={folder.privacyLevel} />
        </div>

        <div className="hidden w-[140px] shrink-0 truncate pt-0.5 text-[11px] text-doc-muted xl:block">
          {folder.owner?.name ?? '—'}
        </div>

        <div className="hidden w-[70px] shrink-0 pt-0.5 text-right text-[11px] tabular-nums text-doc-muted sm:block">
          {folder.documentsCount ?? 0}
        </div>

        <div className="hidden w-[85px] shrink-0 pt-0.5 text-right text-[11px] tabular-nums text-doc-muted lg:block">
          {children.length}
        </div>

        <div className="hidden w-[110px] shrink-0 pt-0.5 text-right text-[11px] tabular-nums text-doc-muted xl:block">
          {format(new Date(folder.updatedAt), 'dd MMM yyyy')}
        </div>
      </div>

      {hasChildren && (
        <CollapsibleContent role="group">
          {children.map((child) => (
            <FolderTreeRow
              key={child.id}
              folder={child}
              depth={depth + 1}
              rootId={rootId}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onOpenFolder={onOpenFolder}
              sedeNames={sedeNames}
            />
          ))}
        </CollapsibleContent>
      )}
    </Collapsible>
  )
}
