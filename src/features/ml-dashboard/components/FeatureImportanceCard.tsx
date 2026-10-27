import {
  Bar,
  BarChart,
  LabelList,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import ChartCard from "@/features/ml-dashboard/components/ChartCard"
import type { FeatureImportanceDatum } from "@/features/ml-dashboard/types"

const chartConfig = {
  importance: {
    label: "Importancia",
    color: "hsl(var(--brand-primary))",
  },
} satisfies ChartConfig

function FeatureTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null

  const datum = payload[0]?.payload as FeatureImportanceDatum | undefined
  if (!datum) return null

  return (
    <div className="max-w-64 rounded-lg border border-border/70 bg-background px-3 py-2.5 text-xs shadow-xl">
      <div className="flex items-center justify-between gap-4">
        <p className="font-medium text-foreground">{datum.feature}</p>
        <span className="font-mono font-semibold text-brand-primary">{datum.importance}%</span>
      </div>
      <p className="mt-1.5 leading-relaxed text-muted-foreground">{datum.description}</p>
    </div>
  )
}

type FeatureImportanceCardProps = {
  data: FeatureImportanceDatum[]
}

export default function FeatureImportanceCard({ data }: FeatureImportanceCardProps) {
  return (
    <ChartCard
      title="¿Qué impulsa la predicción?"
      description="Importancia relativa de variables · gain normalizado"
      action={
        <span className="rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          Suma 100%
        </span>
      }
    >
      <ChartContainer
        config={chartConfig}
        className="h-[310px] w-full aspect-auto"
        aria-label="Importancia relativa de las variables del modelo"
      >
        <BarChart
          accessibilityLayer
          data={data}
          layout="vertical"
          margin={{ top: 2, right: 34, left: 0, bottom: 0 }}
          barCategoryGap={10}
        >
          <XAxis type="number" hide domain={[0, 25]} />
          <YAxis
            type="category"
            dataKey="feature"
            width={172}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fontSize: 10 }}
          />
          <RechartsTooltip
            content={(props) => <FeatureTooltip {...props} />}
            cursor={{ fill: "hsl(var(--muted) / 0.45)" }}
          />
          <Bar
            dataKey="importance"
            fill="var(--color-importance)"
            radius={[0, 6, 6, 0]}
            barSize={14}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="importance"
              position="right"
              formatter={(value) => `${String(value)}%`}
              fill="hsl(var(--muted-foreground))"
              fontSize={10}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartCard>
  )
}
