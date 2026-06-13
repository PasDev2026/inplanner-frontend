import { useQuery } from "@tanstack/react-query"
import { Navigate, useParams } from "react-router-dom"
import { getProjectById } from "@/features/shared/actions/project.api"
import EditProjectForm from "../components/EditProjectForm"
import Spinner from "../../../components/ui/Spinner"

export default function ProjectEditPage() {
  const params = useParams()
  const projectId = Number(params.projectId!)

  const {data, isLoading,isError} = useQuery({
    queryKey: ['editProject', projectId],
    queryFn: () => getProjectById(projectId),
    retry: false,
  })

  if(isLoading) return <Spinner />
  if(isError) return <Navigate to='/404'/>
  if(data) return <EditProjectForm data={data} projectId={projectId}/>

}
