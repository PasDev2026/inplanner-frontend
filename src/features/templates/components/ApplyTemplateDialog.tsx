import { useState } from "react"
import { ChevronDown, ChevronRight, LayoutTemplate, Loader2 } from "lucide-react"
import { cn } from "@/features/shared/lib/utils"
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
import type { TemplateItemTree, TemplateSummary } from "../lib/types"
import TemplatePendingOverlay from "./TemplatePendingOverlay"

type ApplyTemplateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: number
  parentTaskId?: number
  templates: TemplateSummary[]
}

function TreePreview({
  items,
  depth = 0,
}: {
  items: TemplateItemTree[]
  depth?: number
}) {
  return (
    <div className={cn(depth > 0 && "ml-5 border-l border-border pl-3")}>
      {items.map((item) => (
        <div key={item.id_item} className="py-0.5">
          <div className="flex items-center gap-1 text-sm text-foreground">
            {item.children.length > 0 ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
            <span className="truncate">{item.item_name}</span>
          </div>
          {item.children.length > 0 && (
            <TreePreview items={item.children} depth={depth + 1} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function ApplyTemplateDialog({
  open,
  onOpenChange,
  projectId,
  parentTaskId,
  templates,
}: ApplyTemplateDialogProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [applyingName, setApplyingName] = useState<string | null>(null)
  const { data: detail, isLoading: isLoadingDetail } = useTemplate(
    open && selectedId !== null ? selectedId : null,
  )
  const { applyMutation } = useTemplateMutations()

  const handleApply = () => {
    if (selectedId === null) return
    const selected = templates.find((t) => t.id_template === selectedId)
    setApplyingName(selected?.template_name ?? null)
    applyMutation.mutate(
      { templateId: selectedId, projectId, parentTaskId },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setSelectedId(null)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4 text-brand-primary" />
            Aplicar plantilla
          </DialogTitle>
          <DialogDescription>
            {parentTaskId
              ? "Se crearán las tareas de la plantilla como subtareas de la tarea seleccionada."
              : "Se crearán las tareas de la plantilla en este proyecto."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {templates.map((template) => (
            <button
              key={template.id_template}
              type="button"
              onClick={() => setSelectedId(template.id_template)}
              className={cn(
                "w-full flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
                selectedId === template.id_template
                  ? "border-brand-primary bg-brand-primary/10"
                  : "border-border hover:bg-muted",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
                  selectedId === template.id_template
                    ? "bg-brand-primary text-white"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <LayoutTemplate className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {template.template_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {template.items_count}{" "}
                  {template.items_count === 1 ? "tarea" : "tareas"}
                </p>
              </div>
            </button>
          ))}
        </div>

        {selectedId !== null && (
          <div className="rounded-lg border border-border bg-muted/40 p-3 max-h-56 overflow-y-auto">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Tareas que se crearán
            </p>
            {isLoadingDetail ? (
              <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">Cargando vista previa...</span>
              </div>
            ) : detail ? (
              <TreePreview items={detail.items} />
            ) : null}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleApply}
            disabled={selectedId === null || applyMutation.isPending}
          >
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>

      {applyMutation.isPending && applyingName && (
        <TemplatePendingOverlay templateName={applyingName} action="Aplicando" />
      )}
    </Dialog>
  )
}
