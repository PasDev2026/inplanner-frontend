import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateTask, updateTaskStatus, createAssignment, removeAssignment, deleteTask } from "@/features/shared/actions/task.api"
import { toast } from "sonner"

export function useTaskMutations(projectIdNum: number) {
    const queryClient = useQueryClient()
    const invalidateProject = () => {
        queryClient.invalidateQueries({ queryKey: ["projectTasks", projectIdNum] })
    }

    const statusMutation = useMutation({
        mutationFn: ({ taskId, status }: { taskId: number; status: number }) =>
            updateTaskStatus(taskId, { status }),
        onSuccess: invalidateProject,
        onError: (error) => {
            toast.error((error as Error).message)
        },
    })

    const priorityMutation = useMutation({
        mutationFn: ({ taskId, priority }: { taskId: number; priority: number | null }) =>
            updateTask(taskId, { priority }),
        onSuccess: invalidateProject,
        onError: (error) => {
            toast.error((error as Error).message)
        },
    })

    const renameMutation = useMutation({
        mutationFn: ({ taskId, task_name, task_description }: { taskId: number; task_name: string; task_description: string }) =>
            updateTask(taskId, { task_name, task_description }),
        onSuccess: invalidateProject,
        onError: (error) => {
            toast.error((error as Error).message)
        },
    })

    const assignmentMutation = useMutation({
        mutationFn: async ({ taskId, userIds, currentIds }: { taskId: number; userIds: number[]; currentIds: number[] }) => {
            const toAdd = userIds.filter((id) => !currentIds.includes(id))
            const toRemove = currentIds.filter((id) => !userIds.includes(id))
            const ops: Promise<unknown>[] = [
                ...toAdd.map((id) => createAssignment(taskId, id)),
                ...toRemove.map((id) => removeAssignment(taskId, id)),
            ]
            await Promise.all(ops)
        },
        onSuccess: invalidateProject,
        onError: (error) => {
            toast.error((error as Error).message)
        },
    })

    const deleteTaskMutation = useMutation({
        mutationFn: (taskId: number) => deleteTask(taskId),
        onSuccess: () => {
            invalidateProject()
        },
        onError: (error) => {
            toast.error((error as Error).message)
        },
    })

    return { statusMutation, priorityMutation, renameMutation, assignmentMutation, deleteTaskMutation }
}
