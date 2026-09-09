import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { DASHBOARD_TASKS_KEY, TASK_CHILDREN_ALL } from "@/features/tasks/lib/task-keys"
import { PROJECTS_KEY, PROJECT_TASKS_KEY } from "@/features/projects/lib/project-keys"
import {
    applyTemplate,
    createTemplate,
    createTemplateFromTask,
    deleteTemplate,
    updateTemplate,
} from "../actions/template.api"
import { TEMPLATES_KEY } from "../lib/template-keys"
import type { TemplateItemPayload } from "../lib/types"

export function useTemplateMutations() {
    const queryClient = useQueryClient()

    const invalidateTemplates = () =>
        queryClient.invalidateQueries({ queryKey: TEMPLATES_KEY })

    const invalidateProjectTasks = (projectId: number) => {
        queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
        queryClient.invalidateQueries({ queryKey: PROJECT_TASKS_KEY(projectId) })
        queryClient.invalidateQueries({ queryKey: DASHBOARD_TASKS_KEY(projectId) })
        queryClient.invalidateQueries({ queryKey: TASK_CHILDREN_ALL })
    }

    const createMutation = useMutation({
        mutationFn: (dto: { template_name: string; items: TemplateItemPayload[] }) =>
            createTemplate(dto),
        onSuccess: () => {
            invalidateTemplates()
            toast.success("Plantilla creada")
        },
        onError: (error) => toast.error((error as Error).message),
    })

    const createFromTaskMutation = useMutation({
        mutationFn: (dto: { task_id: number; template_name: string }) =>
            createTemplateFromTask(dto),
        onSuccess: () => {
            invalidateTemplates()
            toast.success("Plantilla creada desde la tarea")
        },
        onError: (error) => toast.error((error as Error).message),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, ...dto }: { id: number; template_name?: string; items?: TemplateItemPayload[] }) =>
            updateTemplate(id, dto),
        onSuccess: () => {
            invalidateTemplates()
            toast.success("Plantilla actualizada")
        },
        onError: (error) => toast.error((error as Error).message),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteTemplate(id),
        onSuccess: () => {
            invalidateTemplates()
            toast.success("Plantilla eliminada")
        },
        onError: (error) => toast.error((error as Error).message),
    })

    const applyMutation = useMutation({
        mutationFn: ({ templateId, projectId, parentTaskId }: { templateId: number; projectId: number; parentTaskId?: number }) =>
            applyTemplate(templateId, {
                project_id: projectId,
                ...(parentTaskId !== undefined ? { parent_task_id: parentTaskId } : {}),
            }),
        onSuccess: (tasks, variables) => {
            invalidateProjectTasks(variables.projectId)
            toast.success(`Se crearon ${tasks.length} tareas desde la plantilla`)
        },
        onError: (error) => toast.error((error as Error).message),
    })

    return { createMutation, createFromTaskMutation, updateMutation, deleteMutation, applyMutation }
}
