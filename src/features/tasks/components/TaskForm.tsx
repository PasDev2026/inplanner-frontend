import { useState } from "react"
import { FieldErrors, UseFormRegister, UseFormSetValue, UseFormGetValues } from "react-hook-form"
import { format } from "date-fns"
import type { TaskFormData } from "@/features/tasks/schemas/task.schema"
import { priorityTranslation, PRIORITY_VALUES } from "@/features/shared/constants/priority.constant"
import { DatePicker } from "@/features/shared/components/DatePicker"
import { Select } from "@/components/ui/select"
import { InputForm } from "@/features/shared/components/form/InputForm"
import { TextAreaForm } from "@/features/shared/components/form/TextAreaForm"

type TaskFormProps = {
    errors: FieldErrors<TaskFormData>
    register: UseFormRegister<TaskFormData>
    setValue?: UseFormSetValue<TaskFormData>
    getValues?: UseFormGetValues<TaskFormData>
    showDates?: boolean
}

export default function TaskForm({errors, register, setValue, getValues, showDates = false} : TaskFormProps) {
    const [startDate, setStartDate] = useState<Date | undefined>(() => {
        const val = getValues?.("startDate")
        return val ? new Date(val + "T00:00:00") : undefined
    })

    const [dueDate, setDueDate] = useState<Date | undefined>(() => {
        const val = getValues?.("dueDate")
        return val ? new Date(val + "T00:00:00") : undefined
    })

    return (
        <>
            <InputForm
                label="Nombre de la tarea"
                name="name"
                register={register}
                errors={errors}
                placeholder="Nombre de la tarea"
                labelClassName="font-normal text-2xl"
            />

            <TextAreaForm
                label="Descripción de la tarea"
                name="description"
                register={register}
                errors={errors}
                placeholder="Descripción de la tarea"
                labelClassName="font-normal text-2xl"
            />

            <div className="flex flex-col gap-5">
                <label
                    className="font-normal text-2xl"
                    htmlFor="priority"
                >Prioridad</label>
                <Select
                    value={getValues?.("priority") ?? ""}
                    onValueChange={(v) => setValue?.("priority", v as TaskFormData["priority"])}
                >
                    <Select.Trigger id="priority" className="w-full p-3 h-auto border-border">
                        <Select.Value placeholder="Selecciona prioridad">
                            {getValues?.("priority") ? priorityTranslation[getValues("priority") as keyof typeof priorityTranslation] : ""}
                        </Select.Value>
                    </Select.Trigger>
                    <Select.Popup>
                        <Select.List>
                            {PRIORITY_VALUES.map((p) => (
                                <Select.Item key={p} value={p}>
                                    {priorityTranslation[p]}
                                </Select.Item>
                            ))}
                        </Select.List>
                    </Select.Popup>
                </Select>
            </div>

            {showDates && (
                <>
                    <div className="flex flex-col gap-5">
                        <label className="font-normal text-2xl" htmlFor="startDate">
                            Fecha de inicio
                        </label>
                        <DatePicker
                            date={startDate}
                            onSelect={(d) => {
                                setStartDate(d)
                                setValue?.("startDate", d ? format(d, "yyyy-MM-dd") : "")
                            }}
                            placeholder="Fecha inicio"
                        />
                        {errors.startDate && (
                            <p>{errors.startDate.message}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-5">
                        <label className="font-normal text-2xl" htmlFor="dueDate">
                            Fecha límite
                        </label>
                        <DatePicker
                            date={dueDate}
                            onSelect={(d) => {
                                setDueDate(d)
                                setValue?.("dueDate", d ? format(d, "yyyy-MM-dd") : "")
                            }}
                            placeholder="Fecha límite"
                        />
                        {errors.dueDate && (
                            <p>{errors.dueDate.message}</p>
                        )}
                    </div>
                </>
            )}
        </>
    )
}
