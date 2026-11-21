import { Folder, Plus, X } from 'lucide-react'
import { cn } from '@/features/shared/lib/utils'
import type { FolderNode } from '../lib/types'
import { countFolderDocuments } from '../lib/folder-utils'

export function ShelfTabs({
  roots,
  activeRootId,
  onSelect,
  onCreate,
  onClose,
}: {
  roots: FolderNode[]
  activeRootId: string | null
  onSelect: (id: string) => void
  onCreate?: () => void
  onClose: (id: string) => void
}) {
  return (
    <div className="flex items-end gap-1 overflow-x-auto px-1 pb-0">
      {roots.map((root) => {
        const active = root.id === activeRootId
        return (
          <div
            key={root.id}
            className={cn(
              'group relative flex h-9 min-w-[130px] max-w-[190px] rounded-t-lg border transition-colors',
              active
                ? 'border-doc-line border-b-transparent bg-doc-paper text-doc-ink'
                : 'border-transparent bg-doc-paper-strong/60 text-doc-muted hover:bg-doc-paper-strong',
            )}
          >
            <button
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(root.id)}
              className="flex h-full w-full min-w-0 items-center gap-1.5 px-2.5 pr-6 text-left"
            >
              <Folder className="h-3 w-3 shrink-0" />
              <span className="min-w-0 flex-1 truncate text-[12px] font-semibold">
                {root.name}
              </span>
              <span className="shrink-0 text-[9px] tabular-nums text-doc-muted">
                {countFolderDocuments(root)}
              </span>
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onClose(root.id)
              }}
              className={cn(
                'absolute right-0.5 top-1/2 inline-flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded text-doc-muted transition-opacity hover:bg-doc-paper-strong hover:text-doc-ink focus-visible:opacity-100',
                active
                  ? 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
                  : 'opacity-0 group-hover:opacity-100',
              )}
              aria-label={`Cerrar estante ${root.name}`}
              title="Cerrar estante"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        )
      })}

      {onCreate && (
        <button
          type="button"
          onClick={onCreate}
          className="mb-0 flex h-9 min-w-[44px] items-center justify-center rounded-lg border border-dashed border-doc-line bg-transparent text-doc-muted transition-colors hover:bg-doc-paper-strong hover:text-doc-ink"
          aria-label="Nueva carpeta principal"
          title="Nueva carpeta principal"
        >
          <Plus className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
