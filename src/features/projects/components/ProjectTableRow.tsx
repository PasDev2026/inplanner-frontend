import { useState, useRef, useMemo } from "react"
import { MoreVertical, ChevronDown } from "lucide-react"
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
import isManager from "@/features/shared/lib/policies"
import CircularProgress from "../../../components/ui/CircularProgress"
import DateCellPopover from "./DateCellPopover"
import TaskTableSection from "../../tasks/components/TaskTableSection"
import StatusPopover from "./StatusPopover"
import ResponsiblePopover from "../../shared/components/ResponsiblePopover"
import PriorityPopover from "../../shared/components/PriorityPopover"
import { useUpdateProject } from "../hooks/useUpdateProject"
import { useUpdateProjectResponsible } from "../hooks/useUpdateProjectResponsible"
import { TableRow, TableCell } from "@/components/ui/table"

type ProjectTableRowProps = {
    project: BackendProject
    user: { idUser: number }
    sedes: CentralizadoItem[]
    filterType: 'project' | 'task' | null
    filterStatus: string | null
    forceExpanded?: boolean
}

export default function ProjectTableRow({ project, user, sedes, filterType, filterStatus, forceExpanded }: ProjectTableRowProps) {
    const location = useLocation()
    const navigate = useNavigate()
    const updateProject = useUpdateProject()
    const updateProjectResponsibleHook = useUpdateProjectResponsible()
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState("")
    const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const sedeMap = useMemo(() => new Map(sedes.map(s => [s.id, s.nombre])), [sedes])
    const sedeName = project.sede_id != null ? sedeMap.get(Number(project.sede_id)) ?? "" : ""

    const handleNameClick = () => {
        if (clickTimer.current) {
            clearTimeout(clickTimer.current)
            clickTimer.current = null
            return
        }
        clickTimer.current = setTimeout(() => {
            clickTimer.current = null
            navigate(`/projects/${project.id_project}/details-projects`)
        }, 250)
    }

    const handleNameDoubleClick = () => {
        if (clickTimer.current) {
            clearTimeout(clickTimer.current)
            clickTimer.current = null
        }
        setEditValue(project.name_project)
        setIsEditing(true)
    }

    const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && editValue.trim()) {
            updateProject.mutate({
                projectId: project.id_project,
                name_project: editValue.trim(),
                description_project: project.description_project ?? "",
            })
            setIsEditing(false)
        }
        if (e.key === "Escape") {
            setIsEditing(false)
        }
    }

    const [expanded, setExpanded] = useState(forceExpanded ?? false)

    return (
        <>
            <TableRow className="hover:bg-brand-primary/5 transition-colors">
                <TableCell>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-200 transition-colors flex-shrink-0 cursor-pointer"
                    >
                        <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                        />
                    </button>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-3 min-w-0">
                        {isManager(project.manager_id, user.idUser) ? (
                            <Badge variant="brand-light">Manager</Badge>
                        ) : (
                            <Badge variant="brand">Colaborador</Badge>
                        )}
                        {isEditing ? (
                            <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={handleEditKeyDown}
                                onBlur={() => setIsEditing(false)}
                                autoFocus
                                className="flex-1 text-sm font-medium text-brand-dark border border-brand-primary rounded px-2 py-0.5 focus:outline-none min-w-0"
                            />
                        ) : (
                            <span
                                onClick={handleNameClick}
                                onDoubleClick={handleNameDoubleClick}
                                className="font-medium text-brand-dark truncate hover:underline text-sm cursor-pointer"
                            >
                                {project.name_project}
                            </span>
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
                    <CircularProgress percentage={0} size="sm" />
                </TableCell>
                <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <button className="block p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-200 transition-colors cursor-pointer">
                                    <span className="sr-only">opciones</span>
                                    <MoreVertical className="h-4 w-4" aria-hidden="true" />
                                </button>
                            }
                        />
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem onClick={() => navigate(`/projects/${project.id_project}/details-projects`)}>
                                Ver Proyecto
                            </DropdownMenuItem>
                            {isManager(project.manager_id, user.idUser) && (
                                <>
                                    <DropdownMenuItem onClick={() => navigate(`/projects/${project.id_project}/edit`)}>
                                        Editar Proyecto
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => navigate(location.pathname + `?deleteProject=${project.id_project}`)}
                                        className="text-red-500 focus:text-red-500"
                                    >
                                        Eliminar Proyecto
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>

            {(expanded || forceExpanded) && (
                <TableRow>
                    <TableCell colSpan={9} className="p-0 border-b border-border">
                        <TaskTableSection
                            projectId={String(project.id_project)}
                            canEdit={true}
                            projectStartDate={project.start_date}
                            projectDueDate={project.due_date}
                            filterType={filterType}
                            filterStatus={filterStatus}
                        />
                    </TableCell>
                </TableRow>
            )}
        </>
    )
}
