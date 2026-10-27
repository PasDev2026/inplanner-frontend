import {
  CalendarClock,
  Database,
  Maximize2,
  Minimize2,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/features/shared/lib/utils"
import {
  formatDateTimeEs,
  formatNumber,
} from "@/features/ml-dashboard/lib/risk"
import type { ModelInfo } from "@/features/ml-dashboard/types"

type PredictiveRiskHeaderProps = {
  model: ModelInfo
  isRefreshing: boolean
  isFullscreen: boolean
  onRefresh: () => void
  onToggleFullscreen: () => void
}

export default function PredictiveRiskHeader({
  model,
  isRefreshing,
  isFullscreen,
  onRefresh,
  onToggleFullscreen,
}: PredictiveRiskHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
            Analítica · InPlanner
          </div>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-[2.1rem]">
            Riesgo predictivo de tareas
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Prioriza la intervención donde el retraso es más probable y entiende qué señales
            sostienen cada estimación.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-2.5 py-1 text-muted-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
              <span className="font-medium text-foreground">{model.name}</span>
              <span className="text-border">·</span>
              <span className="font-mono text-[11px]">{model.version}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-2.5 py-1 text-muted-foreground shadow-sm">
              <CalendarClock className="h-3.5 w-3.5" />
              Corte {formatDateTimeEs(model.generatedAt)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-2.5 py-1 text-muted-foreground shadow-sm">
              <Database className="h-3.5 w-3.5" />
              {formatNumber(model.datasetSize)} tareas analizadas
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-9 gap-2 bg-card px-3"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            <span className="hidden sm:inline">{isRefreshing ? "Actualizando…" : "Actualizar"}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleFullscreen}
            className="h-9 gap-2 bg-card px-3"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            <span className="hidden sm:inline">
              {isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
