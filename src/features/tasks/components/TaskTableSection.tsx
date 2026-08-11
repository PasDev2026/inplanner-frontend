import React, { useState, useRef, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DndContext, DragOverlay } from "@dnd-kit/core"
import { DASHBOARD_TASKS_KEY, TASK_CHILDREN_KEY } from "@/features/tasks/lib/task-keys"
import { PROJECTS_KEY, PROJECT_TASKS_KEY } from "@/features/projects/lib/project-keys"
import { getProjectTasks } from "@/features/projects/actions/project.api"
import { createTask, reorderTask } from "@/features/tasks/actions/task.api"
import type { BackendTask } from "@/features/shared/lib/types"
import { useTaskMutations } from "../hooks/useTaskMutations"
import { useTaskTableDnD } from "../hooks/useTaskTableDnD"
import { applyMoveInCache, type TaskDrop } from "@/features/tasks/lib/task-tree-dnd"
import { TaskRowDnd, TaskDragHandle } from "./TaskRowDnd"
import TaskTableSubtasks from "./TaskTableSubtasks"
import TaskStatusPopover from "./TaskStatusPopover"
import ResponsiblePopover from "@/features/shared/components/ResponsiblePopover"
import PriorityPopover from "@/features/shared/components/PriorityPopover"
import TaskDateCellPopover from "./TaskDateCellPopover"
import { ChevronDown, ChevronRight, Plus, Check, X, Trash2 } from "lucide-react"
import { toast } from "sonner"
import PageSpinner from "@/components/ui/PageSpinner"
import { useExpandState } from "@/features/shared/providers/ExpandStateProvider"
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table"
import { COL_GROUP } from "@/features/shared/lib/tableColumns"

type TaskTableSectionProps = {
    projectId: string
    canEdit: boolean
    depth?: number
    projectStartDate?: string | null
    projectDueDate?: string | null
    filterType?: 'project' | 'task' | null
    filterStatus?: string | null
}

