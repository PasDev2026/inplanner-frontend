import { Cell, Pie, PieChart } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import ChartCard from "@/features/ml-dashboard/components/ChartCard"
import { formatNumber, RISK_META } from "@/features/ml-dashboard/lib/risk"
import type { RiskDistributionDatum } from "@/features/ml-dashboard/types"

const chartConfig = {
  alto: { label: "Riesgo alto", color: RISK_META.alto.chartColor },
  medio: { label: "Riesgo medio", color: RISK_META.medio.chartColor },
  bajo: { label: "Riesgo bajo", color: RISK_META.bajo.chartColor },
} satisfies ChartConfig

type RiskDistributionCardProps = {
  distribution: RiskDistributionDatum[]
  totalTasks: number
}

export default function RiskDistributionCard({
  distribution,
  totalTasks,
}: RiskDistributionCardProps) {
  return (
    <ChartCard
      title="Distribución del riesgo"
      description="Bandas operativas sobre la cartera analizada"
      className="h-full"
    >
      <div className="flex h-full flex-col">
        <div className="relative mx-auto h-[205px] w-full max-w-[260px]">
          <ChartContainer
            config={chartConfig}
            className="h-[205px] w-full aspect-auto"
            aria-label="Distribución de tareas por nivel de riesgo"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
              <Pie
                data={distribution}
                dataKey="count"
                nameKey="label"
                innerRadius={64}
                outerRadius={91}
                paddingAngle={3}
                cornerRadius={5}
                strokeWidth={0}
                isAnimationActive={false}
              >
                {distribution.map((item) => (
                  <Cell key={item.level} fill={RISK_META[item.level].chartColor} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[1.7rem] font-semibold tracking-tight tabular-nums">
              {formatNumber(totalTasks)}
            </span>
            <span className="text-[11px] text-muted-foreground">tareas</span>
          </div>
        </div>

        <div className="mt-2 space-y-0.5">
          {distribution.map((item) => (
            <div
              key={item.level}
              className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/50"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${RISK_META[item.level].dotClass}`}
                  aria-hidden="true"
                />
                <span className="truncate text-xs font-medium text-foreground">
                  {RISK_META[item.level].label}
                </span>
              </div>
              <div className="flex shrink-0 items-baseline gap-2.5">
                <span className="text-sm font-semibold tabular-nums">{formatNumber(item.count)}</span>
                <span className="w-10 text-right text-[11px] text-muted-foreground tabular-nums">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-auto border-t border-border/60 pt-3 text-[10px] leading-relaxed text-muted-foreground">
          Banda alta: p ≥ 0.58 · media: 0.45–0.58 · baja: p &lt; 0.45.
        </p>
      </div>
    </ChartCard>
  )
}
