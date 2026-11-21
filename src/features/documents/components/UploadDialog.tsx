import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, Check, FileUp, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { cn } from '@/features/shared/lib/utils'
import type { FolderNode } from '../lib/types'
import {
  MAX_DOCUMENT_SIZE,
  MAX_DOCUMENT_SIZE_MB,
  formatBytes,
  isAllowedExtension,
} from '../lib/file-type'
import { useDocumentMutations } from '../hooks/useDocumentMutations'

type UploadFile = {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
}

export function UploadDialog({
  open,
  onOpenChange,
  folders,
  defaultFolderId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  folders: FolderNode[]
  defaultFolderId: string | null
}) {
  const { uploadMutation } = useDocumentMutations()
  const inputRef = useRef<HTMLInputElement>(null)
  const [folderId, setFolderId] = useState(defaultFolderId ?? '')
  const [files, setFiles] = useState<UploadFile[]>([])
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!open) return
    setFolderId(defaultFolderId ?? '')
    setFiles([])
  }, [open, defaultFolderId])

  const flatFolders = useMemo(() => {
    const result: FolderNode[] = []
    const visit = (nodes: FolderNode[]) => {
      for (const node of nodes) {
        result.push(node)
        if (node.children) visit(node.children)
      }
    }
    visit(folders)
    return result
  }, [folders])

  const selectedFolder = flatFolders.find((folder) => folder.id === folderId)
  const hasUploadableFiles = files.some(
    (item) => !item.error && item.status !== 'done',
  )
  const canUpload =
    Boolean(folderId) && hasUploadableFiles && !uploading

  const addFiles = (incoming: FileList | File[]) => {
    const next = Array.from(incoming).map((file) => ({
      file,
      progress: 0,
      status: 'pending' as const,
      error: !isAllowedExtension(file.name)
        ? 'Formato no permitido'
        : file.size > MAX_DOCUMENT_SIZE
          ? `Supera ${MAX_DOCUMENT_SIZE_MB} MB`
          : undefined,
    }))
    setFiles((current) => [...current, ...next])
  }

  const startUpload = async () => {
    if (!folderId) return
    setUploading(true)

    for (let index = 0; index < files.length; index += 1) {
      const item = files[index]
      if (item.status === 'done' || item.error) continue

      setFiles((current) =>
        current.map((file, fileIndex) =>
          fileIndex === index
            ? { ...file, status: 'uploading', progress: 0 }
            : file,
        ),
      )

      try {
        await uploadMutation.mutateAsync({
          file: item.file,
          folderId,
          onProgress: (progress) =>
            setFiles((current) =>
              current.map((file, fileIndex) =>
                fileIndex === index ? { ...file, progress } : file,
              ),
            ),
        })
        setFiles((current) =>
          current.map((file, fileIndex) =>
            fileIndex === index
              ? { ...file, status: 'done', progress: 100 }
              : file,
          ),
        )
      } catch (error) {
        setFiles((current) =>
          current.map((file, fileIndex) =>
            fileIndex === index
              ? {
                  ...file,
                  status: 'error',
                  error:
                    error instanceof Error ? error.message : 'Error al subir',
                }
              : file,
          ),
        )
      }
    }

    setUploading(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="doc-portal max-w-2xl border border-doc-line bg-doc-paper text-doc-ink">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Subir documentos
          </DialogTitle>
          <DialogDescription className="text-doc-muted">
            Los archivos conservan su nombre original. Máximo{' '}
            {MAX_DOCUMENT_SIZE_MB} MB por archivo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="upload-folder" className="text-doc-ink">
              Carpeta destino
            </Label>
            {defaultFolderId ? (
              <p className="rounded-md border border-doc-line bg-doc-paper-strong/60 px-3 py-2 text-sm text-doc-ink">
                {selectedFolder?.name ?? 'Carpeta seleccionada'}
              </p>
            ) : (
              <Select
                value={folderId}
                onValueChange={(value) => setFolderId(value ?? '')}
              >
                <Select.Trigger
                  id="upload-folder"
                  className="h-9 border-doc-line bg-background text-doc-ink"
                >
                  <Select.Value placeholder="Selecciona una carpeta">
                    {selectedFolder?.name}
                  </Select.Value>
                </Select.Trigger>
                <Select.Popup>
                  <Select.List>
                    {flatFolders.map((folder) => (
                      <Select.Item key={folder.id} value={folder.id}>
                        {folder.name}
                      </Select.Item>
                    ))}
                  </Select.List>
                </Select.Popup>
              </Select>
            )}
          </div>

          <div
            onDragOver={(event) => {
              event.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault()
              setDragging(false)
              addFiles(event.dataTransfer.files)
            }}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center transition-colors',
              dragging
                ? 'border-doc-accent bg-doc-accent-soft/60'
                : 'border-doc-line bg-doc-paper-strong/40 hover:bg-doc-paper-strong/70',
            )}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                inputRef.current?.click()
              }
            }}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-doc-accent-soft text-doc-accent">
              <FileUp className="h-5 w-5" />
            </span>
            <p className="text-sm font-semibold text-doc-ink">
              Arrastra tus archivos aquí
            </p>
            <p className="text-xs text-doc-muted">
              o haz clic para seleccionarlos
            </p>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg,.webp"
              onChange={(event) => {
                if (event.target.files) addFiles(event.target.files)
                event.target.value = ''
              }}
            />
          </div>

          {files.length > 0 && (
            <div className="max-h-52 divide-y divide-doc-line overflow-y-auto rounded-md border border-doc-line bg-doc-paper-strong/40">
              {files.map((item, index) => (
                <div
                  key={`${item.file.name}-${index}`}
                  className="flex items-center gap-3 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-doc-ink">
                      {item.file.name}
                    </p>
                    <p className="text-[10px] text-doc-muted">
                      {formatBytes(item.file.size)}
                      {item.error ? ` · ${item.error}` : ''}
                    </p>
                    {item.status === 'uploading' && (
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-doc-paper-strong">
                        <div
                          className="h-full bg-doc-accent transition-all"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <span className="shrink-0">
                    {item.status === 'done' ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : item.error ? (
                      <AlertCircle className="h-4 w-4 text-doc-danger" />
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setFiles((current) =>
                            current.filter((_, fileIndex) => fileIndex !== index),
                          )
                        }
                        className="text-doc-muted hover:text-doc-danger"
                        aria-label={`Quitar ${item.file.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="border-doc-line bg-doc-paper-strong/50">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={startUpload}
            disabled={!canUpload}
            className="bg-doc-accent text-white hover:bg-doc-accent/90"
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            {uploading ? 'Subiendo…' : 'Subir documentos'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
