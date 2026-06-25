import { useState } from "react"
import { type FieldErrors, type FieldPath, type FieldValues, type UseFormGetValues, type UseFormSetValue } from "react-hook-form"
import { format } from "date-fns"
import { DatePicker } from "@/features/shared/components/DatePicker"

type DatePickerFormProps<T extends FieldValues> = {
  label: string
  name: FieldPath<T>
  errors: FieldErrors<T>
  setValue: UseFormSetValue<T>
  getValues: UseFormGetValues<T>
  placeholder?: string
  disabled?: boolean
  className?: string
  labelClassName?: string
}

export function DatePickerForm<T extends FieldValues>({
  label,
  name,
  errors,
  setValue,
  getValues,
  placeholder,
  disabled,
  className,
  labelClassName,
}: DatePickerFormProps<T>) {
  const [date, setDate] = useState<Date | undefined>(() => {
    const val = getValues(name) as string | null | undefined
    return val ? new Date(val + "T00:00:00") : undefined
  })

  const error = errors[name]
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className={labelClassName ?? "text-sm font-medium text-foreground"}>
        {label}
      </label>
      <DatePicker
        date={date}
        onSelect={(d) => {
          setDate(d)
          setValue(name, (d ? format(d, "yyyy-MM-dd") : null) as T[typeof name])
        }}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
      />
      {error?.message && <p className="text-sm text-destructive">{error.message as string}</p>}
    </div>
  )
}
