import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PROJECT_STATUS_MAP } from "@/features/shared/constants/project-status.constant"
import type { BackendProject } from "@/features/shared/lib/types"

type RecentProjectsProps = {
  projects: BackendProject[]
}

export default function RecentProjects({ projects }: RecentProjectsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold">Últimos proyectos</CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Sin proyectos recientes</p>
        ) : (
          <ul className="space-y-3">
            {projects.map((project) => {
              const statusInfo = PROJECT_STATUS_MAP[project.status]
              const date = project.created_at
                ? new Date(project.created_at).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "-"
              return (
                <li key={project.id_project} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{project.name_project}</span>
                    <span className="text-xs text-muted-foreground">{date}</span>
                  </div>
                  <Badge className={statusInfo?.style}>{statusInfo?.label ?? project.status}</Badge>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
