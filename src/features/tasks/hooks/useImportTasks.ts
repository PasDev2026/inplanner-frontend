import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { DASHBOARD_TASKS_KEY, TASK_CHILDREN_ALL } from "@/features/tasks/lib/task-keys"
import { PROJECTS_KEY, PROJECT_TASKS_KEY } from "@/features/projects/lib/project-keys"
import { importTasksFromFile, previewTasksFromFile } from "../actions/import.api"

type ImportVariables = {
  file: File
  projectId: number
  parentTaskId?: number
}

export function useImportTasks() {
  const queryClient = useQueryClient()

  const previewMutation = useMutation({
    mutationFn: ({ file, projectId, parentTaskId }: ImportVariables) =>
      previewTasksFromFile(file, { projectId, parentTaskId }),
    onError: (error) => toast.error((error as Error).message),
  })

  const importMutation = useMutation({
    mutationFn: ({ file, projectId, parentTaskId }: ImportVariables) =>
      importTasksFromFile(file, { projectId, parentTaskId }),
    onSuccess: (tasks, variables) => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
      queryClient.invalidateQueries({ queryKey: PROJECT_TASKS_KEY(variables.projectId) })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_TASKS_KEY(variables.projectId) })
      queryClient.invalidateQueries({ queryKey: TASK_CHILDREN_ALL })
      toast.success(
        `Se importaron ${tasks.length} ${tasks.length === 1 ? "tarea" : "tareas"}`,
      )
    },
    onError: (error) => toast.error((error as Error).message),
  })

  return { previewMutation, importMutation }
}
