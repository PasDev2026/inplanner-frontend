import { useMutation, useQueryClient } from "@tanstack/react-query"
import { TASK_KEY, TASK_CHILDREN_KEY, DASHBOARD_TASKS_ALL } from "@/features/tasks/lib/task-keys"
import { PROJECT_TASKS_ALL } from "@/features/projects/lib/project-keys"
import { updateTask } from "@/features/shared/actions/task.api"

const invalidateTask = (queryClient: ReturnType<typeof useQueryClient>, data: { parent_task_id?: number | null } | unknown, taskId: number) => {
    queryClient.invalidateQueries({ queryKey: TASK_KEY(String(taskId)) })
    queryClient.invalidateQueries({ queryKey: PROJECT_TASKS_ALL })
    queryClient.invalidateQueries({ queryKey: DASHBOARD_TASKS_ALL })
    queryClient.invalidateQueries({ queryKey: TASK_CHILDREN_KEY(taskId) })
    const parentId = data && typeof data === "object" && "parent_task_id" in data
        ? (data as { parent_task_id?: number | null }).parent_task_id
        : undefined
    if (parentId) {
        queryClient.invalidateQueries({ queryKey: TASK_CHILDREN_KEY(parentId!) })
    }
}

export const useUpdateTaskName = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ taskId, ...fields }: { taskId: number; task_name: string; task_description: string }) =>
            updateTask(taskId, fields),
        onSuccess: (data, variables) => {
            invalidateTask(queryClient, data, variables.taskId)
        },
    })
}

export const useUpdateTaskDates = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ taskId, ...fields }: { taskId: number; start_date?: string | null; due_date?: string | null }) =>
            updateTask(taskId, fields),
        onSuccess: (data, variables) => {
            invalidateTask(queryClient, data, variables.taskId)
        },
    })
}
