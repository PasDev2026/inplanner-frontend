import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useMobilityMutations } from '../hooks/useMobilityMutations'

export default function ApprovalDialog({
  open,
  onOpenChange,
  requestId,
  action,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: string
  action: 'APROBAR' | 'RECHAZAR'
}) {
  const [comment, setComment] = useState('')
  const { approveMutation } = useMobilityMutations()

  useEffect(() => {
    if (open) setComment('')
  }, [open])

  const submit = async () => {
    if (action === 'RECHAZAR' && !comment.trim()) {
      toast.error('El rechazo requiere un comentario')
      return
    }

    try {
      await approveMutation.mutateAsync({
        id: requestId,
        action,
        comment: comment.trim() || undefined,
      })
      onOpenChange(false)
    } catch {
      // El hook ya muestra el error.
    }
  }

  const isReject = action === 'RECHAZAR'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isReject ? 'Rechazar solicitud' : 'Aprobar solicitud'}
          </DialogTitle>
          <DialogDescription>
            {isReject
              ? 'Indica el motivo del rechazo. La solicitud se cerrará y no podrá editarse.'
              : 'La solicitud pasará al siguiente paso del flujo de aprobación.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="approval-comment" className="text-xs font-medium">
            Comentario {isReject ? '(obligatorio)' : '(opcional)'}
          </Label>
          <Textarea
            id="approval-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder={
              isReject
                ? 'Motivo del rechazo'
                : 'Observaciones para el siguiente aprobador'
            }
            maxLength={1000}
            rows={4}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={approveMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant={isReject ? 'destructive' : 'default'}
            onClick={submit}
            disabled={approveMutation.isPending}
          >
            {approveMutation.isPending
              ? 'Guardando...'
              : isReject
                ? 'Rechazar'
                : 'Aprobar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
