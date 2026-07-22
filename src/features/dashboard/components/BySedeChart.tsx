import { useState, useMemo } from "react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchBySedeStats } from "@/features/dashboard/actions/dashboard.api"
import { getSedes } from "@/features/shared/actions/centralizado.api"
import { SEDES_KEY } from "@/features/shared/lib/shared-keys"

function getMonthOptions(count: number) {
  const now = new Date()
  const options: { value: string; label: string }[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const month = d.getMonth() + 1
    const year = d.getFullYear()
    const value = `${year}-${String(month).padStart(2, "0")}`
    const label = d.toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    })
    options.push({ value, label })
  }
  return options
}

const projectChartConfig = {
  count: { label: "Proyectos", color: "var(--chart-1)" },
} satisfies ChartConfig

const taskChartConfig = {
  count: { label: "Tareas", color: "var(--chart-2)" },
} satisfies ChartConfig

export default function BySedeChart() {
  const monthOptions = useMemo(() => getMonthOptions(6), [])
  const [selected, setSelected] = useState(monthOptions[0]?.value ?? "")
  const [year, month] = selected.split("-").map(Number)

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-by-sede", month, year],
    queryFn: () => fetchBySedeStats(month, year),
    enabled: !!selected,
  })

  const { data: sedes } = useQuery({
    queryKey: SEDES_KEY,
    queryFn: getSedes,
  })

  const sedeMap = useMemo(
    () => new Map((sedes ?? []).map((s) => [s.id, s.nombre])),
    [sedes],
  )

  const projectData = useMemo(
    () =>
      (stats ?? [])
        .map((item) => ({
          sede: sedeMap.get(item.sede_id) ?? item.sede_id.slice(0, 8),
          count: item.projects,
        }))
        .filter((d) => d.count > 0)
        .sort((a, b) => b.count - a.count),
    [stats, sedeMap],
  )

  const taskData = useMemo(
    () =>
      (stats ?? [])
        .map((item) => ({
          sede: sedeMap.get(item.sede_id) ?? item.sede_id.slice(0, 8),
          count: item.tasks,
        }))
        .filter((d) => d.count > 0)
        .sort((a, b) => b.count - a.count),
    [stats, sedeMap],
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-semibold">Proyectos y tareas por sede</CardTitle>
          <Select value={selected} onValueChange={setSelected}>
            <Select.Trigger className="h-8 w-[160px] rounded-lg">
              <Select.Value />
            </Select.Trigger>
            <Select.Popup>
              <Select.List>
                {monthOptions.map((opt) => (
                  <Select.Item key={opt.value} value={opt.value}>
                    {opt.label}
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-[250px] rounded-xl" />
            <Skeleton className="h-[250px] rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground text-center">
                Proyectos
              </span>
              <ChartContainer
                config={projectChartConfig}
                className="max-h-[250px] w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={projectData}
                  layout="vertical"
                  margin={{ left: -20 }}
                >
                  <XAxis type="number" dataKey="count" hide />
                  <YAxis
                    dataKey="sede"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="count" fill="var(--color-count)" radius={5} />
                </BarChart>
              </ChartContainer>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground text-center">
                Tareas
              </span>
              <ChartContainer
                config={taskChartConfig}
                className="max-h-[250px] w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={taskData}
                  layout="vertical"
                  margin={{ left: -20 }}
                >
                  <XAxis type="number" dataKey="count" hide />
                  <YAxis
                    dataKey="sede"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="count" fill="var(--color-count)" radius={5} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
