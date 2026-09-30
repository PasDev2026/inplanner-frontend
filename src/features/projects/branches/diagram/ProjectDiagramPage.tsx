import { Link, Navigate, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, GitBranch } from "lucide-react"
import PageSpinner from "@/components/ui/PageSpinner"
import { getProjectById } from "@/features/projects/actions/project.api"
import { PROJECT_DETAIL_KEY } from "@/features/projects/lib/project-keys"
import ProjectDiagramView from "./ProjectDiagramView"

export default function ProjectDiagramPage() {
  const params = useParams()
  const projectId = Number(params.projectId)

  const { data: project, isLoading, isError } = useQuery({
    queryKey: PROJECT_DETAIL_KEY(projectId),
    queryFn: async () => {
      const result = await getProjectById(projectId)
      if (!result) throw new Error("No data")
      return result
    },
    retry: false,
    enabled: !!projectId,
  })

  if (isLoading) return <PageSpinner />
  if (isError || !project) return <Navigate to="/404" />

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
          <GitBranch className="h-4 w-4" />
        </span>
        <h1 className="min-w-0 truncate text-lg font-bold text-foreground">
          {project.name_project}
        </h1>
      </div>

      <ProjectDiagramView project={project} />
    </div>
  )
}
