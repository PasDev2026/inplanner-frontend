import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { User, Folder, Users, LogOut } from "lucide-react";
import { disconnectSocket } from "@/features/shared/lib/socket";
import { logoutApi } from "@/features/shared/actions/auth.api";
import {
  Sidebar as SidebarBase,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

type SidebarProps = {
  name: string;
  apellido_paterno: string;
  email?: string;
  isAdmin: boolean;
};

export default function Sidebar({
  name,
  apellido_paterno,
  email,
  isAdmin,
}: SidebarProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logoutApi();
    localStorage.removeItem("AUTH_TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");
    queryClient.removeQueries({ queryKey: ["user"] });
    disconnectSocket();
    navigate("/auth/login?session=closed");
  };

  const navLinks = [
    { to: "/profile", label: "Mi perfil", icon: User, matchPaths: ["/profile"] },
    { to: "/dashboard", label: "Mis proyectos", icon: Folder, matchPaths: ["/dashboard", "/projects"] },
    ...(isAdmin
      ? [{ to: "/admin/users", label: "Usuarios", icon: Users, matchPaths: ["/admin/users"] }]
      : []),
  ];

  return (
    <SidebarBase collapsible="icon">
      <SidebarHeader>
        <a href="/dashboard" className="flex items-center gap-3 px-2 pt-4 pb-2">
          <img src="/in planner.png" className="h-7 w-auto" alt="InPlanner" />
        </a>
        <div className="mx-2 mb-2 rounded-lg bg-sidebar-accent/30 p-3">
          <div className="flex items-center gap-3">
            <HoverCard>
              <HoverCardTrigger>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white cursor-pointer">
                  {name.charAt(0).toUpperCase()}
                </div>
              </HoverCardTrigger>
              <HoverCardContent side="right" sideOffset={12}>
                <p className="text-sm font-semibold">{name} {apellido_paterno}</p>
                {email && <p className="text-xs text-muted-foreground">{email}</p>}
                <p className="text-xs text-muted-foreground mt-1">{isAdmin ? "Administrador" : "Usuario"}</p>
              </HoverCardContent>
            </HoverCard>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">
                {name} {apellido_paterno}
              </p>
              {email && (
                <p className="truncate text-xs text-sidebar-foreground/70">
                  {email}
                </p>
              )}
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navLinks.map(({ to, label, icon: Icon, matchPaths }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton
                    isActive={matchPaths.some(p => location.pathname.startsWith(p))}
                    onClick={() => navigate(to)}
                    tooltip={label}
                    className={matchPaths.some(p => location.pathname.startsWith(p)) ? "border-l-2 border-brand-primary rounded-l-none" : ""}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Cerrar Sesión">
              <LogOut className="text-red-500" />
              <span>Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarBase>
  );
}
