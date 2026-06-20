import { useQuery } from "@tanstack/react-query"
import { PROJECT_DETAIL_KEY } from "@/features/projects/lib/project-keys"
import { Navigate, useParams } from "react-router-dom"
import { getProjectById } from "@/features/shared/actions/project.api"
import EditProjectForm from "../components/EditProjectForm"
import PageSpinner from "../../../components/ui/PageSpinner"

export default function ProjectEditPage() {
  const params = useParams()
  const projectId = Number(params.projectId!)

  const {data, isLoading,isError} = useQuery({
    queryKey: PROJECT_DETAIL_KEY(projectId),
    queryFn: () => getProjectById(projectId),
    retry: false,
  })

  if(isLoading) return <PageSpinner />
  if(isError) return <Navigate to='/404'/>
  if(data) return <EditProjectForm data={data} projectId={projectId}/>

}
