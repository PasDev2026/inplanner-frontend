import { useState } from "react"
import { FieldErrors, UseFormRegister, UseFormSetValue, UseFormGetValues } from "react-hook-form"
import { format } from "date-fns"
import { TaskFormData } from "@/features/shared/lib/types"
import { priorityTranslation, PRIORITY_VALUES } from "@/features/shared/i18n/es"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "../../shared/components/DatePicker"
import { Select } from "@/components/ui/select"

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
            <div className="flex flex-col gap-5">
                <label
                    className="font-normal text-2xl"
                    htmlFor="name"
                >Nombre de la tarea</label>
                <Input
                    id="name"
                    type="text"
                    placeholder="Nombre de la tarea"
                    {...register("name", {
                        required: "El nombre de la tarea es obligatorio",
                    })}
                />
                {errors.name && (
                    <p>{errors.name.message}</p>
                )}
            </div>

            <div className="flex flex-col gap-5">
                <label
                    className="font-normal text-2xl"
                    htmlFor="description"
                >Descripción de la tarea</label>
                <Textarea
                    id="description"
                    placeholder="Descripción de la tarea"
                    {...register("description")}
                />
                {errors.description && (
                    <p>{errors.description.message}</p>
                )}  
            </div>

            <div className="flex flex-col gap-5">
                <label
                    className="font-normal text-2xl"
                    htmlFor="priority"
                >Prioridad</label>
                <Select
                    value={getValues?.("priority") ?? ""}
                    onValueChange={(v) => setValue?.("priority", v as TaskFormData["priority"])}
                >
                    <Select.Trigger id="priority" className="w-full p-3 h-auto border-gray-300">
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
