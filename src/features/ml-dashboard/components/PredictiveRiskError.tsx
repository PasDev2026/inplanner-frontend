import { RefreshCw, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SURFACE_SHADOW } from "@/features/ml-dashboard/lib/risk"
import { cn } from "@/features/shared/lib/utils"

type PredictiveRiskErrorProps = {
  onRetry: () => void
  isRetrying?: boolean
}

export default function PredictiveRiskError({
  onRetry,
  isRetrying = false,
}: PredictiveRiskErrorProps) {
  return (
    <div className="flex min-h-[62vh] items-center justify-center py-8">
      <Card
        role="alert"
        className={cn("w-full max-w-lg border-border/70", SURFACE_SHADOW)}
      >
        <CardContent className="flex flex-col items-center px-8 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <TriangleAlert className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold tracking-tight">
            No pudimos cargar el análisis
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Ocurrió un problema al generar los datos mock. La demo no consulta el backend de
            ML, así que puedes reintentar sin afectar otros módulos.
          </p>
          <Button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="mt-5 gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isRetrying && "animate-spin")} />
            {isRetrying ? "Reintentando…" : "Reintentar"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
