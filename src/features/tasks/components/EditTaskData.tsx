import { useQuery } from "@tanstack/react-query"
import { TASK_KEY } from "@/features/tasks/lib/task-keys"
import { Navigate } from "react-router-dom"
import { useModalParams } from "@/features/shared/hooks/useModalParams"
import { getTaskById } from "@/features/tasks/actions/task.api"
import EditTaskModal from "./EditTaskModal"

export default function EditTaskData() {
  const { paramValue: taskId } = useModalParams("editTaskId")

  const { data, isError } = useQuery({
    queryKey: TASK_KEY(taskId),
    queryFn: () => getTaskById(Number(taskId)),
    enabled: !!taskId,
  })

  if (isError) return <Navigate to='/404' />

  if (data) return <EditTaskModal data={data} taskId={Number(taskId)} />
}
