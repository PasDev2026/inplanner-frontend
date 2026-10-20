import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/features/shared/lib/utils"
import { useExportProjectTasks } from "../hooks/useExportProjectTasks"

type ExportProjectTasksButtonProps = {
  projectId: number
  projectName?: string
  appearance?: "button" | "link"
  className?: string
}

export default function ExportProjectTasksButton({
  projectId,
  projectName,
  appearance = "button",
  className,
}: ExportProjectTasksButtonProps) {
  const exportMutation = useExportProjectTasks()
  const isPending = exportMutation.isPending

  const handleExport = () => {
    exportMutation.mutate({ projectId, projectName })
  }

  if (appearance === "link") {
    return (
      <button
        type="button"
        onClick={handleExport}
        disabled={isPending}
        className={
          className ??
          "flex items-center gap-1 text-xs text-brand-primary transition-colors hover:text-brand-dark disabled:opacity-60"
        }
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )}
        Exportar
      </button>
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleExport}
      disabled={isPending}
      className={cn("gap-2", className)}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {isPending ? "Exportando..." : "Exportar Excel"}
    </Button>
  )
}
