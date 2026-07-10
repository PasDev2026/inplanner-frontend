import { Navigate, useParams } from "react-router-dom"
import { getProjectById } from "@/features/projects/actions/project.api"
import { useQuery } from "@tanstack/react-query"
import { PROJECT_DETAIL_KEY } from "@/features/projects/lib/project-keys"
import PageSpinner from "@/components/ui/PageSpinner"
import { useAuth } from "@/features/auth/hooks/useAuth"
import isManager from "@/features/shared/lib/policies"
import DeadlineBadge from "@/components/ui/DeadlineBadge"
import DateBadge from "@/components/ui/DateBadge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import TasksView from "@/features/tasks/tasks-view"
import { PRIVACY_LEVEL_MAP } from "@/features/shared/constants/privacy-level.constant"

export default function ProjectDetailPage() {

  const { data: user, isLoading: authLoading } = useAuth()

  const params = useParams()
  const projectId = Number(params.projectId!)

  const {data, isLoading,isError} = useQuery({
    queryKey: PROJECT_DETAIL_KEY(projectId),
    queryFn: async () => {
      const result = await getProjectById(projectId)
      if (!result) throw new Error("No data")
      return result
    },
    retry: false,
  })

  if(isLoading && authLoading) return <PageSpinner />
  if(isError) return <Navigate to='/404'/>
  if (data && user) return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-2xl">{data.name_project}</CardTitle>
            <CardDescription>{data.description_project}</CardDescription>
          </div>

        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <DateBadge date={data.start_date} />
            <DeadlineBadge dueDate={data.due_date} />
            <Badge variant={PRIVACY_LEVEL_MAP[data.privacy_level ?? 0].variant}>
              {PRIVACY_LEVEL_MAP[data.privacy_level ?? 0].label}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <TasksView projectId={projectId} canEdit={!!user && isManager(data.manager_id, user.idUser)} />
    </div>
  );

}
