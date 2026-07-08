import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getTaskChildren, createTask } from "@/features/tasks/actions/task.api"
import type { BackendTask } from "@/features/shared/lib/types"
import { TASK_CHILDREN_KEY } from "@/features/tasks/lib/task-keys"
import { PROJECT_TASKS_KEY } from "@/features/projects/lib/project-keys"
import { useTaskMutations } from "../hooks/useTaskMutations"
import TaskStatusPopover from "./TaskStatusPopover"
import ResponsiblePopover from "@/features/shared/components/ResponsiblePopover"
import PriorityPopover from "@/features/shared/components/PriorityPopover"
import TaskDateCellPopover from "./TaskDateCellPopover"
import { ChevronRight, ChevronDown, Plus, Check, X, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table"
import { COL_GROUP } from "@/features/shared/lib/tableColumns"
import PageSpinner from "@/components/ui/PageSpinner"

type SubtaskRowProps = {
    subtask: BackendTask
    projectId: string
    canEdit: boolean
    depth: number
    projectStartDate?: string | null
    projectDueDate?: string | null
    filterType?: 'project' | 'task' | null
    filterStatus?: string | null
}

export default function SubtaskRow({
    subtask,
    projectId,
    canEdit,
    depth,
    projectStartDate,
    projectDueDate,
    filterType,
    filterStatus,
}: SubtaskRowProps) {
    const [expanded, setExpanded] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [newTaskName, setNewTaskName] = useState("")
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState("")
    const queryClient = useQueryClient()
    const projectIdNum = Number(projectId)

    const { data: children = [], isLoading } = useQuery({
        queryKey: TASK_CHILDREN_KEY(subtask.id_task),
        queryFn: () => getTaskChildren(subtask.id_task),
        enabled: expanded,
        staleTime: 30000,
    })

    const visibleChildren = filterType === 'task' && filterStatus
        ? children.filter((c: BackendTask) => String(c.status) === filterStatus)
        : children

    const createSubtask = useMutation({
        mutationFn: (name: string) =>
            createTask({ task_name: name, project_id: projectIdNum, parent_task_id: subtask.id_task }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TASK_CHILDREN_KEY(subtask.id_task) })
            queryClient.invalidateQueries({ queryKey: PROJECT_TASKS_KEY(projectIdNum) })
            setNewTaskName("")
            setShowForm(false)
        },
        onError: (error) => {
            toast.error((error as Error).message)
        },
    })

    const { statusMutation, priorityMutation, renameMutation, assignmentMutation, deleteTaskMutation } = useTaskMutations(projectIdNum)

    const handleDelete = () => {
        toast("¿Eliminar subtarea?", {
            description: "Esta acción eliminará la subtarea y todas sus subtareas hijas",
            action: {
                label: "Eliminar",
                onClick: () => deleteTaskMutation.mutate(subtask.id_task),
            },
        })
    }

    const handleNameDoubleClick = () => {
        setEditValue(subtask.task_name)
        setIsEditing(true)
    }

    const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && editValue.trim()) {
            renameMutation.mutate({
                taskId: subtask.id_task,
                task_name: editValue.trim(),
                task_description: subtask.task_description ?? "",
            })
            setIsEditing(false)
            setEditValue("")
        }
        if (e.key === "Escape") {
            setIsEditing(false)
            setEditValue("")
        }
    }

    const rowPad = `${depth * 24}px`
    const childPad = `${(depth + 1) * 24}px`

    return (
        <>
            <TableRow className="hover:bg-muted transition-colors group">
                <TableCell colSpan={2}>
                    <div className="flex items-center gap-2" style={{ paddingLeft: rowPad }}>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
                            className={`p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-all flex-shrink-0 ${(subtask.subtasks_count ?? 0) > 0 || expanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        >
                            {expanded ? (
                                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                        </button>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={handleEditKeyDown}
                                onBlur={() => {
                                    setIsEditing(false)
                                    setEditValue("")
                                }}
                                autoFocus
                                className="flex-1 text-sm text-foreground bg-[var(--input-bg)] border border-brand-primary rounded px-2 py-0.5 focus:outline-none min-w-0"
                            />
                        ) : (
                            <span
                                onDoubleClick={handleNameDoubleClick}
                                className="text-sm text-foreground truncate"
                            >
                                {subtask.task_name}
                            </span>
                        )}
                    </div>
                </TableCell>
                <TableCell />
                <TableCell>
                    <TaskStatusPopover
                        status={subtask.status}
                        onSelect={(s) => statusMutation.mutate(
                            { taskId: subtask.id_task, status: s },
                            { onSuccess: () => {
                                if (subtask.parent_task_id) {
                                    queryClient.invalidateQueries({ queryKey: TASK_CHILDREN_KEY(subtask.parent_task_id) })
                                }
                            }}
                        )}
                        isPending={statusMutation.isPending}
                    />
                </TableCell>
                <TableCell>
                    <ResponsiblePopover
                        projectId={projectIdNum}
                        assignedTo={subtask.assignments?.map((a) => ({ user_id: a.user_id })) ?? []}
                                onAssign={(userIds) => {
                                    const currentIds = subtask.assignments?.map((a) => a.user_id) ?? []
                                    assignmentMutation.mutate({ taskId: subtask.id_task, userIds, currentIds })
                                }}
                        isPending={assignmentMutation.isPending}
                    />
                </TableCell>
                <TableCell>
                    <PriorityPopover
                        priority={subtask.priority}
                        onSelect={(p) => priorityMutation.mutate({ taskId: subtask.id_task, priority: p })}
                        isPending={priorityMutation.isPending}
                    />
                </TableCell>
                <TableCell>
                    <TaskDateCellPopover
                        projectId={projectId}
                        taskId={subtask.id_task}
                        startDate={subtask.start_date}
                        dueDate={subtask.due_date}
                        projectStartDate={projectStartDate}
                        projectDueDate={projectDueDate}
                    />
                </TableCell>
                <TableCell />
                <TableCell>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleDelete()
                        }}
                        className="p-1 text-destructive hover:text-destructive/80 rounded hover:bg-destructive/10 transition-colors"
                        title="Eliminar subtarea"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </TableCell>
            </TableRow>

            {expanded && (
                <TableRow>
                    <TableCell colSpan={9} className="p-0">
                        <Table className="table-fixed">
                          <colgroup>
                            {COL_GROUP.map((c, i) => (
                              <col key={i} style={{ width: c.width }} />
                            ))}
                          </colgroup>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="py-6">
                                            <div className="flex justify-center">
                                                <PageSpinner fullPage={false} centered={false} size={12} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <>
                                {visibleChildren.map((child: BackendTask) => (
                                    <SubtaskRow
                                        key={child.id_task}
                                        subtask={child}
                                        projectId={projectId}
                                        canEdit={canEdit}
                                        depth={depth + 1}
                                        projectStartDate={projectStartDate}
                                        projectDueDate={projectDueDate}
                                        filterType={filterType}
                                        filterStatus={filterStatus}
                                    />
                                ))}

                                {canEdit && !showForm && (
                                    <TableRow>
                                        <TableCell colSpan={9} className="px-4 py-2" style={{ paddingLeft: childPad }}>
                                            <button
                                                onClick={() => setShowForm(true)}
                                                className="flex items-center gap-1 text-xs text-brand-primary hover:text-brand-dark transition-colors"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Añadir subtarea
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {canEdit && showForm && (
                                    <TableRow>
                                        <TableCell colSpan={9} className="px-4 py-2" style={{ paddingLeft: childPad }}>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={newTaskName}
                                                    onChange={(e) => setNewTaskName(e.target.value)}
                                                    placeholder="Nombre de la subtarea"
                                                    className="flex-1 text-xs border border-border rounded px-2 py-1.5 focus:outline-none focus:border-brand-primary"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" && newTaskName.trim()) {
                                                            createSubtask.mutate(newTaskName.trim())
                                                        }
                                                        if (e.key === "Escape") {
                                                            setShowForm(false)
                                                            setNewTaskName("")
                                                        }
                                                    }}
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (newTaskName.trim()) createSubtask.mutate(newTaskName.trim())
                                                    }}
                                                    disabled={!newTaskName.trim() || createSubtask.isPending}
                                                    className="p-1 text-brand-primary hover:text-brand-dark disabled:text-muted-foreground"
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowForm(false)
                                                        setNewTaskName("")
                                                    }}
                                                    className="p-1 text-muted-foreground hover:text-foreground"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                                    </>
                                )}
                            </TableBody>
                        </Table>
                    </TableCell>
                </TableRow>
            )}
        </>
    )
}
