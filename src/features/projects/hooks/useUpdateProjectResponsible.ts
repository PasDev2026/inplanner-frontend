import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createResponsible, removeResponsible, getResponsibles } from "@/features/shared/actions/project.api"

type UseUpdateProjectResponsibleParams = {
    projectId: number
    userIds: number[]
}

export const useUpdateProjectResponsible = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ projectId, userIds }: UseUpdateProjectResponsibleParams) => {
            const current = await getResponsibles(projectId) as { user_id: number }[]
            const currentIds = current.map((r) => r.user_id)
            const toAdd = userIds.filter((id) => !currentIds.includes(id))
            const toRemove = currentIds.filter((id) => !userIds.includes(id))
            const ops: Promise<unknown>[] = [
                ...toAdd.map((uid) => createResponsible(projectId, uid)),
                ...toRemove.map((uid) => removeResponsible(projectId, uid)),
            ]
            await Promise.all(ops)
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["projects"] })
            queryClient.invalidateQueries({ queryKey: ["editProject", variables.projectId] })
            queryClient.invalidateQueries({ queryKey: ["projectSedeUsers", variables.projectId] })
        },
    })
}
