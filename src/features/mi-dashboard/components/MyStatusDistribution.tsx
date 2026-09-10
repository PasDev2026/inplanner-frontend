import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ClipboardList, FolderOpen } from "lucide-react"
import type { MyProjectItem, MyTaskCounts } from "@/features/mi-dashboard/actions/mi-dashboard.api"
import { buildMyTaskStatusData, myTaskChartConfig } from "@/features/mi-dashboard/constants/task-status-chart"
import { buildMyProjectStatusData, myProjectChartConfig } from "@/features/mi-dashboard/constants/project-status-chart"

type MyStatusDistributionProps = {
  taskCounts: MyTaskCounts
  projects: MyProjectItem[]
}

export default function MyStatusDistribution({ taskCounts, projects }: MyStatusDistributionProps) {
  const taskData = buildMyTaskStatusData(taskCounts)
  const projectData = buildMyProjectStatusData(projects)

  return (
    <Card>
      <CardHeader><CardTitle className="font-semibold">Tareas y proyectos por estado</CardTitle></CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {taskCounts.total > 0 ? (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground text-center">Tareas</span>
              <ChartContainer config={myTaskChartConfig} className="max-h-[250px] w-full">
                <BarChart
                  accessibilityLayer
                  data={taskData}
                  layout="vertical"
                >
                  <XAxis type="number" dataKey="value" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel nameKey="status" />}
                  />
                  <Bar dataKey="value" radius={5}>
                    {taskData.map((entry) => (
                      <Cell key={entry.status} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          ) : (
            <div className="flex aspect-square items-center justify-center">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ClipboardList />
                  </EmptyMedia>
                  <EmptyContent>
                    <EmptyTitle>Sin tareas asignadas</EmptyTitle>
                  </EmptyContent>
                </EmptyHeader>
              </Empty>
            </div>
          )}
          {projects.length > 0 ? (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground text-center">Proyectos</span>
              <ChartContainer config={myProjectChartConfig} className="max-h-[250px] w-full">
                <BarChart
                  accessibilityLayer
                  data={projectData}
                  layout="vertical"
                >
                  <XAxis type="number" dataKey="value" hide reversed />
                  <YAxis
                    dataKey="name"
                    type="category"
                    orientation="right"
                    width={100}
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel nameKey="status" />}
                  />
                  <Bar dataKey="value" radius={5}>
                    {projectData.map((entry) => (
                      <Cell key={entry.status} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          ) : (
            <div className="flex aspect-square items-center justify-center">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FolderOpen />
                  </EmptyMedia>
                  <EmptyContent>
                    <EmptyTitle>Sin proyectos asignados</EmptyTitle>
                  </EmptyContent>
                </EmptyHeader>
              </Empty>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
