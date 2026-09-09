import { useEffect, useState } from "react"
import { LayoutTemplate } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTemplateMutations } from "../hooks/useTemplateMutations"
import TemplatePendingOverlay from "./TemplatePendingOverlay"

type SaveAsTemplateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId: number
}

const NAME_MAX_LENGTH = 150

export default function SaveAsTemplateDialog({
  open,
  onOpenChange,
  taskId,
}: SaveAsTemplateDialogProps) {
  const [name, setName] = useState("")
  const { createFromTaskMutation } = useTemplateMutations()

  useEffect(() => {
    if (!open) setName("")
  }, [open])

  const handleSave = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    createFromTaskMutation.mutate(
      { task_id: taskId, template_name: trimmed },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4 text-brand-primary" />
            Guardar como plantilla
          </DialogTitle>
          <DialogDescription>
            Se guardará esta tarea con todas sus subtareas. Podrás aplicarla en
            cualquier proyecto.
          </DialogDescription>
        </DialogHeader>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la plantilla"
          maxLength={NAME_MAX_LENGTH}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) handleSave()
            if (e.key === "Escape") onOpenChange(false)
          }}
          className="w-full text-sm rounded-md border border-border bg-[var(--input-bg)] px-3 py-2 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/40 transition-colors"
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || createFromTaskMutation.isPending}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>

      {createFromTaskMutation.isPending && name.trim() && (
        <TemplatePendingOverlay templateName={name.trim()} action="Guardando" />
      )}
    </Dialog>
  )
}
