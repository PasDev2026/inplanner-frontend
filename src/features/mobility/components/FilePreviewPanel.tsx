import { useEffect, useState } from 'react'
import { ExternalLink, Loader2, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getTransferFileUrl } from '../actions/mobility.api'
import { formatBytes, formatDateTime } from '../lib/format'
import type { TransferFile } from '../lib/types'

type FilePreviewPanelProps = {
  requestId: string
  file: TransferFile
  onClose: () => void
}

export default function FilePreviewPanel({
  requestId,
  file,
  onClose,
}: FilePreviewPanelProps) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setUrl(null)

    getTransferFileUrl(requestId, file.id_file, 'preview')
      .then((result) => {
        if (!cancelled) setUrl(result.url)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [requestId, file.id_file])

  const isPdf = file.mime_type === 'application/pdf'
  const openInNewTab = () => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="text-[10px]">
              {file.kind === 'EVIDENCIA'
                ? 'Evidencia del viaje'
                : 'Documento de abono'}
            </Badge>
          </div>
          <CardTitle className="truncate text-sm">{file.file_name}</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {file.uploaded_by.nombre_completo} ·{' '}
            {formatDateTime(file.created_at)} · {formatBytes(file.bytes)}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Cerrar vista previa"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading && (
          <div className="flex min-h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {url && (
          <>
            {isPdf ? (
              <iframe
                src={url}
                title={file.file_name}
                className="h-[60vh] w-full rounded-lg border border-border bg-white"
              />
            ) : (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                title="Abrir en nueva pestaña"
                className="block overflow-hidden rounded-lg border border-border bg-muted/30"
              >
                <img
                  src={url}
                  alt={file.file_name}
                  className="max-h-[60vh] w-full object-contain"
                />
              </a>
            )}

            <Button type="button" variant="outline" onClick={openInNewTab}>
              <ExternalLink className="mr-1.5 h-4 w-4" />
              Abrir en nueva pestaña
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
