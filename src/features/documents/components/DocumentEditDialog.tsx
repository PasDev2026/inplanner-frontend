import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import type { DocumentItem, FolderNode } from '../lib/types'
import { useDocumentMutations } from '../hooks/useDocumentMutations'

function flattenFolders(nodes: FolderNode[]): FolderNode[] {
  const result: FolderNode[] = []
  const visit = (items: FolderNode[]) => {
    for (const item of items) {
      result.push(item)
      if (item.children) visit(item.children)
    }
  }
  visit(nodes)
  return result
}

export function DocumentEditDialog({
  open,
  onOpenChange,
  document,
  roots,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: DocumentItem | null
  roots: FolderNode[]
}) {
  const { updateDocumentMutation } = useDocumentMutations()
  const [fileName, setFileName] = useState('')
  const [folderId, setFolderId] = useState('')

  const folders = useMemo(() => flattenFolders(roots), [roots])

  useEffect(() => {
    if (!open || !document) return
    setFileName(document.fileName)
    setFolderId(document.folderId)
  }, [open, document])

  const save = async () => {
    if (!document || !fileName.trim()) return
    await updateDocumentMutation.mutateAsync({
      id: document.id,
      payload: {
        fileName: fileName.trim(),
        folderId: folderId || undefined,
      },
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="doc-portal max-w-lg border border-doc-line bg-doc-paper text-doc-ink">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Editar documento
          </DialogTitle>
          <DialogDescription className="text-doc-muted">
            Cambia el nombre visible o mueve el documento a otra carpeta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="document-name" className="text-doc-ink">
              Nombre visible
            </Label>
            <Input
              id="document-name"
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
              maxLength={255}
              autoFocus
            />
            <p className="text-[11px] text-doc-muted">
              La extensión original se conserva automáticamente.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="document-folder" className="text-doc-ink">
              Carpeta
            </Label>
            <Select
              value={folderId}
              onValueChange={(value) => setFolderId(value ?? '')}
            >
              <Select.Trigger
                id="document-folder"
                className="h-9 border-doc-line bg-background text-doc-ink"
              >
                <Select.Value placeholder="Selecciona una carpeta">
                  {folders.find((folder) => folder.id === folderId)?.name}
                </Select.Value>
              </Select.Trigger>
              <Select.Popup>
                <Select.List>
                  {folders.map((folder) => (
                    <Select.Item key={folder.id} value={folder.id}>
                      {folder.name}
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Popup>
            </Select>
          </div>
        </div>

        <DialogFooter className="border-doc-line bg-doc-paper-strong/50">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={save}
            disabled={!fileName.trim() || updateDocumentMutation.isPending}
            className="bg-doc-accent text-white hover:bg-doc-accent/90"
          >
            {updateDocumentMutation.isPending ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
