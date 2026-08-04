import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { FolderOpen } from "lucide-react"
import { PROJECT_STATUS_MAP } from "@/features/shared/constants/project-status.constant"
import type { MyProjectItem, MyProjectProgressItem } from "@/features/mi-dashboard/actions/mi-dashboard.api"

type MyProjectsListProps = {
  projects: MyProjectItem[]
  progress: MyProjectProgressItem[]
}

export default function MyProjectsList({ projects, progress }: MyProjectsListProps) {
  const progressByProject = new Map(progress.map((p) => [p.id_project, p]))

  return (
    <Card>
      <CardHeader><CardTitle className="font-semibold">Mis proyectos</CardTitle></CardHeader>
      <CardContent>
        {projects.length === 0 ? (
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
        ) : (
          <ul className="space-y-4">
            {projects.map((project) => {
              const statusInfo = PROJECT_STATUS_MAP[project.status]
              const date = project.due_date
                ? new Date(project.due_date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
                : "-"
              const p = progressByProject.get(project.id_project)
              const total = p?.total ?? 0
              const completed = p?.completed ?? 0
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0

              return (
                <li key={project.id_project} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">{project.name_project}</span>
                      <span className="text-xs text-muted-foreground">{date}</span>
                    </div>
                    <Badge className={statusInfo?.style}>{statusInfo?.label ?? project.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                      {total > 0 ? `${completed}/${total} · ${pct}%` : "Sin tareas"}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
