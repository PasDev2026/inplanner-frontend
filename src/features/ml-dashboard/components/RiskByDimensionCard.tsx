import { useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/features/shared/lib/utils"
import ChartCard from "@/features/ml-dashboard/components/ChartCard"
import RiskLegend from "@/features/ml-dashboard/components/RiskLegend"
import { RISK_META } from "@/features/ml-dashboard/lib/risk"
import type { DimensionRisk } from "@/features/ml-dashboard/types"

const chartConfig = {
  alto: { label: "Riesgo alto", color: RISK_META.alto.chartColor },
  medio: { label: "Riesgo medio", color: RISK_META.medio.chartColor },
  bajo: { label: "Riesgo bajo", color: RISK_META.bajo.chartColor },
} satisfies ChartConfig

type Dimension = "project" | "sede"

type RiskByDimensionCardProps = {
  byProject: DimensionRisk[]
  bySede: DimensionRisk[]
}

export default function RiskByDimensionCard({
  byProject,
  bySede,
}: RiskByDimensionCardProps) {
  const [dimension, setDimension] = useState<Dimension>("project")
  const data = [...(dimension === "project" ? byProject : bySede)].sort(
    (a, b) => b.alto - a.alto,
  )

  return (
    <ChartCard
      title="Riesgo por proyecto y sede"
      description="Casos por banda · ordenados por riesgo alto"
      action={
        <div
          role="group"
          aria-label="Agrupar riesgo por"
          className="inline-flex rounded-lg border border-border/70 bg-muted/40 p-0.5"
        >
          {(["project", "sede"] as Dimension[]).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={dimension === option}
              onClick={() => setDimension(option)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                dimension === option
                  ? "bg-card text-foreground shadow-sm ring-1 ring-border/60"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option === "project" ? "Proyecto" : "Sede"}
            </button>
          ))}
        </div>
      }
    >
      <ChartContainer
        config={chartConfig}
        className="h-[292px] w-full aspect-auto"
        aria-label={`Distribución de riesgo por ${dimension === "project" ? "proyecto" : "sede"}`}
      >
        <BarChart
          accessibilityLayer
          data={data}
          layout="vertical"
          margin={{ top: 2, right: 18, left: 0, bottom: 0 }}
          barCategoryGap={12}
        >
          <CartesianGrid horizontal={false} strokeDasharray="3 4" />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="shortName"
            width={94}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fontSize: 11 }}
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
            cursor={{ fill: "hsl(var(--muted) / 0.55)" }}
          />
          <Bar
            dataKey="alto"
            stackId="risk"
            fill="var(--color-alto)"
            barSize={15}
            radius={[3, 0, 0, 3]}
            isAnimationActive={false}
          />
          <Bar
            dataKey="medio"
            stackId="risk"
            fill="var(--color-medio)"
            barSize={15}
            isAnimationActive={false}
          />
          <Bar
            dataKey="bajo"
            stackId="risk"
            fill="var(--color-bajo)"
            barSize={15}
            radius={[0, 3, 3, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ChartContainer>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
        <RiskLegend compact />
        <span className="text-[10px] text-muted-foreground">
          {dimension === "project" ? "6 proyectos" : "4 sedes"} · 627 tareas
        </span>
      </div>
    </ChartCard>
  )
}
