import { useState, type KeyboardEvent } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Check, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { createTask } from "@/features/tasks/actions/task.api"
import { DASHBOARD_TASKS_KEY } from "@/features/tasks/lib/task-keys"
import { PROJECTS_KEY, PROJECT_TASKS_KEY } from "@/features/projects/lib/project-keys"
import AddTemplateButton from "@/features/templates/components/AddTemplateButton"
import ImportActivitiesButton from "@/features/tasks/components/ImportActivitiesButton"

type ProjectAddBarProps = {
  projectId: number
}

export default function ProjectAddBar({ projectId }: ProjectAddBarProps) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const queryClient = useQueryClient()

  const createRootTask = useMutation({
    mutationFn: (taskName: string) =>
      createTask({ task_name: taskName, project_id: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
      queryClient.invalidateQueries({ queryKey: PROJECT_TASKS_KEY(projectId) })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_TASKS_KEY(projectId) })
      setName("")
      setShowForm(false)
    },
    onError: (error) => toast.error((error as Error).message),
  })

  const submit = () => {
    const value = name.trim()
    if (value) createRootTask.mutate(value)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") submit()
    if (event.key === "Escape") {
      setShowForm(false)
      setName("")
    }
  }

  if (showForm) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nombre de la tarea"
          autoFocus
          className="flex-1 rounded border border-border px-2 py-1.5 text-xs focus:border-brand-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!name.trim() || createRootTask.isPending}
          className="p-1 text-brand-primary hover:text-brand-dark disabled:text-muted-foreground"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            setShowForm(false)
            setName("")
          }}
          className="p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="flex items-center gap-1 text-xs text-brand-primary transition-colors hover:text-brand-dark"
      >
        <Plus className="h-3.5 w-3.5" />
        Añadir tarea
      </button>
      <AddTemplateButton projectId={projectId} />
      <ImportActivitiesButton projectId={projectId} />
    </div>
  )
}
