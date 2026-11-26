import { useQuery } from '@tanstack/react-query'
import { Eye, FileText, ImageIcon, Loader2 } from 'lucide-react'
import { getTransferFileUrl } from '../actions/mobility.api'
import { MOBILITY_FILE_URL_KEY } from '../lib/mobility-keys'
import { formatBytes } from '../lib/format'
import type { TransferFile } from '../lib/types'

type FileThumbnailProps = {
  requestId: string
  file: TransferFile
  onPreview: (file: TransferFile) => void
}

export default function FileThumbnail({
  requestId,
  file,
  onPreview,
}: FileThumbnailProps) {
  const isImage = file.mime_type.startsWith('image/')
  const isPdf = file.mime_type === 'application/pdf'

  const { data, isLoading, isError } = useQuery({
    queryKey: MOBILITY_FILE_URL_KEY(requestId, file.id_file),
    queryFn: () => getTransferFileUrl(requestId, file.id_file, 'preview'),
    enabled: isImage,
    staleTime: 10 * 60_000,
  })

  return (
    <button
      type="button"
      onClick={() => onPreview(file)}
      className="group overflow-hidden rounded-xl border border-border bg-muted/30 text-left transition-colors hover:border-brand-primary/40"
    >
      <div className="relative flex h-32 items-center justify-center overflow-hidden">
        {isImage ? (
          isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : data?.url && !isError ? (
            <img
              src={data.url}
              alt={file.file_name}
              className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <ImageIcon className="h-7 w-7 text-muted-foreground" />
          )
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <FileText className="h-7 w-7" />
            <span className="text-[10px] font-semibold uppercase">
              {isPdf ? 'PDF' : 'Archivo'}
            </span>
          </div>
        )}

        <span className="absolute top-2 right-2 rounded-md bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100">
          <Eye className="h-3.5 w-3.5" />
        </span>
      </div>

      <div className="space-y-0.5 border-t border-border px-2 py-1.5">
        <p className="truncate text-xs font-medium">{file.file_name}</p>
        <p className="text-[10px] text-muted-foreground">
          {formatBytes(file.bytes)}
        </p>
      </div>
    </button>
  )
}
