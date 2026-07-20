import type { UseFormRegister, FieldErrors, Control } from "react-hook-form"
import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { InputForm } from "@/features/shared/components/form/InputForm"
import type { UserEditForm, Area } from "@/features/admin/schemas/user.schema"

type UserFormFieldsProps = {
  register: UseFormRegister<UserEditForm>
  errors: FieldErrors<UserEditForm>
  control: Control<UserEditForm>
  areas: Area[] | undefined
  areasLoading: boolean
  areasError: boolean
}

export default function UserFormFields({
  register,
  errors,
  control,
  areas,
  areasLoading,
  areasError,
}: UserFormFieldsProps) {

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <InputForm
            label="Nombre"
            name="name"
            register={register}
            errors={errors}
            labelClassName="text-xs font-medium"
          />

          <InputForm
            label="Apellido paterno"
            name="apellido_paterno"
            register={register}
            errors={errors}
            labelClassName="text-xs font-medium"
          />

          {/* ponytail: pendiente de sync desde centralizado vía JWT
          <InputForm
            label="Apellido materno"
            name="apellido_materno"
            register={register}
            errors={errors}
            labelClassName="text-xs font-medium"
          />

          <div className="space-y-2">
            <Label htmlFor="edit-telefono">Teléfono</Label>
            <Input
              id="edit-telefono"
              type="tel"
              placeholder="9 dígitos"
              {...register("telefono", {
                onChange: (e) => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 9) },
              })}
            />
            {errors.telefono && <p className="text-xs text-destructive font-medium">{errors.telefono.message}</p>}
          </div>
          */}
        </div>

        <div className="space-y-4">
          <InputForm
            label="Email"
            name="email"
            register={register}
            errors={errors}
            type="email"
            labelClassName="text-xs font-medium"
          />
        </div>
      </div>

      <div className="space-y-4 border-t pt-5">
        <div className="space-y-2">
          <Label htmlFor="edit-area_id">Área</Label>
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
                <div className="w-full">
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <Select.Trigger id="edit-area_id" className="min-h-[30px] w-full">
                      <Select.Value placeholder="-- Selecciona --">
                        {field.value ? areas?.find((a) => a.id_area.toString() === field.value)?.nombre_area : undefined}
                      </Select.Value>
                    </Select.Trigger>
                    <Select.Popup>
                      <Select.List>
                        {areas?.map((area) => (
                          <Select.Item key={area.id_area} value={area.id_area.toString()}>
                            {area.nombre_area}
                          </Select.Item>
                        ))}
                      </Select.List>
                    </Select.Popup>
                  </Select>
                </div>
              )}
            />
          )}
        </div>
      </div>
    </>
  )
}
