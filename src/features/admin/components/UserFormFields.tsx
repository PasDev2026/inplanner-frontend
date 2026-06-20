import type { UseFormRegister, FieldErrors, Control } from "react-hook-form"
import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import TagInput from "@/components/ui/TagInput"
import type { UserFormData, Role, Area } from "@/features/admin/schemas/user.schema"

type UserFormFieldsProps = {
  mode: "create" | "edit"
  register: UseFormRegister<UserFormData>
  errors: FieldErrors<UserFormData>
  control: Control<UserFormData>
  showPassword: boolean
  onTogglePassword: () => void
  dniError: string | null
  roles: Role[] | undefined
  rolesLoading: boolean
  rolesError: boolean
  areas: Area[] | undefined
  areasLoading: boolean
  areasError: boolean
  sedes: { id: number; nombre: string }[] | undefined
  selectedSedeIds: number[]
  onSedeChange: (ids: number[]) => void
  selectedRoleIds: number[]
  onRoleChange: (ids: number[]) => void
}

export default function UserFormFields({
  mode,
  register,
  errors,
  control,
  showPassword,
  onTogglePassword,
  dniError,
  roles,
  rolesLoading,
  rolesError,
  areas,
  areasLoading,
  areasError,
  sedes,
  selectedSedeIds,
  onSedeChange,
  selectedRoleIds,
  onRoleChange,
}: UserFormFieldsProps) {
  const isEdit = mode === "edit"

  return (
    <>
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
                  onClick={onTogglePassword}
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
                <div className="w-full">
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <Select.Trigger id={`${mode}-area_id`} className="min-h-[30px] w-full">
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
              options={roles?.map((r) => ({ id: Number(r.id), nombre: r.nombre })) ?? []}
              value={selectedRoleIds}
              onChange={onRoleChange}
              placeholder="Buscar roles..."
            />
          )}
        </div>

        <div className="space-y-2">
          <Label>Sedes</Label>
          <TagInput
            label=""
            options={sedes ?? []}
            value={selectedSedeIds}
            onChange={onSedeChange}
            placeholder="Buscar sedes..."
          />
        </div>
      </div>
    </>
  )
}
