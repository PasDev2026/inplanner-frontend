import { useState } from "react"
import { Pie, PieChart, Sector } from "recharts"
import type { PieSectorShapeProps } from "recharts/types/polar/Pie"
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

function useActiveSector() {
  const [activeIndex, setActiveIndex] = useState(-1)
  const renderShape = ({ index, outerRadius = 0, ...props }: PieSectorShapeProps) => {
    if (index === activeIndex) {
      return (
        <g>
          <Sector {...props} outerRadius={outerRadius + 6} />
          <Sector {...props} outerRadius={outerRadius + 14} innerRadius={outerRadius + 6} />
        </g>
      )
    }
    return <Sector {...props} outerRadius={outerRadius} />
  }
  return { activeIndex, setActiveIndex, renderShape }
}

export default function MyStatusDistribution({ taskCounts, projects }: MyStatusDistributionProps) {
  const task = useActiveSector()
  const proj = useActiveSector()

  return (
    <Card>
      <CardHeader><CardTitle className="font-semibold">Tareas y proyectos por estado</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {taskCounts.total > 0 ? (
            <ChartContainer config={myTaskChartConfig} className="aspect-square">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-sm font-semibold">
                  Tareas
                </text>
                <Pie
                  data={buildMyTaskStatusData(taskCounts)}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  strokeWidth={3}
                  shape={task.renderShape}
                  onMouseEnter={(_, index) => task.setActiveIndex(index)}
                  onMouseLeave={() => task.setActiveIndex(-1)}
                />
              </PieChart>
            </ChartContainer>
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
            <ChartContainer config={myProjectChartConfig} className="aspect-square">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-sm font-semibold">
                  Proyectos
                </text>
                <Pie
                  data={buildMyProjectStatusData(projects)}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  strokeWidth={3}
                  shape={proj.renderShape}
                  onMouseEnter={(_, index) => proj.setActiveIndex(index)}
                  onMouseLeave={() => proj.setActiveIndex(-1)}
                />
              </PieChart>
            </ChartContainer>
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
