import { AlertTriangle, ArrowRight, MapPin, ShieldCheck, Sparkles, FlaskConical } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/features/shared/lib/utils"
import { SURFACE_SHADOW } from "@/features/ml-dashboard/lib/risk"
import type {
  InsightFilter,
  InsightIcon,
  InsightTone,
  RiskInsight,
} from "@/features/ml-dashboard/types"

const toneStyles: Record<InsightTone, { icon: string; metric: string }> = {
  critical: {
    icon: "bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400",
    metric: "bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  },
  warning: {
    icon: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    metric: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  },
  positive: {
    icon: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    metric: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  neutral: {
    icon: "bg-brand-primary/10 text-brand-primary",
    metric: "bg-brand-primary/10 text-brand-primary",
  },
}

function InsightIcon({ icon }: { icon: InsightIcon }) {
  switch (icon) {
    case "location":
      return <MapPin className="h-4 w-4" />
    case "project":
      return <FlaskConical className="h-4 w-4" />
    case "shield":
      return <ShieldCheck className="h-4 w-4" />
    case "model":
      return <Sparkles className="h-4 w-4" />
    case "alert":
    default:
      return <AlertTriangle className="h-4 w-4" />
  }
}

type InsightsPanelProps = {
  insights: RiskInsight[]
  onApplyFilter: (filter: InsightFilter) => void
}

export default function InsightsPanel({ insights, onApplyFilter }: InsightsPanelProps) {
  return (
    <Card className={cn("flex h-full flex-col border-border/70", SURFACE_SHADOW)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold tracking-tight">Lectura ejecutiva</CardTitle>
          <CardDescription className="text-xs">
            Señales que explican la cartera actual
          </CardDescription>
        </div>
        <span className="rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {insights.length} hallazgos
        </span>
      </CardHeader>
      <CardContent className="flex-1 pt-2">
        <div className="divide-y divide-border/60">
          {insights.map((insight) => {
            const styles = toneStyles[insight.tone]

            return (
              <div key={insight.id} className="flex gap-3 py-3.5 first:pt-1 last:pb-1">
                <div
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    styles.icon,
                  )}
                >
                  <InsightIcon icon={insight.icon} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold leading-snug text-foreground">
                      {insight.title}
                    </p>
                    {insight.metric && (
                      <span
                        className={cn(
                          "shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-medium",
                          styles.metric,
                        )}
                      >
                        {insight.metric}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {insight.description}
                  </p>
                  {insight.filter && (
                    <button
                      type="button"
                      onClick={() => onApplyFilter(insight.filter as InsightFilter)}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-primary transition-colors hover:text-brand-dark"
                    >
                      {insight.filterLabel ?? "Ver tareas"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
