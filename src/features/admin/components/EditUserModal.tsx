import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { userEditSchema } from "@/features/admin/schemas/user.schema"
import type { UserFormData, UpdateUserProfilePayload } from "@/features/admin/schemas/user.schema"
import { getUserById, updateUserProfileApi } from "@/features/admin/actions/admin.api"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { USERS_KEY, USER_DETAIL_KEY } from "@/features/admin/lib/admin-keys"
import { ROLES_KEY, SEDES_KEY, AREAS_KEY } from "@/features/shared/lib/shared-keys"
import { getRoles, getSedes, getAreas } from "@/features/shared/actions/centralizado.api"
import { toast } from "sonner"
import UserFormFields from "./UserFormFields"

type EditUserModalProps = {
  isOpen: boolean
  onClose: () => void
  userId: number
}

export default function EditUserModal({ isOpen, onClose, userId }: EditUserModalProps) {
  const queryClient = useQueryClient()
  const [showPassword, setShowPassword] = useState(false)
  const [dniError, setDniError] = useState<string | null>(null)
  const [selectedSedeIds, setSelectedSedeIds] = useState<number[]>([])
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])

  const { data: user, isError, error } = useQuery({
    queryKey: USER_DETAIL_KEY(userId),
    queryFn: () => getUserById(userId),
    enabled: isOpen,
  })

  const { data: roles, isLoading: rolesLoading, isError: rolesError } = useQuery({
    queryKey: ROLES_KEY,
    queryFn: getRoles,
    enabled: isOpen,
  })

  const { data: areas, isLoading: areasLoading, isError: areasError } = useQuery({
    queryKey: AREAS_KEY,
    queryFn: getAreas,
    enabled: isOpen,
  })

  const { data: sedes } = useQuery({
    queryKey: SEDES_KEY,
    queryFn: getSedes,
    enabled: isOpen,
  })

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      name: "",
      apellido_paterno: "",
      apellido_materno: "",
      telefono: "",
      dni: "",
      username: "",
      email: "",
      password: "",
      area_id: "",
    },
  })

  useEffect(() => {
    if (user && isOpen) {
      reset({
        name: user.name,
        apellido_paterno: user.apellido_paterno ?? "",
        apellido_materno: user.apellido_materno ?? "",
        telefono: user.telefono ?? "",
        dni: user.dni ?? "",
        email: user.email,
        username: user.username,
        area_id: user.area?.id_area?.toString() ?? "",
      })
      setSelectedSedeIds(user.userSedes?.map((s: { sede_id: number }) => Number(s.sede_id)) ?? [])
      setSelectedRoleIds(user.userRoles?.map((r: { rol_id: number }) => Number(r.rol_id)) ?? [])
    }
  }, [user, isOpen, reset])

  const { mutateAsync } = useMutation({
    mutationFn: ({ uid, data }: { uid: number; data: UpdateUserProfilePayload }) =>
      updateUserProfileApi(uid, data as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
      queryClient.invalidateQueries({ queryKey: USER_DETAIL_KEY(userId) })
      toast.success("Los datos del usuario han sido actualizados correctamente")
      setDniError(null)
      onClose()
    },
    onError: (error: Error) => {
      if (error.message.includes("DNI ya está en uso")) {
        setDniError("El DNI ya está en uso")
      } else {
        toast.error(error.message)
      }
    },
  })

  const onSubmit = async (formData: UserFormData) => {
    if (!user) return
    const { dni, area_id, ...rest } = formData
    const payload: UpdateUserProfilePayload = { ...rest }
    if (dni && dni.trim() !== "") payload.dni = dni.trim()
    if (area_id) payload.area_id = parseInt(area_id, 10)
    payload.sede_ids = selectedSedeIds.map(Number)
    payload.rol_ids = selectedRoleIds.map(Number)
    await mutateAsync({ uid: user.id_user, data: payload })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
        </DialogHeader>

        {isError && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive text-center">
            Error al cargar los datos del usuario. {error?.message}
            <button onClick={onClose} className="ml-2 underline font-semibold hover:no-underline cursor-pointer">Cerrar</button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <UserFormFields
            mode="edit"
            register={register}
            errors={errors}
            control={control}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            dniError={dniError}
            roles={roles}
            rolesLoading={rolesLoading}
            rolesError={rolesError}
            areas={areas}
            areasLoading={areasLoading}
            areasError={areasError}
            sedes={sedes?.map((s) => ({ id: Number(s.id), nombre: s.nombre }))}
            selectedSedeIds={selectedSedeIds}
            onSedeChange={setSelectedSedeIds}
            selectedRoleIds={selectedRoleIds}
            onRoleChange={setSelectedRoleIds}
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
