import { format } from 'date-fns'
import { ArchiveRestore, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import type { TrashItem } from '../lib/types'
import { useTrash } from '../hooks/useDocumentQueries'
import { useDocumentMutations } from '../hooks/useDocumentMutations'
import { PrivacyStamp } from './PrivacyStamp'
import { FileGlyph } from './FileGlyph'

export function TrashView() {
  const { data, isLoading } = useTrash({ page: 1, limit: 50 })
  const { restoreDocumentMutation, restoreFolderMutation } =
    useDocumentMutations()

  const items = data?.data ?? []

  const restore = (item: TrashItem) => {
    if (item.type === 'folder') {
      restoreFolderMutation.mutate({ id: item.id })
    } else {
      restoreDocumentMutation.mutate(item.id)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-doc-line px-4 py-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-doc-ink">
            Papelera
          </h2>
          <p className="text-[11px] text-doc-muted">
            Los elementos permanecen aquí hasta que los restaures.
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-px p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-16 rounded-md bg-doc-paper-strong"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Empty className="h-full p-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ArchiveRestore className="h-5 w-5" />
              </EmptyMedia>
              <EmptyTitle className="text-lg font-semibold">
                La papelera está vacía
              </EmptyTitle>
              <EmptyDescription className="max-w-sm">
                Cuando elimines una carpeta o un documento, aparecerá aquí para
                que puedas recuperarlo.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="divide-y divide-doc-line">
            {items.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="flex items-center gap-3 px-4 py-3 opacity-90 transition-opacity hover:opacity-100"
              >
                {item.type === 'folder' ? (
                  <span className="flex h-10 w-8 shrink-0 items-center justify-center rounded-[3px] border border-doc-line bg-doc-paper-strong text-doc-muted">
                    <Folder className="h-4 w-4" />
                  </span>
                ) : (
                  <FileGlyph fileName={item.name} />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-doc-ink">
                    {item.name}
                  </p>
                  <p className="truncate text-[10px] text-doc-muted">
                    {item.path} · Eliminado por{' '}
                    {item.deletedBy?.name ?? '—'} ·{' '}
                    {format(new Date(item.deletedAt), 'dd MMM yyyy')}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <PrivacyStamp level={item.privacyLevel} />
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => restore(item)}
                    disabled={
                      restoreDocumentMutation.isPending ||
                      restoreFolderMutation.isPending
                    }
                  >
                    <ArchiveRestore className="mr-1 h-3.5 w-3.5" />
                    Restaurar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
