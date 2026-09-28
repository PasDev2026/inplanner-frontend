import { useState } from "react"
import { FileSpreadsheet } from "lucide-react"
import ImportActivitiesDialog from "./ImportActivitiesDialog"

type ImportActivitiesButtonProps = {
  projectId: number
  /** Si se indica, las actividades se crean como subtareas de esta tarea */
  parentTaskId?: number
  className?: string
}

export default function ImportActivitiesButton({
  projectId,
  parentTaskId,
  className,
}: ImportActivitiesButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "flex items-center gap-1 text-xs text-brand-primary hover:text-brand-dark transition-colors"
        }
      >
        <FileSpreadsheet className="h-3.5 w-3.5" />
        Importar
      </button>

      <ImportActivitiesDialog
        open={open}
        onOpenChange={setOpen}
        projectId={projectId}
        parentTaskId={parentTaskId}
      />
    </>
  )
}
