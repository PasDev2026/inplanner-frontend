import { Link, Navigate, useParams } from "react-router-dom"
import { getProjectById } from "@/features/projects/actions/project.api"
import { useQuery } from "@tanstack/react-query"
import { PROJECT_DETAIL_KEY } from "@/features/projects/lib/project-keys"
import { Plus, Users } from "lucide-react"
import PageSpinner from "@/components/ui/PageSpinner"
import { useAuth } from "@/features/auth/hooks/useAuth"
import isManager from "@/features/shared/lib/policies"
import DeadlineBadge from "@/components/ui/DeadlineBadge"
import DateBadge from "@/components/ui/DateBadge"
import { Card, CardContent } from "@/components/ui/card"
import TasksView from "@/features/tasks/tasks-view"

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
        <CardContent className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{data.name_project}</h1>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">{data.description_project}</p>
            <div className="flex flex-wrap items-center gap-2 pt-1.5">
              <DateBadge date={data.start_date} />
              <DeadlineBadge dueDate={data.due_date} />
            </div>
          </div>

          {isManager(data.manager_id, user.idUser) && (
            <div className="flex items-center gap-2 shrink-0 self-start md:self-center mt-2 md:mt-0">
              <Link
                to="?newTask=true"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-primary hover:bg-brand-hover text-white text-sm font-bold rounded-lg shadow-sm shadow-brand-primary/10 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                Nueva tarea
              </Link>
              <Link
                to="team"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-primary hover:bg-brand-hover text-white text-sm font-bold rounded-lg shadow-sm shadow-brand-primary/10 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer shrink-0"
              >
                <Users className="w-4 h-4" />
                Colaboradores
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <TasksView projectId={projectId} canEdit={!!user && isManager(data.manager_id, user.idUser)} />
    </div>
  );

}
