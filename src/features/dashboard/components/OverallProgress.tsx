import { RadialBar, RadialBarChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type OverallProgressProps = {
  taskCounts: { total: number; completed: number; overdue: number; inProgress: number; underReview: number }
  projectCounts: { total: number; completed: number }
}

export default function OverallProgress({ taskCounts, projectCounts }: OverallProgressProps) {
  const indicators = [
    {
      label: "Progreso",
      value: taskCounts.total > 0 ? Math.round((taskCounts.completed / taskCounts.total) * 100) : 0,
      color: "hsl(195 85% 45%)",
    },
    {
      label: "A tiempo",
      value: taskCounts.total > 0 ? Math.round(((taskCounts.total - taskCounts.overdue) / taskCounts.total) * 100) : 0,
      color: "hsl(180 75% 42%)",
    },
    {
      label: "En ejecución",
      value: taskCounts.total > 0 ? Math.round(((taskCounts.inProgress + taskCounts.underReview) / taskCounts.total) * 100) : 0,
      color: "hsl(210 92% 55%)",
    },
    {
      label: "Completados",
      value: projectCounts.total > 0 ? Math.round((projectCounts.completed / projectCounts.total) * 100) : 0,
      color: "hsl(240 55% 62%)",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold">Progreso general</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {indicators.map(({ label, value, color }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <RadialBarChart
                width={120}
                height={120}
                data={[{ value, fill: color }]}
                startAngle={90}
                endAngle={90 + (value / 100) * 360}
                innerRadius={28}
                outerRadius={48}
              >
                <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "hsl(var(--muted))" }} />
                <text x={60} y={58} textAnchor="middle" className="fill-foreground text-lg font-bold">
                  {value}%
                </text>
                <text x={60} y={76} textAnchor="middle" className="fill-muted-foreground text-[10px]">
                  {label}
                </text>
              </RadialBarChart>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
