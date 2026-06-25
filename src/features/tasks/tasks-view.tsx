import { useQuery } from "@tanstack/react-query"
import { PROJECT_TASKS_KEY } from "@/features/projects/lib/project-keys"
import { getProjectTasks } from "@/features/projects/actions/project.api"
import type { BackendTask } from "@/features/shared/lib/types"
import TaskList from "@/features/tasks/components/TaskList"
import { CreateTaskModal } from "@/features/tasks/components/CreateTaskModal"
import { TaskModalDetails } from "@/features/tasks/components/TaskModalDetails"

type TasksViewProps = {
  projectId: number
  canEdit: boolean
}

export default function TasksView({ projectId, canEdit }: TasksViewProps) {
  const { data: tasksResponse } = useQuery({
    queryKey: PROJECT_TASKS_KEY(projectId),
    queryFn: async () => {
      const result = await getProjectTasks(projectId)
      if (!result) throw new Error("No data")
      return result
    },
    staleTime: 30_000,
    enabled: !!projectId,
  })

  const tasks = (tasksResponse as { data: BackendTask[] } | undefined)?.data ?? []

  return (
    <>
      <TaskList tasks={tasks} canEdit={canEdit} />
      <CreateTaskModal />
      <TaskModalDetails />
    </>
  )
}
