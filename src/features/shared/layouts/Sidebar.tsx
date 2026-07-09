import { useLocation, useNavigate } from "react-router-dom";
import { User, Folder, Users, LogOut } from "lucide-react";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";
import { disconnectSocket } from "@/features/shared/lib/socket";
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
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

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
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    disconnectSocket();
  };

  const navLinks = [
    { to: "/profile", label: "Mi perfil", icon: User, matchPaths: ["/profile"] },
   /*  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, matchPaths: ["/dashboard"] }, */
    { to: "/projects", label: "Mis proyectos", icon: Folder, matchPaths: ["/projects"] },
    /* { to: "/mis-tareas", label: "Mis tareas", icon: ListChecks, matchPaths: ["/mis-tareas"] },
    { to: "/calendario", label: "Calendario", icon: CalendarDays, matchPaths: ["/calendario"] },
    { to: "/reportes", label: "Reportes", icon: BarChart3, matchPaths: ["/reportes"] }, */
    ...(isAdmin
      ? [{ to: "/admin/users", label: "Usuarios", icon: Users, matchPaths: ["/admin/users"] }]
      : []),
  ];

  return (
    <SidebarBase collapsible="icon">
      <SidebarRail />
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 pt-4 pb-2 group-data-[collapsible=icon]:justify-center">
          <SidebarTrigger />
          <img src="/in planner.png" className="h-7 w-auto group-data-[collapsible=icon]:hidden" alt="InPlanner" />
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
                    className={matchPaths.some(p => location.pathname.startsWith(p)) ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""}
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
            <DropdownMenu>
              <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarFallback className="rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">{name} {apellido_paterno}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {isAdmin ? "Administrador" : "Usuario"}
                  </span>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" side="top" sideOffset={4} className="min-w-56 rounded-lg">
                <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-full">
                      <AvatarFallback className="rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                        {name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{name} {apellido_paterno}</span>
                      <span className="truncate text-xs text-muted-foreground">{email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Mi perfil
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarBase>
  );
}
