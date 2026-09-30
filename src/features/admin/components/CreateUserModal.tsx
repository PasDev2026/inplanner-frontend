import { useEffect, useState, type ReactNode } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { AREAS_KEY } from "@/features/shared/lib/shared-keys"
import {
  getAreas,
  getRoles,
  getSedes,
} from "@/features/shared/actions/centralizado.api"
import {
  createUser,
  getTiposDocumento,
  type CreateUserPayload,
} from "../actions/admin.api"
import { USERS_KEY } from "../lib/admin-keys"
import {
  createUserSchema,
  type CreateUserForm,
} from "../schemas/create-user.schema"
import { useConsultaDni } from "../hooks/useConsultaDni"
import { useFormDraft } from "../hooks/useFormDraft"
import CreateUserAssignments from "./CreateUserAssignments"
import FormDraftBanner from "./FormDraftBanner"

type CreateUserModalProps = {
  isOpen: boolean
  onClose: () => void
}

const DEFAULT_VALUES: CreateUserForm = {
  tipo_documento_uuid: "",
  numero_documento: "",
  nombres: "",
  apellido_paterno: "",
  apellido_materno: "",
  fecha_nacimiento: "",
  sexo: "M",
  email: "",
  telefono: "",
  direccion: "",
  password: "",
  repetir_password: "",
  area_id: "",
  asignaciones: [{ sede_uuid: "", rol_uuid: "" }],
}

