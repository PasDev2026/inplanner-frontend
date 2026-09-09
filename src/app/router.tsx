import { lazy } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import AppLayout from "@/features/shared/layouts/AppLayout"
import AuthLayout from "@/features/shared/layouts/AuthLayout"
import ProfileLayout from "@/features/shared/layouts/ProfileLayout"
import NotFoundPage from "@/features/shared/pages/NotFoundPage"
import { AuthProvider } from "@/features/auth/providers/AuthProvider"
import { getSedeSlug } from "@/features/auth/actions/auth.api"

const ProjectListPage = lazy(() => import("@/features/projects/pages/ProjectListPage"))
const UserListPage = lazy(() => import("@/features/admin/pages/UserListPage"))
const ProjectDetailPage = lazy(() => import("@/features/projects/pages/ProjectDetailPage"))
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"))
const ProfilePage = lazy(() => import("@/features/profile/pages/ProfilePage"))
const ChangePasswordProfile = lazy(() => import("@/features/profile/components/ChangePasswordProfile"))
const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage"))
const MyTasksPage = lazy(() => import("@/features/my-tasks/pages/MyTasksPage"))
const MiDashboardPage = lazy(() => import("@/features/mi-dashboard/pages/MiDashboardPage"))
const CalendarPage = lazy(() => import("@/features/calendar/pages/CalendarPage"))
const ReportsPage = lazy(() => import("@/features/reports/pages/ReportsPage"))
const TemplatesPage = lazy(() => import("@/features/templates/pages/TemplatesPage"))



export default function Router() {
    
    return(
        <BrowserRouter>
            <AuthProvider>
            <Routes>
                <Route path="/" element={<Navigate to={`/${getSedeSlug()}/auth/login`} replace />} />
                <Route element={<AppLayout/>}>
                    <Route path="/dashboard" element={<DashboardPage />}/>
                    <Route path="/projects" element={<ProjectListPage/>}/>
                    <Route path="/projects/completed" element={<ProjectListPage/>}/>
                    <Route path="/mis-tareas" element={<MyTasksPage />}/>
                    <Route path="/mi-dashboard" element={<MiDashboardPage />}/>
                    <Route path="/calendario" element={<CalendarPage />}/>
                    <Route path="/reportes" element={<ReportsPage />}/>
                    <Route path="/plantillas" element={<TemplatesPage />}/>
                    <Route path="/admin/users" element={<UserListPage/>}/>
                    <Route path="/projects/:projectId/details-projects" element={<ProjectDetailPage />}/>

                    <Route element={<ProfileLayout/>}>
                        <Route path="/profile" element={<ProfilePage />}/>
                        <Route path="/profile/change-password" element={<ChangePasswordProfile />}/>
                    </Route>
                </Route>

                <Route element={<AuthLayout/>} >
                    <Route path='/:sede/auth/login' element={<LoginPage/>}></Route>
                </Route>

                <Route element={<AuthLayout/>} > 
                    <Route path='/404' element={<NotFoundPage/>}></Route>
                </Route>

                <Route path="*" element={<Navigate to="/404" replace />} />

            </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}
