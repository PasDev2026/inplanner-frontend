import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { exportProjectTasks } from "@/features/projects/actions/project.api"

type ExportVariables = {
  projectId: number
  projectName?: string
}

export function useExportProjectTasks() {
  return useMutation({
    mutationFn: ({ projectId, projectName }: ExportVariables) =>
      exportProjectTasks(projectId, projectName),
    onSuccess: () => toast.success("Excel exportado"),
    onError: (error) => toast.error((error as Error).message),
  })
}
