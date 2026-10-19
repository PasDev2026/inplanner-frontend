import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
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

  const { control, handleSubmit, reset } = useForm<UserEditForm>({
    resolver: zodResolver(userEditSchema),
    defaultValues: { area_id: "", asignaciones: [] },
  })

  useEffect(() => {
    if (user && isOpen) {
      reset({
        area_id: user.area?.id_area?.toString() ?? "",
        asignaciones: assignments.map((assignment) => ({ ...assignment })),
      })
    }
  }, [user, isOpen, assignments, reset])

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
      payload.asignaciones = formData.asignaciones
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
                <div>
                  <Label className="text-xs font-medium text-foreground">
                    Sedes y roles
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    La sede se administra en Centralizado; aquí puedes cambiar
                    el rol.
                  </p>
                </div>

                {assignments.map((assignment, index) => (
                  <div
                    key={assignment.sede_uuid}
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                  >
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Sede
                      </Label>
                      <Input
                        value={
                          sedes?.find((s) => s.id === assignment.sede_uuid)
                            ?.nombre ?? "—"
                        }
                        disabled
                        readOnly
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor={`edit-rol-${index}`}
                        className="text-xs font-medium text-foreground"
                      >
                        Rol
                      </Label>
                      <Controller
                        control={control}
                        name={`asignaciones.${index}.rol_uuid`}
                        render={({ field }) => (
                          <Select
                            value={field.value ?? ""}
                            onValueChange={field.onChange}
                          >
                            <Select.Trigger id={`edit-rol-${index}`}>
                              <Select.Value placeholder="Seleccionar">
                                {roles.find((rol) => rol.id === field.value)
                                  ?.nombre}
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
                    </div>
                  </div>
                ))}
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
