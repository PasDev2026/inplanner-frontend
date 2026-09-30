import { GitBranch, Maximize2, Move, RotateCcw, ZoomIn, ZoomOut } from "lucide-react"
import { useReactFlow } from "@xyflow/react"
import { cn } from "@/features/shared/lib/utils"
import type { DiagramViewMode } from "../lib/diagram-storage"

const buttonClass =
  "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"

type DiagramToolbarProps = {
  mode: DiagramViewMode
  onModeChange: (mode: DiagramViewMode) => void
  onResetLayout: () => void
}

export default function DiagramToolbar({
  mode,
  onModeChange,
  onResetLayout,
}: DiagramToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  return (
    <div className="absolute right-3 top-3 z-10 flex items-center gap-0.5 rounded-lg border border-border bg-card/90 p-1 shadow-sm backdrop-blur">
      <button type="button" title="Acercar" className={buttonClass} onClick={() => zoomIn()}>
        <ZoomIn className="h-4 w-4" />
      </button>
      <button type="button" title="Alejar" className={buttonClass} onClick={() => zoomOut()}>
        <ZoomOut className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Ajustar a pantalla"
        className={buttonClass}
        onClick={() => fitView({ padding: 0.2, duration: 300 })}
      >
        <Maximize2 className="h-4 w-4" />
      </button>

      <span className="mx-0.5 h-5 w-px bg-border" />

      <button
        type="button"
        title="Modo estructura (reordenar)"
        onClick={() => onModeChange("structure")}
        className={cn(
          buttonClass,
          mode === "structure" && "bg-brand-primary/10 text-brand-primary",
        )}
      >
        <GitBranch className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Modo organizar (mover libre)"
        onClick={() => onModeChange("organize")}
        className={cn(
          buttonClass,
          mode === "organize" && "bg-brand-primary/10 text-brand-primary",
        )}
      >
        <Move className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Reordenar (aplicar layout)"
        className={buttonClass}
        onClick={onResetLayout}
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  )
}
