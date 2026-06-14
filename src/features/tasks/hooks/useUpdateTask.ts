import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateTask } from "@/features/shared/actions/task.api"

export const useUpdateTaskName = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ taskId, ...fields }: { taskId: number; task_name: string; task_description: string }) =>
            updateTask(taskId, fields),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["task", String(variables.taskId)] })
            queryClient.invalidateQueries({ queryKey: ["projectTasks"] })
        },
    })
}

export const useUpdateTaskDates = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ taskId, ...fields }: { taskId: number; start_date?: string | null; due_date?: string | null }) =>
            updateTask(taskId, fields),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["task", String(variables.taskId)] })
            queryClient.invalidateQueries({ queryKey: ["projectTasks"] })
        },
    })
}
