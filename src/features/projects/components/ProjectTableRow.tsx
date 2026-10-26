import { useState, useMemo } from "react"
import { MoreVertical, ChevronDown, GitBranch } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

import { useLocation, useNavigate } from "react-router-dom"
import { BackendProject } from "@/features/shared/lib/types"
import type { CentralizadoItem } from "@/features/shared/actions/centralizado.api"
import type { AuthUser } from "@/features/auth/actions/auth.api"
import isManager, { canAccessProjectActivities } from "@/features/shared/lib/policies"
import CircularProgress from "@/components/ui/CircularProgress"
import DateCellPopover from "./DateCellPopover"
import EditableName from "./EditableName"
import TaskTableSection from "@/features/tasks/components/TaskTableSection"
import StatusPopover from "./StatusPopover"
import ResponsiblePopover from "@/features/shared/components/ResponsiblePopover"
import PriorityPopover from "@/features/shared/components/PriorityPopover"
import EditProjectSheet from "./EditProjectSheet"
import ExportProjectTasksMenuItem from "./ExportProjectTasksMenuItem"
import { useUpdateProject } from "../hooks/useUpdateProject"
import { useUpdateProjectResponsible } from "../hooks/useUpdateProjectResponsible"
import { useExpandState } from "@/features/shared/providers/ExpandStateProvider"
import { TableRow, TableCell } from "@/components/ui/table"

type ProjectTableRowProps = {
    project: BackendProject
    user: AuthUser
    sedes: CentralizadoItem[]
    taskStatusSelected: string[]
}

export default function ProjectTableRow({ project, user, sedes, taskStatusSelected }: ProjectTableRowProps) {
    const location = useLocation()
    const navigate = useNavigate()
    const updateProject = useUpdateProject()
    const updateProjectResponsibleHook = useUpdateProjectResponsible()
    const { expandedProjects, toggleProject } = useExpandState()
    const expanded = expandedProjects.has(project.id_project)
    const [editOpen, setEditOpen] = useState(false)
    const isManagerUser = isManager(project.manager_id, user.id)
    const canAccessActivities = canAccessProjectActivities(project, user)

    const sedeMap = useMemo(() => new Map(sedes.map(s => [s.id, s.nombre])), [sedes])
    const sedeName = project.sede_id != null ? sedeMap.get(project.sede_id) ?? "" : ""

    return (
        <>
            <TableRow className="hover:bg-brand-primary/5 transition-colors">
                <TableCell>
                    <button
                        onClick={() => toggleProject(project.id_project)}
                        className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors flex-shrink-0 cursor-pointer"
                    >
                        <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                        />
                    </button>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-3 min-w-0">
                        <EditableName
                            value={project.name_project}
                            onNavigate={() => navigate(`/projects/${project.id_project}/details-projects`)}
                            onRename={(name) => updateProject.mutate({
                                projectId: project.id_project,
                                name_project: name,
                                description_project: project.description_project ?? "",
                            })}
                            className="text-sm font-medium text-brand-dark"
                        />
                        <button
                            type="button"
                            onClick={() => navigate(`/projects/${project.id_project}/branches`)}
                            title="Ver diagrama de ramas"
                            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-brand-primary/10 hover:text-brand-primary"
                        >
                            <span className="sr-only">Ver diagrama de ramas</span>
                            <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        {isManagerUser ? (
                            <Badge variant="brand-light">Manager</Badge>
                        ) : (
                            <Badge variant="brand">Colaborador</Badge>
                        )}
                    </div>
                </TableCell>
                <TableCell>
                    <Badge variant="slate">{sedeName}</Badge>
                </TableCell>
                <TableCell>
                    <StatusPopover
                        status={project.status}
                        onSelect={(s) => s != null && updateProject.mutate({ projectId: project.id_project, status: s })}
                        isPending={updateProject.isPending}
                    />
                </TableCell>
                <TableCell>
                    <ResponsiblePopover
                        projectId={project.id_project}
                        assignedTo={project.responsibles ?? []}
                        onAssign={(userIds) => updateProjectResponsibleHook.mutate({ projectId: project.id_project, userIds })}
                        isPending={updateProjectResponsibleHook.isPending}
                    />
                </TableCell>
                <TableCell>
                    <PriorityPopover
                        priority={project.priority}
                        onSelect={(p) => p != null && updateProject.mutate({ projectId: project.id_project, priority: p })}
                    />
                </TableCell>
                <TableCell>
                    <DateCellPopover
                        projectId={project.id_project}
                        startDate={project.start_date}
                        dueDate={project.due_date}
                    />
                </TableCell>
                <TableCell>
                    <CircularProgress percentage={project.progress} size="sm" />
                </TableCell>
                <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <button className="block p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors cursor-pointer">
                                    <span className="sr-only">opciones</span>
                                    <MoreVertical className="h-4 w-4" aria-hidden="true" />
                                </button>
                            }
                        />
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem onClick={() => navigate(`/projects/${project.id_project}/details-projects`)}>
                                Ver Proyecto
                            </DropdownMenuItem>
                            {canAccessActivities && (
                                <ExportProjectTasksMenuItem
                                    projectId={project.id_project}
                                    projectName={project.name_project}
                                />
                            )}
                            {isManagerUser && (
                                <>
                                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                                        Editar Proyecto
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => navigate(location.pathname + `?deleteProject=${project.id_project}`)}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        Eliminar Proyecto
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>

            {expanded && (
                <TableRow>
                    <TableCell colSpan={9} className="p-0 border-b border-border">
                        <TaskTableSection
                            projectId={String(project.id_project)}
                            canEdit={true}
                            canExport={canAccessActivities}
                            canImport={canAccessActivities}
                            projectName={project.name_project}
                            projectStartDate={project.start_date}
                            projectDueDate={project.due_date}
                            taskStatusSelected={taskStatusSelected}
                        />
                    </TableCell>
                </TableRow>
            )}

            <EditProjectSheet open={editOpen} onOpenChange={setEditOpen} project={project} />
        </>
    )
}
