import { useState } from "react"
import { LayoutTemplate } from "lucide-react"
import { toast } from "sonner"
import { useTemplates } from "../hooks/useTemplateQueries"
import { useTemplateMutations } from "../hooks/useTemplateMutations"
import ApplyTemplateDialog from "./ApplyTemplateDialog"
import TemplatePendingOverlay from "./TemplatePendingOverlay"

type AddTemplateButtonProps = {
  projectId: number
  /** Si se indica, las tareas se crean como subtareas de esta tarea */
  parentTaskId?: number
  className?: string
}

export default function AddTemplateButton({
  projectId,
  parentTaskId,
  className,
}: AddTemplateButtonProps) {
  const { data: templates = [] } = useTemplates()
  const { applyMutation } = useTemplateMutations()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [applyingName, setApplyingName] = useState<string | null>(null)

  const apply = (templateId: number, templateName: string, taskCount: number) => {
    toast(`¿Aplicar "${templateName}"?`, {
      description: `Se crearán ${taskCount} ${taskCount === 1 ? "tarea" : "tareas"}`,
      action: {
        label: "Aplicar",
        onClick: () => {
          setApplyingName(templateName)
          applyMutation.mutate({ templateId, projectId, parentTaskId })
        },
      },
    })
  }

  const handleClick = () => {
    if (templates.length === 0) {
      toast.info("Aún no tienes plantillas", {
        description: "Créalas en la sección Plantillas del menú lateral",
      })
      return
    }
    if (templates.length === 1) {
      apply(templates[0].id_template, templates[0].template_name, templates[0].items_count)
      return
    }
    setDialogOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={
          className ??
          "flex items-center gap-1 text-xs text-brand-primary hover:text-brand-dark transition-colors"
        }
      >
        <LayoutTemplate className="h-3.5 w-3.5" />
        Añadir plantilla
      </button>

      {templates.length > 1 && (
        <ApplyTemplateDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          projectId={projectId}
          parentTaskId={parentTaskId}
          templates={templates}
        />
      )}

      {applyMutation.isPending && applyingName && (
        <TemplatePendingOverlay templateName={applyingName} action="Aplicando" />
      )}
    </>
  )
}
