import { useQuery } from "@tanstack/react-query"
import { getProjectTasks } from "@/features/projects/actions/project.api"
import { PROJECT_TASKS_KEY } from "@/features/projects/lib/project-keys"
import type { BackendTask } from "@/features/shared/lib/types"

export function useProjectBranches(projectId: number, enabled: boolean) {
  return useQuery({
    queryKey: PROJECT_TASKS_KEY(projectId),
    queryFn: async () => {
      const result = await getProjectTasks(projectId)
      if (!result) throw new Error("No data")
      return (result as { data: BackendTask[] }).data ?? []
    },
    enabled: enabled && !!projectId,
    staleTime: 30_000,
    retry: false,
  })
}
