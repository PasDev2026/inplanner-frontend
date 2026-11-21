import { useQuery } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getDeleteImpact } from '../actions/documents.api'
import { useDocumentMutations } from '../hooks/useDocumentMutations'
import type { FolderNode } from '../lib/types'

export function DeleteFolderDialog({
  open,
  onOpenChange,
  folder,
  onDeleted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  folder: FolderNode | null
  onDeleted?: () => void
}) {
  const { deleteFolderMutation } = useDocumentMutations()
  const { data: impact, isLoading } = useQuery({
    queryKey: ['documentDeleteImpact', folder?.id],
    queryFn: () => getDeleteImpact(folder!.id),
    enabled: open && Boolean(folder?.id),
  })

  const confirm = async () => {
    if (!folder) return
    await deleteFolderMutation.mutateAsync(folder.id)
    onDeleted?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="doc-portal max-w-md border border-doc-line bg-doc-paper text-doc-ink">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <AlertTriangle className="h-5 w-5 text-doc-danger" />
            Eliminar carpeta
          </DialogTitle>
          <DialogDescription className="text-doc-muted">
            La carpeta y su contenido se moverán a la papelera. Podrás
            restaurarlos durante los próximos 30 días.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-doc-line bg-doc-paper-strong/40 p-4 text-sm">
          <p className="font-semibold text-doc-ink">{folder?.name}</p>
          {isLoading ? (
            <p className="mt-2 text-doc-muted">Calculando contenido…</p>
          ) : (
            <p className="mt-2 text-doc-muted">
              Se eliminarán{' '}
              <strong className="text-doc-ink">{impact?.folders ?? 0}</strong>{' '}
              carpeta(s) y{' '}
              <strong className="text-doc-ink">{impact?.documents ?? 0}</strong>{' '}
              documento(s).
            </p>
          )}
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
            variant="destructive"
            onClick={confirm}
            disabled={deleteFolderMutation.isPending}
          >
            {deleteFolderMutation.isPending ? 'Eliminando…' : 'Mover a papelera'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
