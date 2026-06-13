import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateProjectField } from "@/features/shared/actions/project.api"

export const useUpdateProject = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ projectId, ...fields }: { projectId: number } & Record<string, unknown>) =>
            updateProjectField(projectId, fields),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["projects"] })
            queryClient.invalidateQueries({ queryKey: ["editProject", variables.projectId] })
        },
    })
}
