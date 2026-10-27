import {
  BarChart3,
  CalendarRange,
  Database,
  FlaskConical,
  Gauge,
  Info,
  Layers3,
  ShieldAlert,
  Target,
  TriangleAlert,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/features/shared/lib/utils"
import FeatureImportanceCard from "@/features/ml-dashboard/components/FeatureImportanceCard"
import ModelComparisonCard from "@/features/ml-dashboard/components/ModelComparisonCard"
import {
  formatDateShortEs,
  formatNumber,
  formatPercentage,
  SURFACE_SHADOW,
} from "@/features/ml-dashboard/lib/risk"
import type {
  FeatureImportanceDatum,
  ModelComparisonDatum,
  ModelInfo,
} from "@/features/ml-dashboard/types"

type ModelDetailsPanelProps = {
  model: ModelInfo
  featureImportance: FeatureImportanceDatum[]
  comparison: ModelComparisonDatum[]
}

const metricItems = [
  { key: "rocAuc", label: "ROC-AUC", help: "Capacidad de discriminación", icon: Gauge },
  { key: "prAuc", label: "PR-AUC", help: "Precisión media del ranking", icon: Target },
  { key: "f1", label: "F1", help: "Balance precisión / recall", icon: BarChart3 },
  { key: "precision", label: "Precisión", help: "Aciertos entre las alertas", icon: Info },
  { key: "recall", label: "Recall", help: "Positivos detectados", icon: Layers3 },
  { key: "accuracy", label: "Exactitud", help: "Aciertos globales", icon: CalendarRange },
] as const

function ConfusionCell({
  value,
  label,
  tone,
}: {
  value: number
  label: string
  tone: "positive" | "negative" | "warning" | "neutral"
}) {
  const toneClass = {
    positive: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    negative: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300",
    warning: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    neutral: "border-border/60 bg-muted/40 text-muted-foreground",
  }[tone]

  return (
    <div className={cn("rounded-lg border p-3 text-center", toneClass)}>
      <p className="text-lg font-semibold tabular-nums">{formatNumber(value)}</p>
      <p className="mt-0.5 text-[10px] font-medium">{label}</p>
    </div>
  )
}

export default function ModelDetailsPanel({
  model,
  featureImportance,
  comparison,
}: ModelDetailsPanelProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const matrix = model.confusionMatrix
  const techLabelClass = isDark ? "text-white/45" : "text-muted-foreground"
  const techValueClass = isDark ? "text-white/90" : "text-foreground"
  const techDividerClass = isDark ? "border-white/10" : "border-border/60"

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-12">
        <Card className={cn("border-border/70 xl:col-span-7", SURFACE_SHADOW)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold tracking-tight">
              Desempeño del modelo
            </CardTitle>
            <CardDescription className="text-xs">
              {model.validation} · {model.datasetSize} registros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {metricItems.map((metric) => {
                const Icon = metric.icon
                const value = model.metrics[metric.key]

                return (
                  <div
                    key={metric.key}
                    className="rounded-xl border border-border/60 bg-muted/20 p-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {metric.label}
                      </span>
                      <Icon className="h-3.5 w-3.5 text-muted-foreground/70" />
                    </div>
                    <p className="mt-2 text-2xl font-semibold leading-none tracking-tight tabular-nums text-foreground">
                      {value.toFixed(2)}
                    </p>
                    <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">
                      {metric.help}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
              <span className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5">
                Umbral de decisión {model.decisionThreshold.toFixed(2)}
              </span>
              <span className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5">
                Banda alta ≥ {model.highRiskThreshold.toFixed(2)}
              </span>
              <span className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5">
                {model.period}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "relative overflow-hidden xl:col-span-5",
            isDark
              ? "border-0 bg-[#062b3a] text-white"
              : "border-border/70 bg-card text-card-foreground",
            !isDark && SURFACE_SHADOW,
          )}
        >
          <div
            className={cn(
              "pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full blur-3xl",
              isDark ? "bg-brand-primary/20" : "bg-brand-primary/10",
            )}
            aria-hidden="true"
          />
          <div className="relative flex h-full flex-col p-5">
            <div
              className={cn(
                "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]",
                isDark ? "text-white/60" : "text-muted-foreground",
              )}
            >
              <FlaskConical
                className={cn("h-3.5 w-3.5", isDark ? "text-teal-300" : "text-brand-primary")}
              />
              Ficha técnica
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div
                className={cn(
                  "flex items-start justify-between gap-3 border-b pb-2.5",
                  techDividerClass,
                )}
              >
                <span className={techLabelClass}>Algoritmo</span>
                <span className={cn("text-right font-medium", techValueClass)}>
                  {model.algorithm}
                </span>
              </div>
              <div
                className={cn(
                  "flex items-start justify-between gap-3 border-b pb-2.5",
                  techDividerClass,
                )}
              >
                <span className={techLabelClass}>Versión</span>
                <span
                  className={cn(
                    "font-mono text-[11px]",
                    isDark ? "text-teal-200" : "text-brand-primary",
                  )}
                >
                  {model.version}
                </span>
              </div>
              <div
                className={cn(
                  "flex items-start justify-between gap-3 border-b pb-2.5",
                  techDividerClass,
                )}
              >
                <span className={techLabelClass}>Entrenamiento</span>
                <span className={techValueClass}>{formatDateShortEs(model.trainedAt)}</span>
              </div>
              <div
                className={cn(
                  "flex items-start justify-between gap-3 border-b pb-2.5",
                  techDividerClass,
                )}
              >
                <span className={techLabelClass}>Corte</span>
                <span className={techValueClass}>{formatDateShortEs(model.referenceDate)}</span>
              </div>
              <div
                className={cn(
                  "flex items-start justify-between gap-3 border-b pb-2.5",
                  techDividerClass,
                )}
              >
                <span className={techLabelClass}>Variables</span>
                <span className={techValueClass}>{model.featureCount} features</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className={techLabelClass}>Registros</span>
                <span className={techValueClass}>{formatNumber(model.datasetSize)}</span>
              </div>
            </div>

            <div
              className={cn(
                "mt-4 rounded-lg border p-3",
                isDark ? "border-white/10 bg-white/[0.04]" : "border-border/60 bg-muted/40",
              )}
            >
              <p
                className={cn(
                  "text-[10px] uppercase tracking-[0.12em]",
                  isDark ? "text-white/45" : "text-muted-foreground",
                )}
              >
                Etiqueta proxy
              </p>
              <code
                className={cn(
                  "mt-1.5 block font-mono text-[10px] leading-relaxed",
                  isDark ? "text-teal-200" : "text-brand-dark",
                )}
              >
                {model.proxyRule}
              </code>
            </div>

            <div
              className={cn(
                "mt-auto flex items-center justify-between gap-2 border-t pt-4 text-[10px]",
                techDividerClass,
                isDark ? "text-white/45" : "text-muted-foreground",
              )}
            >
              <span>Demo · datos sintéticos</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1",
                  isDark ? "text-amber-200" : "text-amber-700",
                )}
              >
                <TriangleAlert className="h-3 w-3" />
                No productivo
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-6">
          <FeatureImportanceCard data={featureImportance} />
        </div>
        <div className="xl:col-span-6">
          <ModelComparisonCard data={comparison} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Card className={cn("border-border/70 xl:col-span-5", SURFACE_SHADOW)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold tracking-tight">
              Matriz de confusión
            </CardTitle>
            <CardDescription className="text-xs">
              Umbral {model.decisionThreshold.toFixed(2)} · {formatNumber(model.datasetSize)} predicciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-[64px_1fr_1fr] gap-1.5">
              <div />
              <div className="px-2 pb-1 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Predicho +
              </div>
              <div className="px-2 pb-1 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Predicho −
              </div>

              <div className="flex items-center justify-end pr-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Real +
              </div>
              <ConfusionCell
                value={matrix.truePositive}
                label="Verdadero positivo"
                tone="positive"
              />
              <ConfusionCell
                value={matrix.falseNegative}
                label="Falso negativo"
                tone="negative"
              />

              <div className="flex items-center justify-end pr-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Real −
              </div>
              <ConfusionCell
                value={matrix.falsePositive}
                label="Falso positivo"
                tone="warning"
              />
              <ConfusionCell
                value={matrix.trueNegative}
                label="Verdadero negativo"
                tone="neutral"
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-center">
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Precisión</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums">{model.metrics.precision.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Recall</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums">{model.metrics.recall.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">F1</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums">{model.metrics.f1.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn("border-border/70 xl:col-span-7", SURFACE_SHADOW)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold tracking-tight">
              Dataset y etiqueta proxy
            </CardTitle>
            <CardDescription className="text-xs">
              {formatNumber(model.datasetSize)} tareas históricas · {model.period}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-3xl font-semibold tracking-tight tabular-nums">
                  {formatNumber(model.datasetSize)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">registros de entrenamiento y validación</p>
              </div>
              <div className="flex gap-2">
                <span className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                  {model.featureCount} variables
                </span>
                <span className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                  5 folds
                </span>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-brand-primary"
                  style={{ width: `${model.positiveRate}%` }}
                  title={`${formatNumber(model.positiveCount)} positivas`}
                />
                <div
                  className="h-full bg-muted-foreground/30"
                  style={{ width: `${100 - model.positiveRate}%` }}
                  title={`${formatNumber(model.negativeCount)} negativas`}
                />
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-brand-primary" aria-hidden="true" />
                  Positivas {formatNumber(model.positiveCount)} · {formatPercentage(model.positiveRate)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/30" aria-hidden="true" />
                  Negativas {formatNumber(model.negativeCount)} · {(100 - model.positiveRate).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-3.5">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-amber-800 dark:text-amber-200">
                <FlaskConical className="h-4 w-4" />
                Cómo se construye la etiqueta
              </div>
              <code className="mt-2 block rounded-md bg-background/70 px-2 py-1.5 font-mono text-[10px] text-foreground ring-1 ring-border/50">
                {model.proxyRule}
              </code>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Una tarea se marca positiva si se actualizó más de {model.proxyDays} días después
                del vencimiento. Es una aproximación operativa, no el evento real de incumplimiento.
              </p>
            </div>

            <div className="mt-4 flex items-start gap-2 text-[10px] leading-relaxed text-muted-foreground">
              <Database className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Dataset sintético con 62.5% de positivas. La tasa base histórica no es
                directamente comparable con la cartera abierta actual.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={cn("border-border/70", SURFACE_SHADOW)}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <CardTitle className="text-base font-semibold tracking-tight">
              Limitaciones y uso responsable
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Lo que este prototipo puede y no puede decir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2.5 md:grid-cols-2">
            {model.limitations.map((limitation, index) => (
              <div
                key={limitation}
                className={cn(
                  "flex gap-3 rounded-xl border border-border/60 bg-muted/15 p-3.5",
                  index === model.limitations.length - 1 &&
                    model.limitations.length % 2 === 1 &&
                    "md:col-span-2",
                )}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                  {index + 1}
                </span>
                <p className="text-[11px] leading-relaxed text-muted-foreground">{limitation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
