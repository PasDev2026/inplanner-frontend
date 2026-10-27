import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import ChartCard from "@/features/ml-dashboard/components/ChartCard"
import type { ModelComparisonDatum } from "@/features/ml-dashboard/types"

const chartConfig = {
  xgboost: {
    label: "XGBoost proxy",
    color: "hsl(var(--brand-primary))",
  },
  baseline: {
    label: "Baseline",
    color: "hsl(var(--muted-foreground) / 0.55)",
  },
} satisfies ChartConfig

type ModelComparisonCardProps = {
  data: ModelComparisonDatum[]
}

export default function ModelComparisonCard({ data }: ModelComparisonCardProps) {
  const prAuc = data.find((item) => item.metric === "PR-AUC")
  const uplift =
    prAuc && prAuc.baseline > 0
      ? ((prAuc.xgboost - prAuc.baseline) / prAuc.baseline) * 100
      : 0

  return (
    <ChartCard
      title="XGBoost vs. baseline"
      description="Métricas de validación · escala 0 a 1"
      action={
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
          +{uplift.toFixed(0)}% uplift PR-AUC
        </span>
      }
    >
      <ChartContainer
        config={chartConfig}
        className="h-[310px] w-full aspect-auto"
        aria-label="Comparación de métricas entre XGBoost y el baseline"
      >
        <BarChart
          accessibilityLayer
          data={data}
          margin={{ top: 18, right: 8, left: -16, bottom: 0 }}
          barGap={6}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 4" />
          <XAxis
            dataKey="metric"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            domain={[0, 0.8]}
            ticks={[0, 0.2, 0.4, 0.6, 0.8]}
            tickLine={false}
            axisLine={false}
            width={42}
            tickFormatter={(value: number) => value.toFixed(1)}
            tick={{ fontSize: 10 }}
          />
          <RechartsTooltip
            content={<ChartTooltipContent />}
            cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
          />
          <Bar
            dataKey="xgboost"
            fill="var(--color-xgboost)"
            radius={[4, 4, 0, 0]}
            barSize={30}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="xgboost"
              position="top"
              formatter={(value) => Number(value).toFixed(2)}
              fill="hsl(var(--foreground))"
              fontSize={10}
            />
          </Bar>
          <Bar
            dataKey="baseline"
            fill="var(--color-baseline)"
            radius={[4, 4, 0, 0]}
            barSize={30}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="baseline"
              position="top"
              formatter={(value) => Number(value).toFixed(2)}
              fill="hsl(var(--muted-foreground))"
              fontSize={10}
            />
          </Bar>
        </BarChart>
      </ChartContainer>

      <div className="mt-2 space-y-1.5 border-t border-border/60 pt-3 text-[10px] text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-brand-primary" aria-hidden="true" />
            XGBoost proxy
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40" aria-hidden="true" />
            Baseline
          </span>
          <span className="ml-auto">Validación cruzada · 5 folds</span>
        </div>
        <p>Baseline: regresión logística con las mismas variables.</p>
      </div>
    </ChartCard>
  )
}
