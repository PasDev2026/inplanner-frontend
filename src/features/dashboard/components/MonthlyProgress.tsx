import { useState, useMemo, useCallback } from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import type { PieSectorShapeProps } from "recharts/types/polar/Pie"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Select } from "@/components/ui/select"
import { fetchMonthlyStats } from "@/features/dashboard/actions/dashboard.api"
import { Skeleton } from "@/components/ui/skeleton"

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

const taskChartConfig = {
  completed: { label: "Completadas", color: "var(--chart-4)" },
  pending: { label: "Pendientes", color: "var(--chart-1)" },
} satisfies ChartConfig

const projectChartConfig = {
  completed: { label: "Completados", color: "var(--chart-4)" },
  pending: { label: "Pendientes", color: "var(--chart-1)" },
} satisfies ChartConfig

export default function MonthlyProgress() {
  const monthOptions = useMemo(() => getMonthOptions(6), [])
  const [selected, setSelected] = useState(monthOptions[0]?.value ?? "")
  const [taskActive, setTaskActive] = useState<string | null>(null)
  const [projectActive, setProjectActive] = useState<string | null>(null)

  const [year, month] = selected.split("-").map(Number)

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-monthly", month, year],
    queryFn: () => fetchMonthlyStats(month, year),
    enabled: !!selected,
  })

  const taskData = useMemo(
    () =>
      data
        ? [
            {
              name: "completed",
              value: data.tasks.completed,
              fill: "var(--color-completed)",
            },
            {
              name: "pending",
              value: data.tasks.total - data.tasks.completed,
              fill: "var(--color-pending)",
            },
          ]
        : [],
    [data],
  )

  const projectData = useMemo(
    () =>
      data
        ? [
            {
              name: "completed",
              value: data.projects.completed,
              fill: "var(--color-completed)",
            },
            {
              name: "pending",
              value: data.projects.total - data.projects.completed,
              fill: "var(--color-pending)",
            },
          ]
        : [],
    [data],
  )

  const taskActiveIndex = useMemo(
    () => taskData.findIndex((item) => item.name === (taskActive ?? "completed")),
    [taskData, taskActive],
  )

  const projectActiveIndex = useMemo(
    () => projectData.findIndex((item) => item.name === (projectActive ?? "completed")),
    [projectData, projectActive],
  )

  const renderTaskShape = useCallback(
    ({ index, outerRadius = 0, ...props }: PieSectorShapeProps) => {
      if (index === taskActiveIndex) {
        return (
          <g>
            <Sector {...props} outerRadius={outerRadius + 6} />
            <Sector {...props} outerRadius={outerRadius + 14} innerRadius={outerRadius + 6} />
          </g>
        )
      }
      return <Sector {...props} outerRadius={outerRadius} />
    },
    [taskActiveIndex],
  )

  const renderProjectShape = useCallback(
    ({ index, outerRadius = 0, ...props }: PieSectorShapeProps) => {
      if (index === projectActiveIndex) {
        return (
          <g>
            <Sector {...props} outerRadius={outerRadius + 6} />
            <Sector {...props} outerRadius={outerRadius + 14} innerRadius={outerRadius + 6} />
          </g>
        )
      }
      return <Sector {...props} outerRadius={outerRadius} />
    },
    [projectActiveIndex],
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-semibold">Actividad mensual</CardTitle>
          <Select value={selected} onValueChange={(v) => { if (v) setSelected(v); }}>
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
            <Skeleton className="h-[200px] rounded-xl" />
            <Skeleton className="h-[200px] rounded-xl" />
          </div>
        ) : data ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center gap-2">
              <ChartContainer
                config={taskChartConfig}
                className="mx-auto aspect-square w-full max-w-[180px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={taskData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    strokeWidth={3}
                    shape={renderTaskShape}
                    onMouseEnter={(_, index) =>
                      setTaskActive(taskData[index]?.name ?? null)
                    }
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (
                          viewBox &&
                          "cx" in viewBox &&
                          "cy" in viewBox
                        ) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-2xl font-bold"
                              >
                                {data.tasks.completed}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 20}
                                className="fill-muted-foreground text-xs"
                              >
                                de {data.tasks.total}
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
              <span className="text-sm font-medium text-muted-foreground">
                Tareas
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ChartContainer
                config={projectChartConfig}
                className="mx-auto aspect-square w-full max-w-[180px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={projectData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    strokeWidth={3}
                    shape={renderProjectShape}
                    onMouseEnter={(_, index) =>
                      setProjectActive(projectData[index]?.name ?? null)
                    }
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (
                          viewBox &&
                          "cx" in viewBox &&
                          "cy" in viewBox
                        ) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-2xl font-bold"
                              >
                                {data.projects.completed}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 20}
                                className="fill-muted-foreground text-xs"
                              >
                                de {data.projects.total}
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
              <span className="text-sm font-medium text-muted-foreground">
                Proyectos
              </span>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
