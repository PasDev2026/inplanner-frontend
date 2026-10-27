import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  Database,
  Folder,
  MapPin,
  Sparkles,
  TriangleAlert,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/features/shared/lib/utils"
import RiskBadge from "@/features/ml-dashboard/components/RiskBadge"
import {
  formatDateShortEs,
  formatDateTimeEs,
  formatProbability,
  RISK_META,
} from "@/features/ml-dashboard/lib/risk"
import type { ModelInfo, PredictiveTask } from "@/features/ml-dashboard/types"

type TaskRiskDrawerProps = {
  task: PredictiveTask | null
  open: boolean
  model: ModelInfo
  onOpenChange: (open: boolean) => void
  onOpenModel: () => void
}

export default function TaskRiskDrawer({
  task,
  open,
  model,
  onOpenChange,
  onOpenModel,
}: TaskRiskDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-xl">
        {task && (
          <>
            <SheetHeader className="border-b border-border/60 px-6 pb-5 pt-6 pr-14">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-muted-foreground">{task.code}</span>
                <RiskBadge level={task.risk} />
              </div>
              <SheetTitle className="mt-3 text-xl leading-snug tracking-tight">
                {task.title}
              </SheetTitle>
              <SheetDescription className="sr-only">
                Detalle de la estimación de riesgo para la tarea {task.code}.
              </SheetDescription>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Folder className="h-3.5 w-3.5" />
                  {task.project}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {task.sede}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {task.owner}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {formatDateShortEs(task.dueDate)}
                </span>
              </div>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <section
                className={cn(
                  "rounded-xl border border-border/60 p-5",
                  RISK_META[task.risk].softClass,
                )}
              >
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Probabilidad de retraso
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {RISK_META[task.risk].description}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-4xl font-semibold leading-none tracking-tight tabular-nums",
                      RISK_META[task.risk].textClass,
                    )}
                  >
                    {formatProbability(task.probability)}
                  </span>
                </div>

                <div className="relative mt-5 h-2 rounded-full bg-background/80 ring-1 ring-border/50">
                  <div
                    className={cn("h-full rounded-full", RISK_META[task.risk].barClass)}
                    style={{ width: `${Math.round(task.probability * 100)}%` }}
                  />
                  <span
                    className="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded-full bg-foreground/50"
                    style={{ left: `${model.decisionThreshold * 100}%` }}
                    title={`Umbral ${model.decisionThreshold.toFixed(2)}`}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>
                    Banda alta desde {model.highRiskThreshold.toFixed(2)} · media desde{" "}
                    {model.mediumRiskThreshold.toFixed(2)}
                  </span>
                  <span>Umbral {model.decisionThreshold.toFixed(2)}</span>
                </div>
              </section>

              <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-3 text-[11px] leading-relaxed text-amber-900 dark:text-amber-200">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <p>
                  <span className="font-semibold">Estimación con proxy.</span> Este score es una
                  simulación sobre tareas sintéticas con la etiqueta de 7 días; no es el modelo
                  productivo ni una decisión automática.
                </p>
              </div>

              <section>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">Top 3 factores</h3>
                  <span className="text-[10px] text-muted-foreground">
                    Contribución estimada al score
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {task.factors.map((factor) => {
                    const isIncrease = factor.direction === "increase"

                    return (
                      <div
                        key={factor.id}
                        className="flex items-start gap-3 rounded-lg border border-border/60 bg-card px-3.5 py-3"
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                            isIncrease
                              ? "bg-red-500/10 text-red-600 dark:text-red-400"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                          )}
                        >
                          {isIncrease ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-foreground">{factor.label}</p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                            {factor.detail}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold",
                            isIncrease
                              ? "bg-red-500/10 text-red-700 dark:text-red-300"
                              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                          )}
                        >
                          {factor.impactPp > 0 ? "+" : "−"}
                          {Math.abs(factor.impactPp)} pp
                        </span>
                      </div>
                    )
                  })}
                </div>
              </section>

              <section className="rounded-xl border border-brand-primary/20 bg-brand-primary/[0.06] p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-brand-dark dark:text-brand-light">
                  <Sparkles className="h-4 w-4" />
                  Acción sugerida
                </div>
                <p className="mt-2 text-xs leading-relaxed text-foreground/80">
                  {task.suggestedAction}
                </p>
              </section>

              <section className="rounded-xl border border-border/60 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  Metadata del modelo
                </div>
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-[11px]">
                  <div>
                    <p className="text-muted-foreground">Modelo</p>
                    <p className="mt-0.5 font-mono text-[10px] font-medium text-foreground">
                      {model.version}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Umbral</p>
                    <p className="mt-0.5 font-medium tabular-nums text-foreground">
                      {model.decisionThreshold.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Corte</p>
                    <p className="mt-0.5 font-medium text-foreground">
                      {formatDateTimeEs(model.generatedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Proxy</p>
                    <p className="mt-0.5 font-medium text-foreground">
                      {model.proxyDays} días posteriores al vencimiento
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Regla de etiqueta</p>
                    <code className="mt-1 block rounded bg-muted/60 px-2 py-1 font-mono text-[10px] text-foreground">
                      {model.proxyRule}
                    </code>
                  </div>
                </div>
              </section>
            </div>

            <SheetFooter className="flex-row justify-between gap-2 border-t border-border/60 px-6 py-4">
              <Button
                type="button"
                size="sm"
                onClick={onOpenModel}
                className="gap-1.5 bg-brand-primary hover:bg-brand-hover"
              >
                Ver ficha del modelo
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Cerrar
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
