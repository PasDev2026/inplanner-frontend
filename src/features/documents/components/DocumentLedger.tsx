import { format } from 'date-fns'
import { Download, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/features/shared/lib/utils'
import type { DocumentItem } from '../lib/types'
import { FileGlyph } from './FileGlyph'
import { PrivacyStamp } from './PrivacyStamp'

export function DocumentLedger({
  documents,
  selectedId,
  onSelect,
  onDownload,
  onEdit,
  onDelete,
  canEdit,
  isLoading,
}: {
  documents: DocumentItem[]
  selectedId: string | null
  onSelect: (document: DocumentItem) => void
  onDownload: (document: DocumentItem) => void
  onEdit: (document: DocumentItem) => void
  onDelete: (document: DocumentItem) => void
  canEdit: boolean
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <div className="space-y-px">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex h-[58px] items-center gap-3 border-b border-doc-line/70 px-3"
          >
            <Skeleton className="h-10 w-8 shrink-0 rounded-[3px] bg-doc-paper-strong" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-2/5 bg-doc-paper-strong" />
              <Skeleton className="h-2 w-1/4 bg-doc-paper-strong" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Table aria-label="Documentos" className="table-fixed">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="h-9 px-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-doc-muted">
            Documento
          </TableHead>
          <TableHead className="hidden h-9 w-[120px] px-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-doc-muted md:table-cell">
            Privacidad
          </TableHead>
          <TableHead className="hidden h-9 w-[140px] px-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-doc-muted md:table-cell">
            Subido por
          </TableHead>
          <TableHead className="hidden h-9 w-[110px] px-3 text-right text-[9px] font-semibold uppercase tracking-[0.14em] text-doc-muted md:table-cell">
            Fecha
          </TableHead>
          <TableHead className="h-9 w-[104px] px-3 text-right text-[9px] font-semibold uppercase tracking-[0.14em] text-doc-muted">
            Acciones
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((document) => {
          const selected = document.id === selectedId
          return (
            <TableRow
              key={document.id}
              tabIndex={0}
              data-selected={selected}
              aria-selected={selected}
              onClick={() => onSelect(document)}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelect(document)
                }
              }}
              className={cn(
                'doc-ledger-row group cursor-pointer border-doc-line/70 transition-colors hover:bg-doc-paper-strong/60',
                selected && 'bg-doc-accent-soft/40 hover:bg-doc-accent-soft/40',
              )}
            >
              <TableCell className="min-w-0 px-3 py-2">
                <div className="flex min-w-0 items-center gap-3">
                  <FileGlyph
                    fileName={document.fileName}
                    extension={document.extension}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-doc-ink">
                      {document.fileName}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-doc-muted">
                      {document.folderPath}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell className="hidden px-3 py-2 md:table-cell">
                <PrivacyStamp level={document.folderPrivacyLevel} />
              </TableCell>

              <TableCell className="hidden truncate px-3 py-2 text-[12px] text-doc-muted md:table-cell">
                {document.uploadedBy?.name ?? '—'}
              </TableCell>

              <TableCell className="hidden px-3 py-2 text-right text-[11px] tabular-nums text-doc-muted md:table-cell">
                {format(new Date(document.createdAt), 'dd MMM yyyy')}
              </TableCell>

              <TableCell className="px-3 py-2">
                <div className="flex items-center justify-end gap-0.5">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Descargar ${document.fileName}`}
                        />
                      }
                      onClick={(event) => {
                        event.stopPropagation()
                        onDownload(document)
                      }}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </TooltipTrigger>
                    <TooltipContent>Descargar</TooltipContent>
                  </Tooltip>

                  {canEdit && (
                    <>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Editar ${document.fileName}`}
                            />
                          }
                          onClick={(event) => {
                            event.stopPropagation()
                            onEdit(document)
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </TooltipTrigger>
                        <TooltipContent>Renombrar o mover</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="text-doc-danger hover:text-doc-danger"
                              aria-label={`Eliminar ${document.fileName}`}
                            />
                          }
                          onClick={(event) => {
                            event.stopPropagation()
                            onDelete(document)
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </TooltipTrigger>
                        <TooltipContent>Eliminar</TooltipContent>
                      </Tooltip>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
