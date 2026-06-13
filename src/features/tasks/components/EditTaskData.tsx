import { useQuery } from "@tanstack/react-query"
import { Navigate, useLocation } from "react-router-dom"
import { getTaskById } from "@/features/shared/actions/task.api"
import EditTaskModal from "./EditTaskModal"

export default function EditTaskData() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const taskId = queryParams.get('editTaskId')!

  const { data, isError } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTaskById(Number(taskId)),
    enabled: !!taskId,
  })

  if (isError) return <Navigate to='/404' />

  if (data) return <EditTaskModal data={data} taskId={Number(taskId)} />
}
