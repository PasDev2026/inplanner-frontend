import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { userFormSchema, UserFormData, Role, Area, UpdateUserProfilePayload } from "@/features/admin/schemas/user.schema"
import { getUserById, updateUserProfileApi, createUserByAdmin } from "@/features/shared/actions/admin.api"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { getRoles, getSedes, getAreas } from "@/features/shared/actions/centralizado.api"
import { toast } from "sonner"
import TagInput from "@/components/ui/TagInput"

type UserModalProps = {
  mode: "create" | "edit"
  isOpen: boolean
  onClose: () => void
  userId?: number | null
}

export default function UserModal({ mode, isOpen, onClose, userId }: UserModalProps) {
  const queryClient = useQueryClient()
  const isEdit = mode === "edit"
  const [showPassword, setShowPassword] = useState(false)
  const [dniError, setDniError] = useState<string | null>(null)
  const [selectedSedeIds, setSelectedSedeIds] = useState<number[]>([])
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])

  const { data: user, isError, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId!),
    enabled: isOpen && isEdit && !!userId,
  })

  const { data: roles, isLoading: rolesLoading, isError: rolesError } = useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
    enabled: isOpen,
  })

  const { data: areas, isLoading: areasLoading, isError: areasError } = useQuery({
    queryKey: ["areas"],
    queryFn: getAreas,
    enabled: isOpen,
  })

  const { data: sedes } = useQuery({
    queryKey: ["sedes"],
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
    resolver: zodResolver(userFormSchema),
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
    if (user && isOpen && isEdit) {
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
  }, [user, isOpen, isEdit, reset])

  const onSuccessEdit = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] })
    queryClient.invalidateQueries({ queryKey: ["user", userId] })
    toast.success("Los datos del usuario han sido actualizados correctamente")
    setDniError(null)
    onClose()
  }

  const onSuccessCreate = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] })
    toast.success("El usuario ha sido creado correctamente")
    reset()
    setDniError(null)
    setSelectedSedeIds([])
    setSelectedRoleIds([])
    onClose()
  }

  const onError = (error: Error) => {
    if (error.message.includes("DNI ya está en uso")) {
      setDniError("El DNI ya está en uso")
    } else if (!isEdit && error.message.includes("email ya está en uso")) {
      toast.error("El correo electrónico ya está registrado")
    } else if (!isEdit && error.message.includes("username ya esta en uso")) {
      toast.error("El nombre de usuario ya está registrado")
    } else {
      toast.error(error.message)
    }
  }

  const editMutation = useMutation({
    mutationFn: ({ uid, data }: { uid: number; data: UpdateUserProfilePayload }) =>
      updateUserProfileApi(uid, data as Record<string, unknown>),
    onSuccess: onSuccessEdit,
    onError,
  })

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createUserByAdmin(data),
    onSuccess: onSuccessCreate,
    onError,
  })

  const onSubmit = (formData: UserFormData) => {
    if (isEdit) {
      if (!user) return
      const { dni, area_id, ...rest } = formData
      const payload: UpdateUserProfilePayload = { ...rest }
      if (dni && dni.trim() !== "") payload.dni = dni.trim()
      if (area_id) payload.area_id = parseInt(area_id, 10)
      payload.sede_ids = selectedSedeIds.map(Number)
      payload.rol_ids = selectedRoleIds.map(Number)
      editMutation.mutate({ uid: user.id_user, data: payload })
    } else {
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
      createMutation.mutate(payload)
    }
  }

  const title = isEdit ? "Editar usuario" : "Crear usuario"
  const submitLabel = isEdit ? "Guardar cambios" : "Crear usuario"

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {isEdit && isError && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive text-center">
            Error al cargar los datos del usuario. {error?.message}
            <button onClick={onClose} className="ml-2 underline font-semibold hover:no-underline cursor-pointer">Cerrar</button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${mode}-name`}>Nombre</Label>
                <Input id={`${mode}-name`} {...register("name")} />
                {errors.name && <p className="text-xs text-destructive font-medium">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${mode}-apellido_paterno`}>Apellido paterno</Label>
                <Input id={`${mode}-apellido_paterno`} {...register("apellido_paterno")} />
                {errors.apellido_paterno && <p className="text-xs text-destructive font-medium">{errors.apellido_paterno.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${mode}-apellido_materno`}>Apellido materno</Label>
                <Input id={`${mode}-apellido_materno`} {...register("apellido_materno")} />
                {errors.apellido_materno && <p className="text-xs text-destructive font-medium">{errors.apellido_materno.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${mode}-telefono`}>Teléfono</Label>
                <Input
                  id={`${mode}-telefono`}
                  type="tel"
                  placeholder="9 dígitos"
                  {...register("telefono", {
                    onChange: (e) => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 9) },
                  })}
                />
                {errors.telefono && <p className="text-xs text-destructive font-medium">{errors.telefono.message}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${mode}-dni`}>DNI {isEdit ? "(opcional)" : ""}</Label>
                <Input
                  id={`${mode}-dni`}
                  type="text"
                  placeholder="Máximo 8 dígitos"
                  {...register("dni", {
                    onChange: (e) => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 8) },
                  })}
                />
                {errors.dni && <p className="text-xs text-destructive font-medium">{errors.dni.message}</p>}
                {dniError && <p className="text-xs text-destructive font-medium">{dniError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${mode}-email`}>Email</Label>
                <Input id={`${mode}-email`} type="email" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive font-medium">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${mode}-username`}>Username</Label>
                <Input
                  id={`${mode}-username`}
                  disabled={isEdit}
                  {...register("username")}
                />
                {errors.username && <p className="text-xs text-destructive font-medium">{errors.username.message}</p>}
              </div>

              {!isEdit && (
                <div className="space-y-2">
                  <Label htmlFor={`${mode}-password`}>Contraseña</Label>
                  <div className="relative">
                    <Input
                      id={`${mode}-password`}
                      type={showPassword ? "text" : "password"}
                      className="pr-16"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showPassword ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive font-medium">{errors.password.message}</p>}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 border-t pt-5">
            <div className="space-y-2">
              <Label htmlFor={`${mode}-area_id`}>Área</Label>
              {areasLoading ? (
                <div className="w-full px-3 py-2 border rounded-lg text-sm text-muted-foreground select-none">
                  Cargando áreas...
                </div>
              ) : areasError ? (
                <div className="w-full px-3 py-2 border border-destructive/20 rounded-lg text-sm bg-destructive/10 text-destructive">
                  Error al cargar las áreas
                </div>
              ) : (
                <Controller
                  name="area_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                    >
                      <Select.Trigger id={`${mode}-area_id`}>
                        <Select.Value placeholder="-- Selecciona --">
                          {field.value ? areas?.find((a: Area) => a.id_area.toString() === field.value)?.nombre_area : ""}
                        </Select.Value>
                      </Select.Trigger>
                      <Select.Popup>
                        <Select.List>
                          {areas?.map((area: Area) => (
                            <Select.Item key={area.id_area} value={area.id_area.toString()}>
                              {area.nombre_area}
                            </Select.Item>
                          ))}
                        </Select.List>
                      </Select.Popup>
                    </Select>
                  )}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Roles</Label>
              {rolesLoading ? (
                <div className="w-full px-3 py-2 border rounded-lg text-sm text-muted-foreground select-none">
                  Cargando roles...
                </div>
              ) : rolesError ? (
                <div className="w-full px-3 py-2 border border-destructive/20 rounded-lg text-sm bg-destructive/10 text-destructive">
                  Error al cargar los roles
                </div>
              ) : (
                <TagInput
                  label=""
                  options={roles?.map((r: Role) => ({ id: Number(r.id), nombre: r.nombre })) ?? []}
                  value={selectedRoleIds}
                  onChange={setSelectedRoleIds}
                  placeholder="Buscar roles..."
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Sedes</Label>
              <TagInput
                label=""
                options={sedes?.map((s) => ({ id: Number(s.id), nombre: s.nombre })) ?? []}
                value={selectedSedeIds}
                onChange={setSelectedSedeIds}
                placeholder="Buscar sedes..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (isEdit ? "Guardando..." : "Creando...") : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
