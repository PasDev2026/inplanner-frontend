import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import AppLayout from "@/features/shared/layouts/AppLayout"
import DashboardPage from "@/features/dashboard/pages/DashboardPage"
import UserListPage from "@/features/admin/pages/UserListPage"
import ProjectCreatePage from "@/features/projects/pages/ProjectCreatePage"
import ProjectEditPage from "@/features/projects/pages/ProjectEditPage"
import ProjectDetailPage from "@/features/projects/pages/ProjectDetailPage"
import LoginPage from "@/features/auth/pages/LoginPage"
import AuthLayout from "@/features/shared/layouts/AuthLayout"
import TeamPage from "@/features/projects/pages/team/TeamPage"
import ProfilePage from "@/features/profile/pages/ProfilePage"
import ChangePasswordProfile from "@/features/profile/components/ChangePasswordProfile"
import ProfileLayout from "@/features/shared/layouts/ProfileLayout"
import NotFoundPage from "@/features/shared/pages/NotFoundPage"



export default function Router() {
    
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/auth/login" replace />} />
                <Route element={<AppLayout/>}>
<Route path="/dashboard" element={<DashboardPage/>} index/>
<Route path="/admin/users" element={<UserListPage/>}/>
                    <Route path="/projects/create" element={<ProjectCreatePage/>}/>
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
        </BrowserRouter>
    )
}
