import { useEffect } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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
import { AREAS_KEY, SEDES_KEY } from "@/features/shared/lib/shared-keys"
import {
  getAreas,
  getRoles,
  getSedes,
} from "@/features/shared/actions/centralizado.api"
import {
  getUserAssignments,
  getUserById,
  updateUserProfileApi,
  type UserAssignment,
} from "../actions/admin.api"
import {
  USERS_KEY,
  USER_ASSIGNMENTS_KEY,
  USER_DETAIL_KEY,
} from "../lib/admin-keys"
import { userEditSchema, type UserEditForm } from "../schemas/user.schema"
import UserReadonlyFields from "./UserReadonlyFields"

type EditUserModalProps = {
  isOpen: boolean
  onClose: () => void
  userId: string
}

const EMPTY_ASSIGNMENTS: UserAssignment[] = []

export default function EditUserModal({
  isOpen,
  onClose,
  userId,
}: EditUserModalProps) {
  const queryClient = useQueryClient()

  const { data: user, isError, error } = useQuery({
    queryKey: USER_DETAIL_KEY(userId),
    queryFn: () => getUserById(userId),
    enabled: isOpen,
  })

  const { data: areas, isLoading: areasLoading } = useQuery({
    queryKey: AREAS_KEY,
    queryFn: getAreas,
    enabled: isOpen,
  })

  const { data: sedes } = useQuery({
    queryKey: SEDES_KEY,
    queryFn: getSedes,
    enabled: isOpen,
    staleTime: 5 * 60_000,
  })

  const { data: roles = [] } = useQuery({
    queryKey: ["centralizado", "roles"],
    queryFn: getRoles,
    enabled: isOpen,
    staleTime: 5 * 60_000,
  })

  const { data: assignments = EMPTY_ASSIGNMENTS } = useQuery({
    queryKey: USER_ASSIGNMENTS_KEY(userId),
    queryFn: () => getUserAssignments(userId),
    enabled: isOpen,
  })

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserEditForm>({
    resolver: zodResolver(userEditSchema),
    defaultValues: { area_id: "", asignaciones: [] },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "asignaciones",
  })

  useEffect(() => {
    if (user && isOpen) {
      reset({
        area_id: user.area?.id_area?.toString() ?? "",
        asignaciones: assignments.map((assignment) => ({
          ...assignment,
          is_new: false,
        })),
      })
    }
  }, [user, isOpen, assignments, reset])

  const watchedAssignments = watch("asignaciones") ?? []

  const usedSedes = new Set(
    watchedAssignments
      .map((assignment) => assignment.sede_uuid)
      .filter(Boolean),
  )

  const addAssignment = () =>
    append({
      sede_uuid: "",
      rol_uuid: "",
      especialidad_uuids: [],
      is_new: true,
    })

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({
      uid,
      data,
    }: {
      uid: string
      data: { area_id?: string; asignaciones?: UserAssignment[] }
    }) => updateUserProfileApi(uid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
      queryClient.invalidateQueries({ queryKey: USER_DETAIL_KEY(userId) })
      toast.success("Usuario actualizado correctamente")
      onClose()
    },
    onError: (err) => toast.error((err as Error).message),
  })

  const onSubmit = async (formData: UserEditForm) => {
    if (!user) return
    const payload: { area_id?: string; asignaciones?: UserAssignment[] } = {}
    if (formData.area_id) payload.area_id = formData.area_id
    if (formData.asignaciones?.length) {
      payload.asignaciones = formData.asignaciones.map((assignment) => ({
        sede_uuid: assignment.sede_uuid,
        rol_uuid: assignment.rol_uuid,
        especialidad_uuids: assignment.especialidad_uuids ?? [],
      }))
    }
    await mutateAsync({ uid: user.id_user, data: payload })
  }

  const sedeName = user?.sede_id
    ? (sedes?.find((s) => s.id === user.sede_id)?.nombre ?? "")
    : ""

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>
            El área se administra en Inplanner; la sede y el rol se actualizan
            en Centralizado.
          </DialogDescription>
        </DialogHeader>

        {isError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            Error al cargar los datos del usuario. {error?.message}
          </div>
        )}

        {user && (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <UserReadonlyFields user={user} sedeName={sedeName} />

            <div className="space-y-1.5 border-t pt-5">
              <Label
                htmlFor="edit-area_id"
                className="text-xs font-medium text-foreground"
              >
                Área
              </Label>
              <Controller
                control={control}
                name="area_id"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <Select.Trigger id="edit-area_id">
                      <Select.Value
                        placeholder={areasLoading ? "Cargando..." : "Seleccionar"}
                      >
                        {field.value
                          ? areas?.find(
                              (a) => a.id_area.toString() === field.value,
                            )?.nombre_area
                          : undefined}
                      </Select.Value>
                    </Select.Trigger>
                    <Select.Popup>
                      <Select.List>
                        {areas?.map((area) => (
                          <Select.Item
                            key={area.id_area}
                            value={area.id_area.toString()}
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

            {assignments.length > 0 && (
              <div className="space-y-3 border-t pt-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Label className="text-xs font-medium text-foreground">
                      Sedes y roles
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Cambia el rol de tus sedes actuales o agrega una nueva.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAssignment}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Agregar sede
                  </Button>
                </div>

                {fields.map((field, index) => {
                  const sedeError =
                    errors.asignaciones?.[index]?.sede_uuid?.message
                  const rolError =
                    errors.asignaciones?.[index]?.rol_uuid?.message
                  const selectedSede =
                    watchedAssignments[index]?.sede_uuid ?? ""
                  const sedeOptions = sedes?.filter(
                    (sede) =>
                      !usedSedes.has(sede.id) || sede.id === selectedSede,
                  )

                  return (
                    <div
                      key={field.id}
                      className="flex flex-col gap-2 sm:flex-row sm:items-end"
                    >
                      <div className="flex-1 space-y-1.5">
                        <Label
                          htmlFor={
                            field.is_new ? `edit-sede-${index}` : undefined
                          }
                          className="text-xs font-medium text-muted-foreground"
                        >
                          Sede
                        </Label>
                        {field.is_new ? (
                          <Controller
                            control={control}
                            name={`asignaciones.${index}.sede_uuid`}
                            render={({ field: sedeField }) => (
                              <Select
                                value={sedeField.value ?? ""}
                                onValueChange={(value) => {
                                  sedeField.onChange(value)
                                  setValue(
                                    `asignaciones.${index}.especialidad_uuids`,
                                    [],
                                  )
                                }}
                              >
                                <Select.Trigger id={`edit-sede-${index}`}>
                                  <Select.Value placeholder="Seleccionar sede">
                                    {
                                      sedeOptions?.find(
                                        (sede) => sede.id === sedeField.value,
                                      )?.nombre
                                    }
                                  </Select.Value>
                                </Select.Trigger>
                                <Select.Popup>
                                  <Select.List>
                                    {sedeOptions?.map((sede) => (
                                      <Select.Item
                                        key={sede.id}
                                        value={sede.id}
                                      >
                                        {sede.nombre}
                                      </Select.Item>
                                    ))}
                                  </Select.List>
                                </Select.Popup>
                              </Select>
                            )}
                          />
                        ) : (
                          <Input
                            value={
                              sedes?.find(
                                (sede) => sede.id === selectedSede,
                              )?.nombre ?? "—"
                            }
                            disabled
                            readOnly
                          />
                        )}
                        {sedeError && (
                          <p className="text-xs text-destructive">
                            {sedeError}
                          </p>
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <Label
                          htmlFor={`edit-rol-${index}`}
                          className="text-xs font-medium text-foreground"
                        >
                          Rol
                        </Label>
                        <Controller
                          control={control}
                          name={`asignaciones.${index}.rol_uuid`}
                          render={({ field: rolField }) => (
                            <Select
                              value={rolField.value ?? ""}
                              onValueChange={rolField.onChange}
                            >
                              <Select.Trigger id={`edit-rol-${index}`}>
                                <Select.Value placeholder="Seleccionar">
                                  {
                                    roles.find(
                                      (rol) => rol.id === rolField.value,
                                    )?.nombre
                                  }
                                </Select.Value>
                              </Select.Trigger>
                              <Select.Popup>
                                <Select.List>
                                  {roles.map((rol) => (
                                    <Select.Item key={rol.id} value={rol.id}>
                                      {rol.nombre}
                                    </Select.Item>
                                  ))}
                                </Select.List>
                              </Select.Popup>
                            </Select>
                          )}
                        />
                        {rolError && (
                          <p className="text-xs text-destructive">
                            {rolError}
                          </p>
                        )}
                      </div>

                      {field.is_new && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          title="Quitar sede"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

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
                {isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
