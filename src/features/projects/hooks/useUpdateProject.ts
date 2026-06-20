import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PROJECTS_KEY, PROJECT_DETAIL_KEY } from "@/features/projects/lib/project-keys"
import { updateProjectField } from "@/features/shared/actions/project.api"

export const useUpdateProject = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ projectId, ...fields }: { projectId: number } & Record<string, unknown>) =>
            updateProjectField(projectId, fields),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
            queryClient.invalidateQueries({ queryKey: PROJECT_DETAIL_KEY(variables.projectId) })
        },
    })
}
