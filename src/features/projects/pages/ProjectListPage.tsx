import { useLocation } from "react-router-dom"
import ProjectsView from "../projects-view"

export default function ProjectListPage() {
  const location = useLocation()
  const tab = location.pathname === '/projects/completed' ? 'completed' : 'active'
  return <ProjectsView tab={tab} />
}
