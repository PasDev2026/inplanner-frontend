import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown, GitBranch, Loader2 } from "lucide-react"
import CircularProgress from "@/components/ui/CircularProgress"
import EditableName from "@/features/projects/components/EditableName"
import EditProjectSheet from "@/features/projects/components/EditProjectSheet"
import { useUpdateProject } from "@/features/projects/hooks/useUpdateProject"
import { canAccessProjectActivities } from "@/features/shared/lib/policies"
import type { CentralizadoItem } from "@/features/shared/actions/centralizado.api"
import type { AuthUser } from "@/features/auth/actions/auth.api"
import type { BackendProject } from "@/features/shared/lib/types"
import { cn } from "@/features/shared/lib/utils"
import { buildBranchTree } from "@/features/projects/lib/project-branch"
import BranchTree from "./BranchTree"
import BranchSkeleton from "./branch/BranchSkeleton"
import ProjectControls from "./ProjectControls"
import ProjectAddBar from "./ProjectAddBar"
import { useProjectBranches } from "./hooks/useProjectBranches"

type ProjectBranchNodeProps = {
  project: BackendProject
  user: AuthUser
  sedes: CentralizadoItem[]
  defaultExpanded?: boolean
}

export default function ProjectBranchNode({
  project,
  user,
  sedes,
  defaultExpanded = false,
}: ProjectBranchNodeProps) {
  const navigate = useNavigate()
  const updateProject = useUpdateProject()
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [editOpen, setEditOpen] = useState(false)
  const { data: tasks, isLoading, isFetching } = useProjectBranches(project.id_project, expanded)

  const roots = useMemo(() => buildBranchTree(tasks ?? []), [tasks])
  const canAccessActivities = canAccessProjectActivities(project, user)

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="h-1.5 w-full bg-gradient-to-r from-brand-primary to-brand-dark" />

      <div className="flex items-start gap-3 p-3 sm:p-4">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-label={expanded ? "Contraer proyecto" : "Expandir proyecto"}
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary transition-colors hover:bg-brand-primary/20"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              expanded ? "rotate-180" : "-rotate-90",
            )}
          />
        </button>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <EditableName
                value={project.name_project}
                onNavigate={() => navigate(`/projects/${project.id_project}/details-projects`)}
                onRename={(name) =>
                  updateProject.mutate({
                    projectId: project.id_project,
                    name_project: name,
                    description_project: project.description_project ?? "",
                  })
                }
                className="text-sm font-semibold text-brand-dark sm:text-base"
              />
            </div>
            <button
              type="button"
              onClick={() => navigate(`/projects/${project.id_project}/branches`)}
              title="Ver diagrama de ramas"
              className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-brand-primary/10 hover:text-brand-primary"
            >
              <span className="sr-only">Ver diagrama de ramas</span>
              <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            {expanded && !isLoading && (
              <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                {isFetching && tasks ? (
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                ) : null}
                {roots.length} {roots.length === 1 ? "rama" : "ramas"}
              </span>
            )}
          </div>

          <ProjectControls
            project={project}
            user={user}
            sedes={sedes}
            onEdit={() => setEditOpen(true)}
          />
        </div>

        <CircularProgress percentage={project.progress} size="md" />
      </div>

      {expanded && (
        <div className="space-y-3 border-t border-border bg-muted/20 p-3 sm:p-4">
          <ProjectAddBar
            projectId={project.id_project}
            projectName={project.name_project}
            canExport={canAccessActivities}
            canImport={canAccessActivities}
          />
          {isLoading ? (
            <BranchSkeleton />
          ) : (
            <BranchTree
              roots={roots}
              projectId={project.id_project}
              projectStartDate={project.start_date}
              projectDueDate={project.due_date}
              canImport={canAccessActivities}
              emptyLabel="Este proyecto aún no tiene tareas"
            />
          )}
        </div>
      )}

      <EditProjectSheet open={editOpen} onOpenChange={setEditOpen} project={project} />
    </div>
  )
}
