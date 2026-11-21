import { Folder, FolderOpen } from 'lucide-react'
import { cn } from '@/features/shared/lib/utils'
import type { FolderNode } from '../lib/types'
import { countFolderDocuments } from '../lib/folder-utils'

function FolderTreeItem({
  node,
  depth,
  activeId,
  onSelect,
}: {
  node: FolderNode
  depth: number
  activeId: string | null
  onSelect: (id: string) => void
}) {
  const active = node.id === activeId
  const Icon = active ? FolderOpen : Folder

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(node.id)}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex w-full items-center gap-2 rounded-md py-1.5 pr-2 text-left text-[12.5px] transition-colors',
          active
            ? 'bg-doc-accent-soft font-semibold text-doc-ink'
            : 'text-doc-muted hover:bg-doc-paper-strong hover:text-doc-ink',
        )}
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{node.name}</span>
        <span className="text-[10px] tabular-nums text-doc-muted">
          {countFolderDocuments(node)}
        </span>
      </button>

      {node.children && node.children.length > 0 && (
        <ul className="mt-0.5 space-y-0.5">
          {node.children.map((child) => (
            <FolderTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              activeId={activeId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export function FolderTree({
  nodes,
  activeId,
  onSelect,
}: {
  nodes: FolderNode[]
  activeId: string | null
  onSelect: (id: string) => void
}) {
  if (nodes.length === 0) {
    return (
      <p className="px-2 py-3 text-xs text-doc-muted">
        Sin subcarpetas todavía.
      </p>
    )
  }

  return (
    <ul className="space-y-0.5">
      {nodes.map((node) => (
        <FolderTreeItem
          key={node.id}
          node={node}
          depth={0}
          activeId={activeId}
          onSelect={onSelect}
        />
      ))}
    </ul>
  )
}
