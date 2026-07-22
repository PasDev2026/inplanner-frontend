import { Suspense, useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
//import Footer from "./Footer";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";
import PageSpinner from "@/components/ui/PageSpinner";
import SocketManager from "@/components/SocketManager";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AppLayout() {

  const navigate = useNavigate()
  const { user, isLoading, isAuthenticated } = useAuthContext()

  useEffect(() => {
    if (isLoading || isAuthenticated) return

    const hasSession = localStorage.getItem('auth_user')

    if (hasSession) {
      navigate('/auth/login', { replace: true })
      return
    }

    if (!window.location.pathname.startsWith('/auth/login')) {
      navigate('/auth/login?session=expired', { replace: true })
    }
  }, [isLoading, isAuthenticated, navigate])

  if (isLoading || !isAuthenticated) return null

  return (
    <TooltipProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:ring-2 focus:ring-brand-primary focus:outline-none focus:rounded"
      >
        Saltar al contenido
      </a>
      <SidebarProvider>
        <SocketManager />
        <Sidebar
          name={user?.nombres ?? ""}
          apellido_paterno={user?.apellidoPaterno ?? ""}
          email={user?.email ?? ""}
          isAdmin={user?.roles?.some(r => r.rolCodigo === 'SUPER_ADMINISTRADOR') ?? false}
          canAccessDashboard={user?.roles?.some(r => r.rolCodigo === 'SUPER_ADMINISTRADOR' || r.rolCodigo === 'JEFATURA') ?? false}
        />
        <div className="bg-background flex flex-col flex-1 min-w-0">
            <Header />
            <section id="main-content" className="w-full p-5">
              <Suspense fallback={<PageSpinner />}>
                <Outlet />
              </Suspense>
            </section>
            {/* <Footer/> */}
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
