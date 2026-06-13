import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type UserStatusModalProps = {
  show: boolean
  userName: string
  currentStatus: boolean
  onConfirm: () => void
  onClose: () => void
}

export default function UserStatusModal({ show, userName, currentStatus, onConfirm, onClose }: UserStatusModalProps) {
  const actionLabel = currentStatus ? "Desactivar" : "Activar"

  return (
    <Dialog open={show} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{actionLabel} usuario</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de {actionLabel.toLowerCase()} a <strong>{userName}</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant={currentStatus ? "destructive" : "default"}
            onClick={onConfirm}
          >
            {actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
