import { useState, useEffect, useMemo, memo } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { USERS_KEY, USERS_PAGINATED_KEY } from "@/features/admin/lib/admin-keys";
import { AREAS_KEY, SEDES_KEY } from "@/features/shared/lib/shared-keys";
import { Pencil } from "lucide-react"
import { getAllUsers, updateUserStatus } from "@/features/admin/actions/admin.api";
import { getAreas, getSedes } from "@/features/shared/actions/centralizado.api";
import PageSpinner from "@/components/ui/PageSpinner";
import UserStatusModal from "@/features/admin/components/UserStatusModal";
import EditUserModal from "@/features/admin/components/EditUserModal";
import { Pagination } from "@/components/ui/pagination";
import { UserAdmin } from "@/features/admin/schemas/user.schema";
import { Card, CardContent } from "@/components/ui/card";
import { UserFilters } from "@/features/admin/components/UserFilters";
import { useUserListFilters } from "@/features/admin/hooks/useUserListFilters";
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
  sedesMap: Map<string, string>
  onEdit: (id: string) => void
  onStatusChange: (user: UserAdmin) => void
}

const UserTable = memo(function UserTable({
  users, sedesMap, onEdit, onStatusChange
}: UserTableProps) {
  return (
    <Table>
      <TableHeader className="bg-brand-primary">
        <TableRow className="hover:bg-transparent border-none">
          <TableHead className="px-6 py-2.5 text-left text-[10px] font-extrabold text-white uppercase tracking-wider">Usuario</TableHead>
          <TableHead className="px-6 py-2.5 text-left text-[10px] font-extrabold text-white uppercase tracking-wider">N° Documento</TableHead>
          <TableHead className="px-6 py-2.5 text-left text-[10px] font-extrabold text-white uppercase tracking-wider">Sede</TableHead>
          <TableHead className="px-6 py-2.5 text-left text-[10px] font-extrabold text-white uppercase tracking-wider">Área</TableHead>
          <TableHead className="px-6 py-2.5 text-left text-[10px] font-extrabold text-white uppercase tracking-wider">Estado</TableHead>
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
                    {user.email}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell className="px-6 py-2.5 whitespace-nowrap">
              <div className="text-xs text-muted-foreground font-medium">{user.numero_documento || "—"}</div>
            </TableCell>
            <TableCell className="px-6 py-2.5 whitespace-nowrap">
              <div className="text-[11px] text-muted-foreground font-normal">
                {sedesMap.get(user.sede_id ?? "") ?? "Sin sede"}
              </div>
            </TableCell>
            <TableCell className="px-6 py-2.5 whitespace-nowrap">
              <div className="text-[11px] text-muted-foreground font-normal">
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
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  const {
    filters,
    onFiltersChange,
    clearAllFilters,
  } = useUserListFilters()

  const { data, isLoading, isError } = useQuery({
    queryKey: USERS_PAGINATED_KEY(page, PAGE_SIZE, filters),
    queryFn: () => getAllUsers(page, PAGE_SIZE, {
      search: filters.search || undefined,
      estado: filters.estado || undefined,
      area_id: filters.area_id || undefined,
      sede_id: filters.sede_id || undefined,
    }),
    placeholderData: keepPreviousData,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => { setPage(1) }, [filters])

  const { data: areas } = useQuery({
    queryKey: AREAS_KEY,
    queryFn: getAreas,
    staleTime: 5 * 60 * 1000,
  });

  const { data: sedes } = useQuery({
    queryKey: SEDES_KEY,
    queryFn: getSedes,
    staleTime: 5 * 60 * 1000,
  });

  const sedesMap = useMemo(() => {
    if (!sedes) return new Map<string, string>()
    return new Map(sedes.map(s => [s.id, s.nombre]))
  }, [sedes])

  const areasForFilter = useMemo(() => {
    if (!areas) return []
    return areas.map(a => ({ id: String(a.id_area), nombre: a.nombre_area }))
  }, [areas])

  const { mutate } = useMutation({
    mutationFn: ({ userId, estado }: { userId: string; estado: boolean }) =>
      updateUserStatus(userId, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
    },
    onError: (error) => {
      console.error(error.message)
    },
  });

  if (isLoading && !data) return <PageSpinner />;

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
      <Card>
        <CardContent className="p-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Gestión de usuarios</h1>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              Administra los usuarios del sistema
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <UserFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
            areas={areasForFilter}
            sedes={sedes ?? []}
            onClearAll={clearAllFilters}
          />
        </CardContent>
      </Card>

      {data && data.users.length ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <UserTable
            users={data.users}
            sedesMap={sedesMap}
            onEdit={setEditingUserId}
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
            No hay coincidencias con los filtros aplicados
          </p>
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
    </div>
  );
})

export default UserList
