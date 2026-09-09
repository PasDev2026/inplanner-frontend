import { useEffect, useState } from "react"
import { Loader2, LayoutTemplate } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTemplate } from "../hooks/useTemplateQueries"
import { useTemplateMutations } from "../hooks/useTemplateMutations"
import type { BuilderItem } from "../lib/template-tree"
import {
  findFirstEmptyName,
  newBuilderItem,
  treeFromDetail,
  treeToPayload,
} from "../lib/template-tree"
import TemplateTreeEditor from "./TemplateTreeEditor"

type TemplateBuilderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Plantilla a editar; undefined = crear nueva */
  templateId?: number
}

const NAME_MAX_LENGTH = 150

export default function TemplateBuilderDialog({
  open,
  onOpenChange,
  templateId,
}: TemplateBuilderDialogProps) {
  const isEdit = templateId !== undefined
  const [name, setName] = useState("")
  const [items, setItems] = useState<BuilderItem[]>([newBuilderItem()])
  const { data: detail, isLoading: isLoadingDetail } = useTemplate(
    isEdit && open ? templateId : null,
  )
  const { createMutation, updateMutation } = useTemplateMutations()
  const isPending = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (!open) return
    if (isEdit) {
      if (detail) {
        setName(detail.template_name)
        setItems(treeFromDetail(detail.items))
      }
      return
    }
    setName("")
    setItems([newBuilderItem()])
  }, [open, isEdit, detail])

  const handleSave = () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error("Ponle un nombre a la plantilla")
      return
    }
    if (trimmedName.length > NAME_MAX_LENGTH) {
      toast.error(`El nombre no puede superar ${NAME_MAX_LENGTH} caracteres`)
      return
    }
    if (findFirstEmptyName(items)) {
      toast.error("Hay tareas o subtareas sin nombre")
      return
    }

    const payload = treeToPayload(items)
    if (isEdit) {
      updateMutation.mutate(
        { id: templateId, template_name: trimmedName, items: payload },
        { onSuccess: () => onOpenChange(false) },
      )
    } else {
      createMutation.mutate(
        { template_name: trimmedName, items: payload },
        { onSuccess: () => onOpenChange(false) },
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4 text-brand-primary" />
            {isEdit ? "Editar plantilla" : "Nueva plantilla"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica el nombre o la estructura de tareas. Al guardar se reemplaza el árbol completo."
              : "Define las tareas y subtareas que se crearán cada vez que apliques esta plantilla."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {isEdit && isLoadingDetail ? (
            <div className="py-8 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs">Cargando plantilla...</span>
            </div>
          ) : (
            <>
              <div>
                <label
                  htmlFor="template-name"
                  className="text-xs font-medium text-muted-foreground mb-1 block"
                >
                  Nombre de la plantilla
                </label>
                <input
                  id="template-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Creación de un nuevo canal"
                  maxLength={NAME_MAX_LENGTH}
                  className="w-full text-sm rounded-md border border-border bg-[var(--input-bg)] px-3 py-2 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/40 transition-colors"
                />
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">
                  Estructura de tareas
                </p>
                <div
                  className="max-h-96 overflow-y-auto pr-1"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  <TemplateTreeEditor items={items} onChange={setItems} />
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending || (isEdit && isLoadingDetail)}
          >
            {isEdit ? "Guardar cambios" : "Crear plantilla"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
