import { useState } from "react"
import { FieldErrors, UseFormRegister, UseFormSetValue, UseFormGetValues, Control, Controller } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { getSedes } from "@/features/shared/actions/centralizado.api"
import { useEffect } from "react"
import { format } from "date-fns"
import { DatePicker } from "../../shared/components/DatePicker"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export type ProjectFormValues = {
  name_project: string;
  description_project: string;
  sede_id: string;
  start_date: string | null;
  due_date: string | null;
};

type Form = {
  register: UseFormRegister<ProjectFormValues>;
  errors: FieldErrors<ProjectFormValues>;
  setValue?: UseFormSetValue<ProjectFormValues>;
  getValues?: UseFormGetValues<ProjectFormValues>;
  control?: Control<ProjectFormValues>;
  hideEmpresa?: boolean;
};

export default function ProjectForm({ errors, register, setValue, getValues, control, hideEmpresa }: Form) {
  const { data: sedes } = useQuery({
    queryKey: ["sedes"],
    queryFn: getSedes,
  });

  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const val = getValues?.("start_date")
    return val ? new Date(val + "T00:00:00") : undefined
  })

  const [dueDate, setDueDate] = useState<Date | undefined>(() => {
    const val = getValues?.("due_date")
    return val ? new Date(val + "T00:00:00") : undefined
  })

  useEffect(() => {
    if (!hideEmpresa && sedes?.length === 1 && setValue) {
      setValue("sede_id", String(sedes[0].id));
    }
  }, [hideEmpresa, sedes, setValue]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name_project" className="text-sm font-medium text-gray-700">
          Nombre del Proyecto
        </label>
        <Input
          id="name_project"
          type="text"
          placeholder="Nombre del Proyecto"
          {...register("name_project", {
            required: "El Titulo del Proyecto es obligatorio",
          })}
        />
        {errors.name_project && (
          <p className="text-sm text-red-600">{errors.name_project.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description_project" className="text-sm font-medium text-gray-700">
          Descripción
        </label>
        <Textarea
          id="description_project"
          placeholder="Descripción del Proyecto"
          rows={3}
          {...register("description_project", {
            required: "Una descripción del proyecto es obligatoria",
          })}
        />
        {errors.description_project && (
          <p className="text-sm text-red-600">{errors.description_project.message}</p>
        )}
      </div>

      {!hideEmpresa && sedes && sedes.length > 1 && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sede_id" className="text-sm font-medium text-gray-700">
            Sede
          </label>
          <Controller
            name="sede_id"
            control={control}
            render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <Select.Trigger id="sede_id">
                  <Select.Value placeholder="Seleccionar sede">
                    {field.value ? sedes.find(s => String(s.id) === field.value)?.nombre : ""}
                  </Select.Value>
                </Select.Trigger>
                <Select.Popup>
                  <Select.List>
                    {sedes.map(sede => (
                      <Select.Item key={sede.id} value={String(sede.id)}>
                        {sede.nombre}
                      </Select.Item>
                    ))}
                  </Select.List>
                </Select.Popup>
              </Select>
            )}
          />
          {errors.sede_id && (
            <p className="text-sm text-red-600">{errors.sede_id.message}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="start_date" className="text-sm font-medium text-gray-700">
            Fecha Inicio
          </label>
          <DatePicker
            date={startDate}
            onSelect={(d) => {
              setStartDate(d)
              setValue?.("start_date", d ? format(d, "yyyy-MM-dd") : null)
            }}
            placeholder="Fecha inicio"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="due_date" className="text-sm font-medium text-gray-700">
            Fecha Límite
          </label>
          <DatePicker
            date={dueDate}
            onSelect={(d) => {
              setDueDate(d)
              setValue?.("due_date", d ? format(d, "yyyy-MM-dd") : null)
            }}
            placeholder="Fecha límite"
          />
        </div>
      </div>
    </div>
  );
}
