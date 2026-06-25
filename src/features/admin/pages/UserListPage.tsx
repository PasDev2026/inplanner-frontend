import { useState, useMemo, memo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { USERS_KEY, USERS_PAGINATED_KEY } from "@/features/admin/lib/admin-keys";
import { ROLES_KEY, SEDES_KEY } from "@/features/shared/lib/shared-keys";
import { Key, Pencil } from "lucide-react"
import { getAllUsers, updateUserStatus } from "@/features/admin/actions/admin.api";
import { getRoles, getSedes } from "@/features/shared/actions/centralizado.api";
import PageSpinner from "@/components/ui/PageSpinner";
import UserStatusModal from "@/features/admin/components/UserStatusModal";
import CreateUserModal from "@/features/admin/components/CreateUserModal";
import EditUserModal from "@/features/admin/components/EditUserModal";
import ResetPasswordModal from "@/features/admin/components/ResetPasswordModal";
import { Pagination } from "@/components/ui/pagination";
import { UserAdmin } from "@/features/admin/schemas/user.schema";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

type UserTableProps = {
  users: UserAdmin[]
  roleMap: Map<number, string>
  sedeMap: Map<number, string>
  onEdit: (id: number) => void
  onResetPassword: (id: number, name: string) => void
  onStatusChange: (user: UserAdmin) => void
}

const UserTable = memo(function UserTable({
  users, roleMap, sedeMap, onEdit, onResetPassword, onStatusChange
}: UserTableProps) {
  return (
    <Table>
      <TableHeader className="bg-brand-primary">
        <TableRow className="hover:bg-transparent border-none">
          <TableHead className="px-6 py-2.5 text-left text-[10px] font-extrabold text-white uppercase tracking-wider">Usuario</TableHead>
          <TableHead className="px-6 py-2.5 text-left text-[10px] font-extrabold text-white uppercase tracking-wider">DNI</TableHead>
          <TableHead className="px-6 py-2.5 text-left text-[10px] font-extrabold text-white uppercase tracking-wider">Rol / Área</TableHead>
          <TableHead className="px-6 py-2.5 text-left text-[10px] font-extrabold text-white uppercase tracking-wider">Estado</TableHead>
          <TableHead className="px-6 py-2.5 text-left text-[10px] font-extrabold text-white uppercase tracking-wider">Sede</TableHead>
          <TableHead className="px-6 py-2.5 text-right text-[10px] font-extrabold text-white uppercase tracking-wider">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user: UserAdmin) => (
          <TableRow key={user.id_user} className="hover:bg-muted/40 transition-colors duration-150 group">
            <TableCell className="px-6 py-2.5 whitespace-nowrap">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-xs text-foreground shrink-0 select-none group-hover:border-brand-primary/20 group-hover:bg-brand-primary/[0.02] transition-colors duration-150">
                  {user.name.charAt(0).toUpperCase()}
                  {user.apellido_paterno?.charAt(0).toUpperCase() || ""}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-foreground truncate group-hover:text-foreground transition-colors duration-150">
                    {user.name} {user.apellido_paterno} {user.apellido_materno || ""}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-normal truncate mt-0">
                    {user.email} <span className="text-muted-foreground mx-0.5 font-light">•</span> @{user.username}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell className="px-6 py-2.5 whitespace-nowrap">
              <div className="text-xs text-muted-foreground font-medium">{user.dni || "—"}</div>
            </TableCell>
            <TableCell className="px-6 py-2.5 whitespace-nowrap">
              {user.userRoles && user.userRoles.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {user.userRoles.slice(0, 2).map(r => (
                    <span key={Number(r.rol_id)} className="px-2 py-0.5 text-[9px] rounded bg-muted text-muted-foreground border border-border font-medium whitespace-nowrap">
                      {roleMap.get(Number(r.rol_id)) ?? "—"}
                    </span>
                  ))}
                  {user.userRoles.length > 2 && (
                    <span className="px-2 py-0.5 text-[9px] rounded bg-muted text-muted-foreground border border-border font-medium whitespace-nowrap">
                      +{user.userRoles.length - 2}
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-xs font-bold text-foreground">Sin rol</div>
              )}
              <div className="text-[11px] text-muted-foreground font-normal mt-0.5">
                {user.area?.nombre_area
                  ? user.area.nombre_area.charAt(0).toUpperCase() + user.area.nombre_area.slice(1)
                  : "Sin área"}
              </div>
            </TableCell>
            <TableCell className="px-6 py-2.5 whitespace-nowrap">
              <button
                onClick={() => onStatusChange(user)}
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                  user.estado
                    ? "bg-success/15 text-success border-success/25"
                    : "bg-muted text-muted-foreground border-border"
                }`}
                title="Click para cambiar estado"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${user.estado ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
                {user.estado ? "Activo" : "Inactivo"}
              </button>
            </TableCell>
            <TableCell className="px-6 py-2.5">
              {user.userSedes && user.userSedes.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {user.userSedes.slice(0, 2).map(s => (
                    <span key={Number(s.sede_id)} className="px-2 py-0.5 text-[9px] rounded bg-muted text-muted-foreground border border-border font-medium whitespace-nowrap">
                      {sedeMap.get(Number(s.sede_id)) ?? "—"}
                    </span>
                  ))}
                  {user.userSedes.length > 2 && (
                    <span className="px-2 py-0.5 text-[9px] rounded bg-muted text-muted-foreground border border-border font-medium whitespace-nowrap">
                      +{user.userSedes.length - 2}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-[10px] text-muted-foreground font-light">—</span>
              )}
            </TableCell>
            <TableCell className="px-6 py-2.5 whitespace-nowrap text-right">
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(user.id_user)}
                  className="p-1 text-muted-foreground hover:text-brand-primary hover:bg-muted rounded-lg transition-all duration-200 cursor-pointer"
                  title="Editar usuario"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onResetPassword(user.id_user, `${user.name} ${user.apellido_paterno}`)}
                  className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-200 cursor-pointer"
                  title="Restablecer contraseña"
                >
                  <Key className="h-4 w-4" />
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
})

const UserList = memo(function UserList() {

  const queryClient = useQueryClient()
  const [selectedUser, setSelectedUser] = useState<UserAdmin | null>(null)
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [resetPasswordUserId, setResetPasswordUserId] = useState<{ id: number; name: string } | null>(null)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  const { data, isLoading, isError } = useQuery({
    queryKey: USERS_PAGINATED_KEY(page, PAGE_SIZE),
    queryFn: () => getAllUsers(page, PAGE_SIZE),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const { data: roles } = useQuery({
    queryKey: ROLES_KEY,
    queryFn: getRoles,
    staleTime: 5 * 60 * 1000,
  });

  const { data: sedes } = useQuery({
    queryKey: SEDES_KEY,
    queryFn: getSedes,
    staleTime: 5 * 60 * 1000,
  });

  const roleMap = useMemo(() => {
    if (!roles) return new Map<number, string>()
    return new Map(roles.map(r => [Number(r.id), r.nombre]))
  }, [roles])

  const sedeMap = useMemo(() => {
    if (!sedes) return new Map<number, string>()
    return new Map(sedes.map(s => [Number(s.id), s.nombre]))
  }, [sedes])

  const { mutate } = useMutation({
    mutationFn: ({ userId, estado }: { userId: number; estado: boolean }) =>
      updateUserStatus(userId, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
    },
    onError: (error) => {
      console.error(error.message)
    },
  });

  if (isLoading) return <PageSpinner />;

  if (isError) {
    return (
      <div>
        <h1 className="text-5xl font-black">Usuarios registrados</h1>
        <p className="text-2xl font-light text-red-500 mt-5">
          Error al cargar los usuarios. Verifica tus permisos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Gestión de usuarios</h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Administra los roles, áreas y accesos de los usuarios del sistema
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white text-sm font-bold rounded-lg shadow-sm shadow-brand-primary/10 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer shrink-0"
        >
          <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Crear Usuario
        </button>
      </div>

      {data && data.users.length ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <UserTable
            users={data.users}
            roleMap={roleMap}
            sedeMap={sedeMap}
            onEdit={setEditingUserId}
            onResetPassword={(id, name) => setResetPasswordUserId({ id, name })}
            onStatusChange={setSelectedUser}
          />
          <Pagination
            page={page}
            total={data.total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="usuarios"
          />
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <p className="text-lg font-semibold text-muted-foreground">
            No hay usuarios registrados aún
          </p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Comienza creando el primer usuario del sistema.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white text-sm font-bold rounded-lg shadow-sm shadow-brand-primary/10 transition-all duration-200 cursor-pointer"
          >
            Crear Usuario
          </button>
        </div>
      )}
      <UserStatusModal
        show={selectedUser !== null}
        userName={selectedUser ? `${selectedUser.name} ${selectedUser.apellido_paterno} ${selectedUser.apellido_materno}` : ""}
        currentStatus={selectedUser?.estado ?? false}
        onConfirm={() => {
          if (selectedUser) {
            mutate({ userId: selectedUser.id_user, estado: !selectedUser.estado });
            setSelectedUser(null);
          }
        }}
        onClose={() => setSelectedUser(null)}
      />
      <EditUserModal
        isOpen={editingUserId !== null}
        onClose={() => setEditingUserId(null)}
        userId={editingUserId!}
      />
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      {resetPasswordUserId && (
        <ResetPasswordModal
          userId={resetPasswordUserId.id}
          userName={resetPasswordUserId.name}
          onClose={() => setResetPasswordUserId(null)}
        />
      )}
    </div>
  );
})

export default UserList
