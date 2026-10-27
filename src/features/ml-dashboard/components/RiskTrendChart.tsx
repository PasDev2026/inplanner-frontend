import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts"
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart"
import ChartCard from "@/features/ml-dashboard/components/ChartCard"
import type { RiskTrendPoint } from "@/features/ml-dashboard/types"

const chartConfig = {
  highRiskShare: {
    label: "Riesgo alto",
    color: "hsl(var(--destructive))",
  },
  estimatedDelayShare: {
    label: "Retraso estimado",
    color: "hsl(var(--brand-primary))",
  },
} satisfies ChartConfig

function TrendTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="min-w-44 rounded-lg border border-border/70 bg-background px-3 py-2.5 text-xs shadow-xl">
      <p className="font-medium text-foreground">{label}</p>
      <div className="mt-2 space-y-1.5">
        {payload.map((item) => (
          <div key={String(item.dataKey)} className="flex items-center justify-between gap-5">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              {item.name}
            </span>
            <span className="font-mono font-semibold tabular-nums text-foreground">
              {Number(item.value).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

type RiskTrendChartProps = {
  data: RiskTrendPoint[]
}

export default function RiskTrendChart({ data }: RiskTrendChartProps) {
  return (
    <ChartCard
      title="Evolución del riesgo"
      description="Participación semanal sobre el total · últimas 10 semanas"
      action={
        <div className="flex flex-wrap items-center justify-end gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
            Riesgo alto
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-brand-primary" aria-hidden="true" />
            Retraso estimado
          </span>
        </div>
      }
    >
      <ChartContainer
        config={chartConfig}
        className="h-[268px] w-full aspect-auto"
        aria-label="Evolución semanal del riesgo alto y del retraso estimado"
      >
        <LineChart
          accessibilityLayer
          data={data}
          margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 4" />
          <XAxis
            dataKey="week"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            minTickGap={24}
            tick={{ fontSize: 10 }}
          />
          <YAxis
            domain={[0, 70]}
            ticks={[0, 20, 40, 60]}
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={(value: number) => `${value}%`}
            tick={{ fontSize: 10 }}
          />
          <RechartsTooltip
            content={(props) => <TrendTooltip {...props} />}
            cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey="highRiskShare"
            stroke="var(--color-highRiskShare)"
            strokeWidth={2.5}
            strokeLinecap="round"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2 }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="estimatedDelayShare"
            stroke="var(--color-estimatedDelayShare)"
            strokeWidth={2}
            strokeDasharray="5 4"
            strokeLinecap="round"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ChartContainer>
    </ChartCard>
  )
}
