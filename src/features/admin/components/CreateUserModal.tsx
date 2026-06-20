import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { userCreateSchema } from "@/features/admin/schemas/user.schema"
import type { UserFormData } from "@/features/admin/schemas/user.schema"
import { createUserByAdmin } from "@/features/shared/actions/admin.api"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { USERS_KEY } from "@/features/admin/lib/admin-keys"
import { ROLES_KEY, SEDES_KEY, AREAS_KEY } from "@/features/shared/lib/shared-keys"
import { getRoles, getSedes, getAreas } from "@/features/shared/actions/centralizado.api"
import { toast } from "sonner"
import UserFormFields from "./UserFormFields"

type CreateUserModalProps = {
  isOpen: boolean
  onClose: () => void
}

const emptyValues: UserFormData = {
  name: "",
  apellido_paterno: "",
  apellido_materno: "",
  telefono: "",
  dni: "",
  username: "",
  email: "",
  password: "",
  area_id: "",
}

export default function CreateUserModal({ isOpen, onClose }: CreateUserModalProps) {
  const queryClient = useQueryClient()
  const [showPassword, setShowPassword] = useState(false)
  const [dniError, setDniError] = useState<string | null>(null)
  const [selectedSedeIds, setSelectedSedeIds] = useState<number[]>([])
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])

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
    resolver: zodResolver(userCreateSchema),
    defaultValues: emptyValues,
  })

  const { mutate } = useMutation({
    mutationFn: (data: Record<string, unknown>) => createUserByAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
      toast.success("El usuario ha sido creado correctamente")
      reset()
      setDniError(null)
      setSelectedSedeIds([])
      setSelectedRoleIds([])
      onClose()
    },
    onError: (error: Error) => {
      if (error.message.includes("DNI ya está en uso")) {
        setDniError("El DNI ya está en uso")
      } else if (error.message.includes("email ya está en uso")) {
        toast.error("El correo electrónico ya está registrado")
      } else if (error.message.includes("username ya esta en uso")) {
        toast.error("El nombre de usuario ya está registrado")
      } else {
        toast.error(error.message)
      }
    },
  })

  const onSubmit = (formData: UserFormData) => {
    const payload: Record<string, unknown> = {
      name: formData.name,
      apellido_paterno: formData.apellido_paterno,
      apellido_materno: formData.apellido_materno,
      telefono: formData.telefono,
      dni: formData.dni,
      username: formData.username,
      password: formData.password,
    }
    if (formData.email) payload.email = formData.email
    if (formData.area_id) payload.area_id = parseInt(formData.area_id, 10)
    payload.sede_ids = selectedSedeIds.map(Number)
    payload.rol_ids = selectedRoleIds.map(Number)
    mutate(payload)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear usuario</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <UserFormFields
            mode="create"
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
              {isSubmitting ? "Creando..." : "Crear usuario"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
