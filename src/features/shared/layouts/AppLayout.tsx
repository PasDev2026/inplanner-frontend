import { Suspense } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";
import PageSpinner from "@/components/ui/PageSpinner";
import SocketManager from "@/components/SocketManager";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AppLayout() {

  const { user, isLoading, isAuthenticated } = useAuthContext()
  const location = useLocation()

  if (!isLoading && !isAuthenticated) {
    const hasSession = localStorage.getItem('USER_PROFILE')
    const hasSessionParam = new URLSearchParams(location.search).has('session')
    if (hasSession) return <Navigate to='/auth/login'/>
    if (hasSessionParam) return null
    return <Navigate to='/auth/login?session=expired'/>
  }

  return (
    <TooltipProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:ring-2 focus:ring-brand-primary focus:outline-none focus:rounded"
      >
        Saltar al contenido
      </a>
      <div className="flex min-h-svh w-full">
        <div className="w-64 flex-shrink-0">
          <SidebarProvider>
            <SocketManager />
            <Sidebar
              name={user?.name ?? ""}
              apellido_paterno={user?.apellido_paterno ?? ""}
              email={user?.email ?? ""}
              isAdmin={user?.roles?.includes('ROLE_Super_Administrador') ?? false}
            />
          </SidebarProvider>
        </div>
        <div className="bg-background flex flex-col flex-1 min-w-0">
            <Header />
            <section id="main-content" className="w-full p-5">
              <Suspense fallback={<PageSpinner />}>
                <Outlet />
              </Suspense>
            </section>
            <Footer/>
        </div>
      </div>
    </TooltipProvider>
  );
}
