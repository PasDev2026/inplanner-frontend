import { ArrowUpRight, Sparkles } from "lucide-react"
import { useTheme } from "next-themes"
import { Card } from "@/components/ui/card"
import { cn } from "@/features/shared/lib/utils"
import {
  formatNumber,
  formatPercentage,
  RISK_META,
  riskCounts,
  riskPercentage,
  SURFACE_SHADOW,
} from "@/features/ml-dashboard/lib/risk"
import type { ModelInfo, RiskLevel, RiskSummary } from "@/features/ml-dashboard/types"

type RiskKpiScoreboardProps = {
  summary: RiskSummary
  model: ModelInfo
  onOpenModel: () => void
}

type KpiCellProps = {
  label: string
  value: string
  detail: string
  level?: RiskLevel
}

function KpiCell({ label, value, detail, level }: KpiCellProps) {
  return (
    <div className="px-4 py-5 sm:px-5">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {level && (
          <span className={cn("h-1.5 w-1.5 rounded-full", RISK_META[level].dotClass)} aria-hidden="true" />
        )}
        {label}
      </div>
      <div
        className={cn(
          "mt-2 text-[1.7rem] font-semibold leading-none tracking-tight tabular-nums",
          level ? RISK_META[level].textClass : "text-foreground",
        )}
      >
        {value}
      </div>
      <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{detail}</p>
    </div>
  )
}

export default function RiskKpiScoreboard({
  summary,
  model,
  onOpenModel,
}: RiskKpiScoreboardProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const counts = riskCounts(summary.distribution)
  const metrics = model.metrics
  const modelMetricLabelClass = isDark ? "text-white/50" : "text-muted-foreground"
  const modelMetricValueClass = isDark ? "text-white" : "text-brand-dark"

  return (
    <div className="grid gap-4 xl:grid-cols-12">
      <Card
        className={cn(
          "overflow-hidden border-border/70 xl:col-span-8",
          SURFACE_SHADOW,
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/20 px-5 py-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
            Pulso de la cartera
          </div>
          <span className="text-[11px] text-muted-foreground">
            {formatNumber(summary.totalTasks)} tareas · bandas operativas
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 sm:divide-x sm:divide-border/60">
          <KpiCell
            label="Tareas analizadas"
            value={formatNumber(summary.totalTasks)}
            detail={`${formatPercentage(model.positiveRate)} positivas · ${model.featureCount} variables`}
          />
          {(["alto", "medio", "bajo"] as RiskLevel[]).map((level) => (
            <KpiCell
              key={level}
              label={RISK_META[level].label}
              value={formatNumber(counts[level])}
              detail={`${formatPercentage(riskPercentage(summary, level))} del total`}
              level={level}
            />
          ))}
          <KpiCell
            label="Retraso estimado"
            value={formatPercentage(summary.estimatedDelayRate)}
            detail={`${formatNumber(summary.estimatedDelayed)} tareas sobre el umbral ${model.decisionThreshold.toFixed(2)}`}
          />
        </div>
      </Card>

      <Card
        className={cn(
          "relative overflow-hidden xl:col-span-4",
          isDark
            ? "border-0 bg-[#062b3a] text-white"
            : "border-border/70 bg-card text-card-foreground",
          !isDark && SURFACE_SHADOW,
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full blur-3xl",
            isDark ? "bg-brand-primary/25" : "bg-brand-primary/10",
          )}
          aria-hidden="true"
        />
        <div className="relative flex h-full flex-col p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div
              className={cn(
                "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]",
                isDark ? "text-white/60" : "text-muted-foreground",
              )}
            >
              <Sparkles
                className={cn("h-3.5 w-3.5", isDark ? "text-teal-300" : "text-brand-primary")}
              />
              Calidad del modelo
            </div>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                isDark
                  ? "border-white/15 bg-white/5 text-white/65"
                  : "border-border/70 bg-muted/40 text-muted-foreground",
              )}
            >
              CV 5 folds
            </span>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div>
              <p className={cn("text-[10px] uppercase tracking-[0.12em]", modelMetricLabelClass)}>
                ROC-AUC
              </p>
              <p
                className={cn(
                  "mt-1.5 text-3xl font-semibold tracking-tight tabular-nums",
                  modelMetricValueClass,
                )}
              >
                {metrics.rocAuc.toFixed(2)}
              </p>
            </div>
            <div>
              <p className={cn("text-[10px] uppercase tracking-[0.12em]", modelMetricLabelClass)}>
                PR-AUC
              </p>
              <p
                className={cn(
                  "mt-1.5 text-3xl font-semibold tracking-tight tabular-nums",
                  modelMetricValueClass,
                )}
              >
                {metrics.prAuc.toFixed(2)}
              </p>
            </div>
            <div>
              <p className={cn("text-[10px] uppercase tracking-[0.12em]", modelMetricLabelClass)}>
                F1
              </p>
              <p
                className={cn(
                  "mt-1.5 text-3xl font-semibold tracking-tight tabular-nums",
                  modelMetricValueClass,
                )}
              >
                {metrics.f1.toFixed(2)}
              </p>
            </div>
          </div>

          <div
            className={cn(
              "mt-auto flex flex-wrap items-center justify-between gap-2 border-t pt-4",
              isDark ? "border-white/10" : "border-border/60",
            )}
          >
            <span className={cn("text-[11px]", isDark ? "text-white/50" : "text-muted-foreground")}>
              Umbral {model.decisionThreshold.toFixed(2)} · {formatNumber(model.datasetSize)} registros
            </span>
            <button
              type="button"
              onClick={onOpenModel}
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium transition-colors",
                isDark
                  ? "text-teal-200 hover:text-teal-100"
                  : "text-brand-primary hover:text-brand-dark",
              )}
            >
              Ver ficha ML
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
