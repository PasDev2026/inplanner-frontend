import { Download, Loader2 } from "lucide-react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useExportProjectTasks } from "../hooks/useExportProjectTasks"

type ExportProjectTasksMenuItemProps = {
  projectId: number
  projectName?: string
}

export default function ExportProjectTasksMenuItem({
  projectId,
  projectName,
}: ExportProjectTasksMenuItemProps) {
  const exportMutation = useExportProjectTasks()

  return (
    <DropdownMenuItem
      onClick={() => exportMutation.mutate({ projectId, projectName })}
      disabled={exportMutation.isPending}
    >
      {exportMutation.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      Exportar tareas (Excel)
    </DropdownMenuItem>
  )
}
