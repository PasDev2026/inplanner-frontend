import { Pie, PieChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const projectConfig = {
  planning: { label: "Planificación", color: "var(--chart-1)" },
  active: { label: "Activos", color: "var(--chart-2)" },
  onHold: { label: "En espera", color: "var(--chart-3)" },
  completed: { label: "Completados", color: "var(--chart-4)" },
  cancelled: { label: "Cancelados", color: "var(--chart-5)" },
} satisfies ChartConfig

const taskConfig = {
  pending: { label: "Pendientes", color: "var(--chart-1)" },
  inProgress: { label: "En progreso", color: "var(--chart-2)" },
  underReview: { label: "En revisión", color: "var(--chart-3)" },
  completed: { label: "Completadas", color: "var(--chart-4)" },
  overdue: { label: "Vencidas", color: "var(--chart-5)" },
} satisfies ChartConfig

type ProjectDistributionProps = {
  projectCounts: { total: number; planning: number; active: number; onHold: number; completed: number; cancelled: number }
  taskCounts: { total: number; pending: number; inProgress: number; underReview: number; completed: number; overdue: number }
}

export default function ProjectDistribution({ projectCounts, taskCounts }: ProjectDistributionProps) {
  const projectData = [
    { name: "Planificación", value: projectCounts.planning, fill: "var(--color-planning)" },
    { name: "Activos", value: projectCounts.active, fill: "var(--color-active)" },
    { name: "En espera", value: projectCounts.onHold, fill: "var(--color-onHold)" },
    { name: "Completados", value: projectCounts.completed, fill: "var(--color-completed)" },
    { name: "Cancelados", value: projectCounts.cancelled, fill: "var(--color-cancelled)" },
  ]

  const taskData = [
    { name: "Pendientes", value: taskCounts.pending, fill: "var(--color-pending)" },
    { name: "En progreso", value: taskCounts.inProgress, fill: "var(--color-inProgress)" },
    { name: "En revisión", value: taskCounts.underReview, fill: "var(--color-underReview)" },
    { name: "Completadas", value: taskCounts.completed, fill: "var(--color-completed)" },
    { name: "Vencidas", value: taskCounts.overdue, fill: "var(--color-overdue)" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold">Proyectos y tareas por estado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <ChartContainer config={projectConfig} className="aspect-square">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-sm font-semibold">
                Proyectos
              </text>
              <Pie data={projectData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2} />
            </PieChart>
          </ChartContainer>
          <ChartContainer config={taskConfig} className="aspect-square">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-sm font-semibold">
                Tareas
              </text>
              <Pie data={taskData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2} />
            </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
