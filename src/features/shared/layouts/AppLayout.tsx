import { Navigate, Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useAuth } from "@/features/auth/hooks/useAuth";
import Spinner from "@/components/ui/Spinner";
import SocketManager from "@/components/SocketManager";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AppLayout() {
  
  const {data, isError, isLoading, isFetching} = useAuth()

  if(isLoading) return <Spinner />
  
  if(isError && !isFetching) {
    const hasToken = localStorage.getItem('AUTH_TOKEN')
    if (hasToken) return <Navigate to='/auth/login'/>
    return null
  }
  
  if(data) return (
    <TooltipProvider>
      <div className="flex min-h-svh w-full">
        <div className="w-64 flex-shrink-0">
          <SidebarProvider>
            <SocketManager />
            <Sidebar
              name={data.name}
              apellido_paterno={data.apellido_paterno}
              email={data.email}
              isAdmin={data.roles?.includes('ROLE_Super_Administrador') ?? false}
            />
          </SidebarProvider>
        </div>
        <div className="bg-background flex flex-col flex-1 min-w-0">
            <Header />
            <section className="w-full p-5">
              <Outlet />
            </section>
            <Footer/>
        </div>
      </div>
    </TooltipProvider>
  );
}
