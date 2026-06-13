import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Key, Pencil, ChevronLeft, ChevronRight } from "lucide-react"
import { getAllUsers, updateUserStatus } from "@/features/shared/actions/admin.api";
import { getRoles, getSedes } from "@/features/shared/actions/centralizado.api";
import Spinner from "@/components/ui/Spinner";
import UserStatusModal from "@/features/admin/components/UserStatusModal";
import UserModal from "@/features/admin/components/UserModal";
import ResetPasswordModal from "@/features/admin/components/ResetPasswordModal";
import { UserAdmin } from "@/features/admin/schemas/user.schema";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

export default function UserList() {

  const queryClient = useQueryClient()
  const [selectedUser, setSelectedUser] = useState<UserAdmin | null>(null)
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [resetPasswordUserId, setResetPasswordUserId] = useState<{ id: number; name: string } | null>(null)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", { page, limit: PAGE_SIZE }],
    queryFn: () => getAllUsers(page, PAGE_SIZE),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
    staleTime: 5 * 60 * 1000,
  });

  const { data: sedes } = useQuery({
    queryKey: ["sedes"],
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
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: (error) => {
      console.error(error.message)
    },
  });

  if (isLoading) return <Spinner />;

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
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Gestión de usuarios</h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
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
        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <Table>
            <TableHeader className="bg-brand-primary">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="px-6 py-2.5 text-left text-[10px] font-extrabold text-white uppercase tracking-wider">
                  Usuario
                </TableHead>
                <TableHead className="px-6 py-2.5 text-left text-[10px] font-extrabold text-white uppercase tracking-wider">
                  DNI
                </TableHead>
                <TableHead className="px-6 py-2.5 text-left text-[10px] font-extrabold text-white uppercase tracking-wider">
                  Rol / Área
                </TableHead>
                <TableHead className="px-6 py-2.5 text-left text-[10px] font-extrabold text-white uppercase tracking-wider">
                  Estado
                </TableHead>
                <TableHead className="px-6 py-2.5 text-left text-[10px] font-extrabold text-white uppercase tracking-wider">
                  Sede
                </TableHead>
                <TableHead className="px-6 py-2.5 text-right text-[10px] font-extrabold text-white uppercase tracking-wider">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.users.map((user: UserAdmin) => (
                <TableRow key={user.id_user} className="hover:bg-slate-50/40 transition-colors duration-150 group">
                  <TableCell className="px-6 py-2.5 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0 select-none group-hover:border-brand-primary/20 group-hover:bg-brand-primary/[0.02] transition-colors duration-150">
                        {user.name.charAt(0).toUpperCase()}
                        {user.apellido_paterno?.charAt(0).toUpperCase() || ""}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-700 truncate group-hover:text-slate-900 transition-colors duration-150">
                          {user.name} {user.apellido_paterno} {user.apellido_materno || ""}
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal truncate mt-0">
                          {user.email} <span className="text-slate-300 mx-0.5 font-light">•</span> @{user.username}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-2.5 whitespace-nowrap">
                    <div className="text-xs text-slate-500 font-medium">{user.dni || "—"}</div>
                  </TableCell>
                  <TableCell className="px-6 py-2.5 whitespace-nowrap">
                    {user.userRoles && user.userRoles.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.userRoles.slice(0, 2).map(r => (
                          <span key={Number(r.rol_id)} className="px-2 py-0.5 text-[9px] rounded bg-slate-50 text-slate-500 border border-slate-100 font-medium whitespace-nowrap">
                            {roleMap.get(Number(r.rol_id)) ?? "—"}
                          </span>
                        ))}
                        {user.userRoles.length > 2 && (
                          <span className="px-2 py-0.5 text-[9px] rounded bg-brand-primary/10 text-brand-primary border border-brand-primary/20 font-medium whitespace-nowrap">
                            +{user.userRoles.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-slate-700">Sin rol</div>
                    )}
                    <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                      {user.area?.nombre_area
                        ? user.area.nombre_area.charAt(0).toUpperCase() + user.area.nombre_area.slice(1)
                        : "Sin área"}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-2.5 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                        user.estado
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-slate-50 text-slate-500 border-slate-100"
                      }`}
                      title="Click para cambiar estado"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${user.estado ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                      {user.estado ? "Activo" : "Inactivo"}
                    </button>
                  </TableCell>
                  <TableCell className="px-6 py-2.5">
                    {user.userSedes && user.userSedes.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.userSedes.slice(0, 2).map(s => (
                          <span key={Number(s.sede_id)} className="px-2 py-0.5 text-[9px] rounded bg-slate-50 text-slate-500 border border-slate-100 font-medium whitespace-nowrap">
                            {sedeMap.get(Number(s.sede_id)) ?? "—"}
                          </span>
                        ))}
                        {user.userSedes.length > 2 && (
                          <span className="px-2 py-0.5 text-[9px] rounded bg-brand-primary/10 text-brand-primary border border-brand-primary/20 font-medium whitespace-nowrap">
                            +{user.userSedes.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-300 font-light">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-2.5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingUserId(user.id_user)}
                        className="p-1 text-slate-400 hover:text-brand-primary hover:bg-slate-50 rounded-lg transition-all duration-200 cursor-pointer"
                        title="Editar usuario"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setResetPasswordUserId({ id: user.id_user, name: `${user.name} ${user.apellido_paterno}` })}
                        className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all duration-200 cursor-pointer"
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
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/20">
            <p className="text-xs text-slate-400 font-medium">
              Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.total)} de {data.total} usuarios
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.ceil(data.total / PAGE_SIZE) }, (_, i) => i + 1)
                .reduce<(number | "...")[]>((pages, p, _i, all) => {
                  const first = p === 1;
                  const last = p === all.length;
                  const near = Math.abs(p - page) <= 1;
                  const prevIsEllipsis = pages[pages.length - 1] === "...";
                  if (first || last || near) {
                    pages.push(p);
                  } else if (!prevIsEllipsis) {
                    pages.push("...");
                  }
                  return pages;
                }, [])
                .map((item, i) =>
                  item === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-xs text-slate-300 select-none">
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`min-w-[28px] h-7 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer ${
                        item === page
                          ? "bg-brand-primary text-white shadow-sm"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              <button
                disabled={page * PAGE_SIZE >= data.total}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Página siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <p className="text-lg font-semibold text-slate-500">
            No hay usuarios registrados aún
          </p>
          <p className="text-sm text-slate-400 mt-1 mb-6">
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
      <UserModal
        mode="edit"
        isOpen={editingUserId !== null}
        onClose={() => setEditingUserId(null)}
        userId={editingUserId}
      />
      <UserModal
        mode="create"
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
}
