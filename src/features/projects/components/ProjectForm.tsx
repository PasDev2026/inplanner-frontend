import { useState, useEffect } from "react"
import { FieldErrors, UseFormRegister, UseFormSetValue, UseFormGetValues, Control } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { SEDES_KEY } from "@/features/shared/lib/shared-keys"
import { getSedes } from "@/features/shared/actions/centralizado.api"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { format } from "date-fns"
import { DatePicker } from "@/features/shared/components/DatePicker"
import { InputForm } from "@/features/shared/components/form/InputForm"
import { TextAreaForm } from "@/features/shared/components/form/TextAreaForm"
import { SelectForm } from "@/features/shared/components/form/SelectForm"

import type { ProjectFormValues } from "@/features/projects/schemas/project.schema"
import { PRIVACY_LEVEL_OPTIONS } from "@/features/shared/constants/privacy-level.constant"
export type { ProjectFormValues }

type Form = {
  register: UseFormRegister<ProjectFormValues>;
  errors: FieldErrors<ProjectFormValues>;
  setValue?: UseFormSetValue<ProjectFormValues>;
  getValues?: UseFormGetValues<ProjectFormValues>;
  control?: Control<ProjectFormValues>;
  hideEmpresa?: boolean;
};

export default function ProjectForm({ errors, register, setValue, getValues, control, hideEmpresa }: Form) {
  const { data: user } = useAuth();

  const { data: sedes } = useQuery({
    queryKey: SEDES_KEY,
    queryFn: getSedes,
  });

  const isSuperAdmin = user?.roles?.some(r => r.rolCodigo === 'SUPER_ADMINISTRADOR') ?? false;
  const userSedeIds = user?.roles?.map(r => r.sedeId).filter(Boolean) ?? [];
  const userSedes = isSuperAdmin
    ? (sedes ?? [])
    : (sedes ?? []).filter(s => userSedeIds.includes(s.id));

  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const val = getValues?.("start_date")
    return val ? new Date(val + "T00:00:00") : undefined
  })

  const [dueDate, setDueDate] = useState<Date | undefined>(() => {
    const val = getValues?.("due_date")
    return val ? new Date(val + "T00:00:00") : undefined
  })

  useEffect(() => {
    if (!hideEmpresa && userSedes?.length === 1 && setValue) {
      setValue("sede_id", userSedes[0].id);
    }
  }, [hideEmpresa, userSedes, setValue]);

  return (
    <div className="flex flex-col gap-4">
      <InputForm
        label="Nombre del Proyecto"
        name="name_project"
        register={register}
        errors={errors}
        placeholder="Nombre del Proyecto"
      />

      <TextAreaForm
        label="Descripción"
        name="description_project"
        register={register}
        errors={errors}
        placeholder="Descripción del Proyecto"
        rows={3}
      />

      {!hideEmpresa && userSedes && userSedes.length > 1 && control && (
        <SelectForm
          label="Sede"
          name="sede_id"
          control={control}
          errors={errors}
          options={userSedes.map(s => ({ value: String(s.id), label: s.nombre }))}
          placeholder="Seleccionar sede"
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="start_date" className="text-sm font-medium text-foreground">
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
          <label htmlFor="due_date" className="text-sm font-medium text-foreground">
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

      {control && (
        <SelectForm
          control={control}
          name="privacy_level"
          label="Visibilidad"
          placeholder="Selecciona visibilidad"
          options={PRIVACY_LEVEL_OPTIONS}
          errors={errors}
        />
      )}
    </div>
  );
}
