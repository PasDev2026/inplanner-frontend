import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  pending: { label: "Pendiente", color: "var(--chart-1)" },
  inProgress: { label: "En Progreso", color: "var(--chart-2)" },
  underReview: { label: "En Revisión", color: "var(--chart-3)" },
  completed: { label: "Completado", color: "var(--chart-4)" },
  overdue: { label: "Vencido", color: "var(--chart-5)" },
} satisfies ChartConfig

type OverviewChartProps = {
  taskCounts: {
    pending: number
    inProgress: number
    underReview: number
    completed: number
    overdue: number
  }
}

export default function OverviewChart({ taskCounts }: OverviewChartProps) {
  const chartData = [
    { status: "Pendiente", value: taskCounts.pending, fill: "var(--color-pending)" },
    { status: "Progreso", value: taskCounts.inProgress, fill: "var(--color-inProgress)" },
    { status: "Revisión", value: taskCounts.underReview, fill: "var(--color-underReview)" },
    { status: "Completado", value: taskCounts.completed, fill: "var(--color-completed)" },
    { status: "Vencido", value: taskCounts.overdue, fill: "var(--color-overdue)" },
  ]

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="font-semibold">Tareas por estado</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-[16/9]">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="status" tickLine={false} tickMargin={10} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
