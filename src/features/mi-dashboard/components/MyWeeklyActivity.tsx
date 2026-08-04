import { useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { CalendarRange, RotateCcw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { DateRangePicker } from "@/features/shared/components/DateRangePicker"
import { cn } from "@/features/shared/lib/utils"
import { fetchMyWeeklyActivity } from "@/features/mi-dashboard/actions/mi-dashboard.api"
import { MY_WEEKLY_ACTIVITY_KEY } from "@/features/mi-dashboard/lib/mi-dashboard-keys"
import { buildWeeklyActivityData, defaultWeeklyRange, weeklyChartConfig } from "@/features/mi-dashboard/constants/weekly-activity"

export default function MyWeeklyActivity() {
  const [range, setRange] = useState(defaultWeeklyRange)

  const { data, isPlaceholderData } = useQuery({
    queryKey: [...MY_WEEKLY_ACTIVITY_KEY, range.from.toISOString(), range.to.toISOString()],
    queryFn: () => fetchMyWeeklyActivity(range.from, range.to),
    placeholderData: keepPreviousData,
  })

  const chartData = data ? buildWeeklyActivityData(data, range.from, range.to) : []
  const hasActivity = chartData.some((d) => d.created > 0 || d.completed > 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="font-semibold">Actividad semanal</CardTitle>
          <div className="flex items-center gap-2">
            <DateRangePicker
              dateRange={{ from: range.from, to: range.to }}
              onSelect={(selected) => {
                if (selected?.from && selected.to) {
                  setRange({ from: selected.from, to: selected.to })
                }
              }}
              className="w-[220px]"
            />
            <Button variant="ghost" size="icon" onClick={() => setRange(defaultWeeklyRange())} aria-label="Restablecer rango">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!data ? (
          <Skeleton className="aspect-[16/9] w-full rounded-xl" />
        ) : !hasActivity ? (
          <div className="flex aspect-[16/9] w-full items-center justify-center">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CalendarRange />
                </EmptyMedia>
                <EmptyContent>
                  <EmptyTitle>Sin actividad en el rango seleccionado</EmptyTitle>
                </EmptyContent>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <ChartContainer config={weeklyChartConfig} className={cn("aspect-[16/9]", isPlaceholderData && "opacity-50")}>
            <AreaChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} tickMargin={10} axisLine={false} minTickGap={24} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area dataKey="created" type="monotone" stroke="var(--color-created)" fill="var(--color-created)" fillOpacity={0.2} strokeWidth={2} />
              <Area dataKey="completed" type="monotone" stroke="var(--color-completed)" fill="var(--color-completed)" fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