export default function TaskTableSection({
    projectId,
    canEdit,
    depth = 1,
    projectStartDate,
    projectDueDate,
    filterType,
    filterStatus,
}: TaskTableSectionProps) {
    const { expandedTasks, toggleTask } = useExpandState()
    const [showForm, setShowForm] = useState(false)
    const [newTaskName, setNewTaskName] = useState("")
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
    const [editValue, setEditValue] = useState("")
    const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const projectIdNum = Number(projectId)

    const { data, isLoading, isError } = useQuery({
        queryKey: DASHBOARD_TASKS_KEY(projectIdNum),
        queryFn: async () => {
            const result = await getProjectTasks(projectIdNum)
            if (!result) throw new Error("No data")
            return result as { data: BackendTask[] }
        },
        retry: false,
    })

    const tasks: BackendTask[] = (data as { data: BackendTask[] } | undefined)?.data ?? []

    const { statusMutation, priorityMutation, renameMutation, assignmentMutation, deleteTaskMutation } = useTaskMutations(projectIdNum)

    const invalidateTaskQueries = (oldParentId: number | null, newParentId: number | null) => {
        queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
        queryClient.invalidateQueries({ queryKey: PROJECT_TASKS_KEY(projectIdNum) })
        queryClient.invalidateQueries({ queryKey: DASHBOARD_TASKS_KEY(projectIdNum) })
        const parents = [...new Set([oldParentId, newParentId])].filter((p): p is number => p != null)
        for (const pid of parents) {
            queryClient.invalidateQueries({ queryKey: TASK_CHILDREN_KEY(pid) })
        }
    }

    const reorderMutation = useMutation({
        mutationFn: async (drop: TaskDrop) => {
            const ok = await reorderTask({ taskId: drop.taskId, parentTaskId: drop.parentId, position: drop.index })
            if (!ok) throw new Error("Error al reordenar tarea")
        },
        onSuccess: (_data, drop) => invalidateTaskQueries(drop.oldParentId, drop.parentId),
        onError: (error, drop) => {
            toast.error((error as Error).message)
            invalidateTaskQueries(drop.oldParentId, drop.parentId)
        },
    })

    const handleDrop = useCallback((drop: TaskDrop) => {
        applyMoveInCache(queryClient, projectIdNum, drop)
        reorderMutation.mutate(drop)
    }, [queryClient, projectIdNum, reorderMutation])

    const dnd = useTaskTableDnD(handleDrop)

    const createRootTask = useMutation({
        mutationFn: (name: string) =>
            createTask({ task_name: name, project_id: projectIdNum }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
            queryClient.invalidateQueries({ queryKey: PROJECT_TASKS_KEY(projectIdNum) })
            queryClient.invalidateQueries({ queryKey: DASHBOARD_TASKS_KEY(projectIdNum) })
            setNewTaskName("")
            setShowForm(false)
        },
        onError: (error) => {
            toast.error((error as Error).message)
        },
    })

    const toggleExpand = (taskId: number) => {
        toggleTask(taskId)
    }

    const handleTaskNameClick = (taskId: number) => {
        if (clickTimer.current) {
            clearTimeout(clickTimer.current)
            clickTimer.current = null
            return
        }
        clickTimer.current = setTimeout(() => {
            clickTimer.current = null
            navigate(`/projects/${projectId}/details-projects?viewTask=${taskId}`)
        }, 250)
    }

    const handleTaskNameDoubleClick = (taskId: number, taskName: string) => {
        if (clickTimer.current) {
            clearTimeout(clickTimer.current)
            clickTimer.current = null
        }
        setEditValue(taskName)
        setEditingTaskId(taskId)
    }

    const handleTaskNameEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, taskId: number, description: string) => {
        if (e.key === "Enter" && editValue.trim()) {
            renameMutation.mutate({ taskId, task_name: editValue.trim(), task_description: description })
            setEditingTaskId(null)
            setEditValue("")
        }
        if (e.key === "Escape") {
            setEditingTaskId(null)
            setEditValue("")
        }
    }

    const handleDelete = (taskId: number) => {
        toast("¿Eliminar tarea?", {
            description: "Esta acción eliminará la tarea y todas sus subtareas",
            action: {
                label: "Eliminar",
                onClick: () => deleteTaskMutation.mutate(taskId),
            },
        })
    }

    if (isLoading) {
        return (
            <div className="px-4 py-10 flex items-center justify-center">
                <PageSpinner fullPage={false} centered={false} size={10} />
            </div>
        )
    }

    if (isError || !data) {
        return (
            <div className="px-4 py-3">
                <p className="text-xs text-muted-foreground">Error al cargar las tareas</p>
            </div>
        )
    }

    const rootTasks = tasks.filter((t) => t.parent_task_id === null)
    const displayLimit = 50
    const visibleTasks = rootTasks.slice(0, displayLimit)
    const displayedTasks = filterType === 'task' && filterStatus
        ? visibleTasks.filter((t) => String(t.status) === filterStatus)
        : visibleTasks
    const matchingRootCount = filterType === 'task' && filterStatus
        ? rootTasks.filter((t) => String(t.status) === filterStatus).length
        : rootTasks.length

    if (rootTasks.length === 0) {
        return (
            <div className="border-t border-border">
                {canEdit && (
                    <div className="px-4 py-3">
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-1 text-xs text-brand-primary hover:text-brand-dark transition-colors"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Añadir tarea
                        </button>
                    </div>
                )}
                {canEdit && showForm && (
                    <div className="flex items-center gap-2 px-4 py-2 border-t border-border">
                        <input
                            type="text"
                            value={newTaskName}
                            onChange={(e) => setNewTaskName(e.target.value)}
                            placeholder="Nombre de la tarea"
                            className="flex-1 text-xs border border-border rounded px-2 py-1.5 focus:outline-none focus:border-brand-primary"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && newTaskName.trim()) {
                                    createRootTask.mutate(newTaskName.trim())
                                }
                                if (e.key === "Escape") {
                                    setShowForm(false)
                                    setNewTaskName("")
                                }
                            }}
                        />
                        <button
                            onClick={() => {
                                if (newTaskName.trim()) createRootTask.mutate(newTaskName.trim())
                            }}
                            disabled={!newTaskName.trim() || createRootTask.isPending}
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
                )}
            </div>
        )
    }

    return (
        <div className="border-t border-border">
            <div className="relative" ref={dnd.containerRef}>
                <DndContext
                    sensors={dnd.sensors}
                    collisionDetection={dnd.collisionDetection}
                    onDragStart={dnd.onDragStart}
                    onDragMove={dnd.onDragMove}
                    onDragEnd={dnd.onDragEnd}
                    onDragCancel={dnd.onDragCancel}
                >
                    <Table className="table-fixed">
                        <colgroup>
                            {COL_GROUP.map((c, i) => (
                                <col key={i} style={{ width: c.width }} />
                            ))}
                        </colgroup>
                        <TableBody>
                            {displayedTasks.map((task) => {
                                const siblingIndex = rootTasks.findIndex((t) => t.id_task === task.id_task)
                                return (
                                    <TaskRowDnd
                                        key={task.id_task}
                                        task={task}
                                        depth={depth}
                                        siblingIndex={siblingIndex}
                                        ancestors={[]}
                                        canEdit={canEdit}
                                        className="hover:bg-muted transition-colors group"
                                        expandedContent={
                                            expandedTasks.has(task.id_task) ? (
                                                <TableRow>
                                                    <TableCell colSpan={9} className="p-0">
                                                        <TaskTableSubtasks
                                                            taskId={task.id_task}
                                                            taskSiblingIndex={siblingIndex}
                                                            ancestors={[]}
                                                            projectId={projectId}
                                                            canEdit={canEdit}
                                                            depth={depth + 1}
                                                            projectStartDate={projectStartDate}
                                                            projectDueDate={projectDueDate}
                                                            filterType={filterType}
                                                            filterStatus={filterStatus}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ) : null
                                        }
                                    >
                                        {(dndRow) => (
                                            <>
                                                <TableCell colSpan={2}>
                                                    <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 24}px` }}>
                                                        {canEdit && <TaskDragHandle {...dndRow} />}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                toggleExpand(task.id_task)
                                                            }}
                                                            className={`p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-all flex-shrink-0 ${(task.subtasks_count ?? 0) > 0 || expandedTasks.has(task.id_task) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                                        >
                                                            {expandedTasks.has(task.id_task) ? (
                                                                <ChevronDown className="h-3.5 w-3.5" />
                                                            ) : (
                                                                <ChevronRight className="h-3.5 w-3.5" />
                                                            )}
                                                        </button>
                                                        {editingTaskId === task.id_task ? (
                                                            <input
                                                                type="text"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                onKeyDown={(e) => handleTaskNameEditKeyDown(e, task.id_task, task.task_description ?? "")}
                                                                onBlur={() => {
                                                                    setEditingTaskId(null)
                                                                    setEditValue("")
                                                                }}
                                                                autoFocus
                                                                className="flex-1 text-sm font-medium text-foreground bg-[var(--input-bg)] border border-brand-primary rounded px-2 py-0.5 focus:outline-none min-w-0"
                                                            />
                                                        ) : (
                                                            <span
                                                                onClick={() => handleTaskNameClick(task.id_task)}
                                                                onDoubleClick={() => handleTaskNameDoubleClick(task.id_task, task.task_name)}
                                                                className="text-sm font-medium text-foreground truncate hover:text-brand-primary hover:underline cursor-pointer"
                                                            >
                                                                {task.task_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell />
                                                <TableCell>
                                                    <TaskStatusPopover
                                                        status={task.status}
                                                        onSelect={(s) => statusMutation.mutate(
                                                            { taskId: task.id_task, status: s },
                                                            { onSuccess: () => {
                                                                queryClient.invalidateQueries({ queryKey: TASK_CHILDREN_KEY(task.id_task) })
                                                            }}
                                                        )}
                                                        isPending={statusMutation.isPending}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <ResponsiblePopover
                                                        projectId={projectIdNum}
                                                        assignedTo={task.assignments?.map((a) => ({ user_id: a.user_id })) ?? []}
                                                        onAssign={(userIds) => {
                                                            const currentIds = task.assignments?.map((a) => a.user_id) ?? []
                                                            assignmentMutation.mutate({ taskId: task.id_task, userIds, currentIds })
                                                        }}
                                                        isPending={assignmentMutation.isPending}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <PriorityPopover
                                                        priority={task.priority}
                                                        onSelect={(p) => priorityMutation.mutate({ taskId: task.id_task, priority: p })}
                                                        isPending={priorityMutation.isPending}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TaskDateCellPopover
                                                        projectId={projectId}
                                                        taskId={task.id_task}
                                                        startDate={task.start_date}
                                                        dueDate={task.due_date}
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
                                                            handleDelete(task.id_task)
                                                        }}
                                                        className="p-1 text-destructive hover:text-destructive/80 rounded hover:bg-destructive/10 transition-colors"
                                                        title="Eliminar tarea"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </TableCell>
                                            </>
                                        )}
                                    </TaskRowDnd>
                                )
                            })}
                        </TableBody>
                    </Table>

                    {dnd.indicator && (
                        <div
                            className="pointer-events-none absolute z-50 h-0.5 rounded-full bg-brand-primary"
                            style={{ top: dnd.indicator.top, left: dnd.indicator.left, width: dnd.indicator.width }}
                        />
                    )}

                    <DragOverlay>
                        {dnd.activeTask && (
                            <div className="bg-card border border-border rounded-lg shadow-xl px-4 py-2 max-w-md">
                                <p className="text-sm font-medium text-foreground truncate">{dnd.activeTask.task_name}</p>
                            </div>
                        )}
                    </DragOverlay>
                </DndContext>
            </div>

            {(matchingRootCount > displayLimit || displayedTasks.length < matchingRootCount) && (
                <div className="px-4 py-3 text-center border-t border-border">
                    <Link
                        to={`/projects/${projectId}/details-projects`}
                        className="text-xs text-brand-primary hover:text-brand-dark hover:underline"
                    >
                        Mostrando {displayedTasks.length} de {matchingRootCount} tareas. Ver todas &rarr;
                    </Link>
                </div>
            )}

            {canEdit && !showForm && (
                <div className="border-t border-border">
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-1 px-4 py-2 text-xs text-brand-primary hover:text-brand-dark transition-colors"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Añadir tarea
                    </button>
                </div>
            )}

            {canEdit && showForm && (
                <div className="flex items-center gap-2 px-4 py-2 border-t border-border">
                    <input
                        type="text"
                        value={newTaskName}
                        onChange={(e) => setNewTaskName(e.target.value)}
                        placeholder="Nombre de la tarea"
                        className="flex-1 text-xs border border-border rounded px-2 py-1.5 focus:outline-none focus:border-brand-primary"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && newTaskName.trim()) {
                                createRootTask.mutate(newTaskName.trim())
                            }
                            if (e.key === "Escape") {
                                setShowForm(false)
                                setNewTaskName("")
                            }
                        }}
                    />
                    <button
                        onClick={() => {
                            if (newTaskName.trim()) createRootTask.mutate(newTaskName.trim())
                        }}
                        disabled={!newTaskName.trim() || createRootTask.isPending}
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
            )}
        </div>
    )
}
