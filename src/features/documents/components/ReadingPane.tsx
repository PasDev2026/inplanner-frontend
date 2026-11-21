import { format } from 'date-fns'
import { Download, ExternalLink, Pencil, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/features/shared/lib/utils'
import type { DocumentItem } from '../lib/types'
import { formatBytes, isPreviewable } from '../lib/file-type'
import { FileGlyph } from './FileGlyph'
import { PrivacyStamp } from './PrivacyStamp'

export function ReadingPane({
  document,
  url,
  isLoading,
  onClose,
  onDownload,
  onEdit,
  onDelete,
  canEdit,
}: {
  document: DocumentItem | null
  url?: string
  isLoading?: boolean
  onClose: () => void
  onDownload: (document: DocumentItem) => void
  onEdit: (document: DocumentItem) => void
  onDelete: (document: DocumentItem) => void
  canEdit: boolean
}) {
  if (!document) {
    return (
      <aside className="hidden w-[340px] shrink-0 border-l border-doc-line bg-doc-paper/60 xl:flex xl:flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <FileGlyph fileName="documento.pdf" className="h-14 w-11" />
          <p className="text-lg font-semibold text-doc-ink">Lectura</p>
          <p className="text-xs leading-relaxed text-doc-muted">
            Selecciona un documento para verlo aquí sin perder el hilo del
            archivo.
          </p>
        </div>
      </aside>
    )
  }

  const previewable = isPreviewable(document.mimeType)

  return (
    <aside
      className={cn(
        'fixed inset-0 z-40 flex flex-col border-doc-line bg-doc-paper xl:static xl:z-auto xl:w-[400px] xl:shrink-0 xl:border-l',
      )}
      aria-label="Vista de lectura"
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-doc-line px-4">
        <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-doc-muted">
          Lectura
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Cerrar vista de lectura"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="doc-paper-sheet doc-dot-grid flex min-h-[260px] items-center justify-center rounded-sm border border-doc-line bg-background p-2 dark:bg-doc-paper-strong">
          {isLoading ? (
            <div className="h-[240px] w-full animate-pulse rounded bg-doc-paper-strong" />
          ) : previewable && url ? (
            document.mimeType === 'application/pdf' ? (
              <iframe
                src={url}
                title={document.fileName}
                className="h-[420px] w-full rounded-sm border-0 bg-white"
                loading="lazy"
              />
            ) : (
              <img
                src={url}
                alt={document.fileName}
                className="max-h-[420px] w-full rounded-sm object-contain"
                loading="lazy"
              />
            )
          ) : (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <FileGlyph
                fileName={document.fileName}
                extension={document.extension}
                className="h-14 w-11"
              />
              <p className="text-xs text-doc-muted">
                Vista previa no disponible para este formato.
              </p>
              <Button
                type="button"
                size="sm"
                onClick={() => onDownload(document)}
                className="bg-doc-accent text-white hover:bg-doc-accent/90"
              >
                <Download className="h-3.5 w-3.5" />
                Descargar
              </Button>
            </div>
          )}
        </div>

        <div className="mt-5">
          <div className="flex items-start gap-2">
            <FileGlyph
              fileName={document.fileName}
              extension={document.extension}
              className="mt-0.5"
            />
            <div className="min-w-0">
              <h2 className="text-xl font-semibold leading-tight text-doc-ink">
                {document.fileName}
              </h2>
              <div className="mt-2">
                <PrivacyStamp level={document.folderPrivacyLevel} />
              </div>
            </div>
          </div>

          <dl className="mt-5 divide-y divide-doc-line border-y border-doc-line text-[12px]">
            <div className="flex items-center justify-between gap-4 py-2">
              <dt className="text-[9px] font-semibold uppercase tracking-[0.14em] text-doc-muted">
                Subido por
              </dt>
              <dd className="truncate text-doc-ink">
                {document.uploadedBy?.name ?? '—'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2">
              <dt className="text-[9px] font-semibold uppercase tracking-[0.14em] text-doc-muted">
                Fecha
              </dt>
              <dd className="text-doc-ink">
                {format(new Date(document.createdAt), 'dd MMM yyyy')}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2">
              <dt className="text-[9px] font-semibold uppercase tracking-[0.14em] text-doc-muted">
                Tamaño
              </dt>
              <dd className="tabular-nums text-doc-ink">
                {formatBytes(document.bytes)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2">
              <dt className="text-[9px] font-semibold uppercase tracking-[0.14em] text-doc-muted">
                Carpeta
              </dt>
              <dd className="truncate text-right text-doc-ink">
                {document.folderPath}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap gap-2">
            {url && (
              <Button
                type="button"
                size="sm"
                onClick={() => window.open(url, '_blank', 'noopener')}
                className="bg-doc-accent text-white hover:bg-doc-accent/90"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Abrir
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onDownload(document)}
            >
              <Download className="h-3.5 w-3.5" />
              Descargar
            </Button>
            {canEdit && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(document)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-doc-danger hover:bg-doc-danger/10 hover:text-doc-danger"
                  onClick={() => onDelete(document)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
