import { Controller, useFieldArray, type Control, type FieldErrors } from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import type { CentralizadoItem } from "@/features/shared/actions/centralizado.api"
import type { CreateUserForm } from "../schemas/create-user.schema"

type CreateUserAssignmentsProps = {
  control: Control<CreateUserForm>
  errors: FieldErrors<CreateUserForm>
  sedes: CentralizadoItem[]
  roles: CentralizadoItem[]
}

export default function CreateUserAssignments({
  control,
  errors,
  sedes,
  roles,
}: CreateUserAssignmentsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "asignaciones",
  })

  const arrayError = errors.asignaciones?.message

  return (
    <div className="flex flex-col gap-2 sm:col-span-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Sedes y roles
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ sede_uuid: "", rol_uuid: "" })}
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> Agregar sede
        </Button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="flex items-end gap-2 rounded-md border border-border p-3">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-medium text-foreground">Sede</label>
            <Controller
              control={control}
              name={`asignaciones.${index}.sede_uuid`}
              render={({ field: f }) => (
                <Select value={f.value} onValueChange={f.onChange}>
                  <Select.Trigger>
                    <Select.Value placeholder="Seleccionar sede">
                      {sedes.find((s) => s.id === f.value)?.nombre}
                    </Select.Value>
                  </Select.Trigger>
                  <Select.Popup>
                    <Select.List>
                      {sedes.map((sede) => (
                        <Select.Item key={sede.id} value={sede.id}>
                          {sede.nombre}
                        </Select.Item>
                      ))}
                    </Select.List>
                  </Select.Popup>
                </Select>
              )}
            />
          </div>

          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-medium text-foreground">Rol</label>
            <Controller
              control={control}
              name={`asignaciones.${index}.rol_uuid`}
              render={({ field: f }) => (
                <Select value={f.value} onValueChange={f.onChange}>
                  <Select.Trigger>
                    <Select.Value placeholder="Seleccionar rol">
                      {roles.find((r) => r.id === f.value)?.nombre}
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

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => remove(index)}
            disabled={fields.length === 1}
            title="Quitar asignación"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {arrayError && <p className="text-xs text-destructive">{arrayError}</p>}
    </div>
  )
}
