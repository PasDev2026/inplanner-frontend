import { lazy } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import AppLayout from "@/features/shared/layouts/AppLayout"
import AuthLayout from "@/features/shared/layouts/AuthLayout"
import ProfileLayout from "@/features/shared/layouts/ProfileLayout"
import NotFoundPage from "@/features/shared/pages/NotFoundPage"
import { AuthProvider } from "@/features/auth/providers/AuthProvider"

const ProjectListPage = lazy(() => import("@/features/projects/pages/ProjectListPage"))
const UserListPage = lazy(() => import("@/features/admin/pages/UserListPage"))
const ProjectEditPage = lazy(() => import("@/features/projects/pages/ProjectEditPage"))
const ProjectDetailPage = lazy(() => import("@/features/projects/pages/ProjectDetailPage"))
const TeamPage = lazy(() => import("@/features/projects/pages/team/TeamPage"))
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"))
const ProfilePage = lazy(() => import("@/features/profile/pages/ProfilePage"))
const ChangePasswordProfile = lazy(() => import("@/features/profile/components/ChangePasswordProfile"))



export default function Router() {
    
    return(
        <BrowserRouter>
            <AuthProvider>
            <Routes>
                <Route path="/" element={<Navigate to="/auth/login" replace />} />
                <Route element={<AppLayout/>}>
<Route path="/dashboard" element={<ProjectListPage/>} index/>
<Route path="/admin/users" element={<UserListPage/>}/>
                    <Route path="/projects/:projectId/details-projects" element={<ProjectDetailPage />}/>
                    <Route path="/projects/:projectId/edit" element={<ProjectEditPage/>}/>
                    <Route path="/projects/:projectId/details-projects/team" element={<TeamPage />}/>

                    <Route element={<ProfileLayout/>}>
                        <Route path="/profile" element={<ProfilePage />}/>
                        <Route path="/profile/change-password" element={<ChangePasswordProfile />}/>
                    </Route>
                </Route>

                <Route element={<AuthLayout/>} >
                    <Route path='/auth/login' element={<LoginPage/>}></Route>
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