function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor?: string
  children: ReactNode
  required?: boolean
}) {
  return (
    <Label htmlFor={htmlFor} className="text-xs font-medium text-foreground">
      {children}
      {required && <span className="text-destructive"> *</span>}
    </Label>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-destructive">{message}</p>
}

export default function CreateUserModal({
  isOpen,
  onClose,
}: CreateUserModalProps) {
  const queryClient = useQueryClient()
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeat, setShowRepeat] = useState(false)

  const { data: tiposDocumento = [] } = useQuery({
    queryKey: ["tiposDocumento"],
    queryFn: getTiposDocumento,
    enabled: isOpen,
    staleTime: 5 * 60_000,
  })
  const { data: roles = [] } = useQuery({
    queryKey: ["centralizado", "roles"],
    queryFn: getRoles,
    enabled: isOpen,
    staleTime: 5 * 60_000,
  })
  const { data: sedes = [] } = useQuery({
    queryKey: ["centralizado", "sedes"],
    queryFn: getSedes,
    enabled: isOpen,
    staleTime: 5 * 60_000,
  })
  const { data: areas = [] } = useQuery({
    queryKey: AREAS_KEY,
    queryFn: getAreas,
    enabled: isOpen,
    staleTime: 5 * 60_000,
  })

  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onBlur",
  })
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form

  const dni = useConsultaDni(form, tiposDocumento)

  const { hasDraft, resetToDraft, clear, discard } = useFormDraft(form, {
    formId: "create-user",
    enabled: isOpen,
    defaults: DEFAULT_VALUES,
    exclude: ["password", "repetir_password"],
  })

  useEffect(() => {
    if (isOpen) resetToDraft()
  }, [isOpen, resetToDraft])

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
      toast.success("Usuario creado correctamente")
      clear()
      onClose()
    },
    onError: (error) => toast.error((error as Error).message),
  })

  const onSubmit = async (values: CreateUserForm) => {
    const payload: CreateUserPayload = {
      tipo_documento_uuid: values.tipo_documento_uuid,
      numero_documento: values.numero_documento.trim(),
      nombres: values.nombres.trim(),
      apellido_paterno: values.apellido_paterno.trim(),
      apellido_materno: values.apellido_materno?.trim() || undefined,
      fecha_nacimiento: values.fecha_nacimiento,
      sexo: values.sexo,
      email: values.email.trim(),
      telefono: values.telefono?.trim() || undefined,
      direccion: values.direccion?.trim() || undefined,
      password: values.password,
      repetir_password: values.repetir_password,
      area_id: values.area_id ? Number(values.area_id) : undefined,
      asignaciones: values.asignaciones,
    }
    await mutateAsync(payload)
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nuevo usuario</DialogTitle>
          <DialogDescription>
            Complete los datos del usuario. Los campos marcados con * son
            obligatorios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {hasDraft && (
            <FormDraftBanner hasDraft={hasDraft} onDiscard={discard} />
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <FieldLabel required>Tipo de documento</FieldLabel>
              <Controller
                control={control}
                name="tipo_documento_uuid"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger>
                      <Select.Value placeholder="Seleccionar">
                        {
                          tiposDocumento.find(
                            (t) => t.uuid_tipo_documento === field.value,
                          )?.nombre
                        }
                      </Select.Value>
                    </Select.Trigger>
                    <Select.Popup>
                      <Select.List>
                        {tiposDocumento.map((tipo) => (
                          <Select.Item
                            key={tipo.uuid_tipo_documento}
                            value={tipo.uuid_tipo_documento}
                          >
                            {tipo.nombre}
                          </Select.Item>
                        ))}
                      </Select.List>
                    </Select.Popup>
                  </Select>
                )}
              />
              <FieldError message={errors.tipo_documento_uuid?.message} />
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="numero_documento" required>
                Número de documento
              </FieldLabel>
              <Controller
                control={control}
                name="numero_documento"
                render={({ field }) => (
                  <Input
                    id="numero_documento"
                    inputMode={dni.inputMode}
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(
                        dni.sanitize ? dni.sanitize(e.target.value) : e.target.value,
                      )
                    }
                    onKeyDown={dni.onKeyDown}
                  />
                )}
              />
              {dni.esDni && (
                <p className="text-xs text-muted-foreground">
                  {dni.isBuscandoDni
                    ? "Consultando SUNAT..."
                    : "Presiona Enter para buscar en SUNAT"}
                </p>
              )}
              <FieldError message={errors.numero_documento?.message} />
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="nombres" required>
                Nombres
              </FieldLabel>
              <Input
                id="nombres"
                disabled={dni.isBuscandoDni}
                {...register("nombres")}
              />
              <FieldError message={errors.nombres?.message} />
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="apellido_paterno" required>
                Apellido paterno
              </FieldLabel>
              <Input
                id="apellido_paterno"
                disabled={dni.isBuscandoDni}
                {...register("apellido_paterno")}
              />
              <FieldError message={errors.apellido_paterno?.message} />
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="apellido_materno">Apellido materno</FieldLabel>
              <Input
                id="apellido_materno"
                disabled={dni.isBuscandoDni}
                {...register("apellido_materno")}
              />
              <FieldError message={errors.apellido_materno?.message} />
            </div>

            <div className="space-y-1.5">
              <FieldLabel required>Sexo</FieldLabel>
              <Controller
                control={control}
                name="sexo"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger>
                      <Select.Value placeholder="Seleccionar">
                        {field.value === "M" ? "Masculino" : "Femenino"}
                      </Select.Value>
                    </Select.Trigger>
                    <Select.Popup>
                      <Select.List>
                        <Select.Item value="M">Masculino</Select.Item>
                        <Select.Item value="F">Femenino</Select.Item>
                      </Select.List>
                    </Select.Popup>
                  </Select>
                )}
              />
              <FieldError message={errors.sexo?.message} />
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="telefono">Teléfono</FieldLabel>
              <Input id="telefono" {...register("telefono")} />
              <FieldError message={errors.telefono?.message} />
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="email" required>
                Correo
              </FieldLabel>
              <Input id="email" type="email" {...register("email")} />
              <FieldError message={errors.email?.message} />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <FieldLabel htmlFor="fecha_nacimiento" required>
                Fecha de nacimiento
              </FieldLabel>
              <Input
                id="fecha_nacimiento"
                type="date"
                {...register("fecha_nacimiento")}
              />
              <FieldError message={errors.fecha_nacimiento?.message} />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <FieldLabel htmlFor="area_id">
                Área (solo Inplanner, opcional)
              </FieldLabel>
              <Controller
                control={control}
                name="area_id"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Seleccionar">
                        {
                          areas.find((a) => String(a.id_area) === field.value)
                            ?.nombre_area
                        }
                      </Select.Value>
                    </Select.Trigger>
                    <Select.Popup>
                      <Select.List>
                        {areas.map((area) => (
                          <Select.Item
                            key={area.id_area}
                            value={String(area.id_area)}
                          >
                            {area.nombre_area}
                          </Select.Item>
                        ))}
                      </Select.List>
                    </Select.Popup>
                  </Select>
                )}
              />
            </div>

            <CreateUserAssignments
              control={control}
              errors={errors}
              sedes={sedes}
              roles={roles}
            />

            <div className="space-y-1.5">
              <FieldLabel htmlFor="password" required>
                Contraseña
              </FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>
              <FieldError message={errors.password?.message} />
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="repetir_password" required>
                Repetir contraseña
              </FieldLabel>
              <div className="relative">
                <Input
                  id="repetir_password"
                  type={showRepeat ? "text" : "password"}
                  className="pr-10"
                  {...register("repetir_password")}
                />
                <button
                  type="button"
                  onClick={() => setShowRepeat((v) => !v)}
                  aria-label={showRepeat ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showRepeat ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>
              <FieldError message={errors.repetir_password?.message} />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creando...
                </>
              ) : (
                "Registrar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
