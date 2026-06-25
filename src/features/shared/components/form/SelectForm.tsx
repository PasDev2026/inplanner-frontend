import { type Control, type ControllerRenderProps, type FieldErrors, type FieldPath, type FieldValues, Controller } from "react-hook-form"
import { Select } from "@/components/ui/select"

type SelectOption = {
  value: string
  label: string
}

type SelectFormProps<T extends FieldValues> = {
  label: string
  name: FieldPath<T>
  control: Control<T>
  errors: FieldErrors<T>
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  labelClassName?: string
  renderValue?: (field: ControllerRenderProps<T>, options: SelectOption[]) => React.ReactNode
}

export function SelectForm<T extends FieldValues>({
  label,
  name,
  control,
  errors,
  options,
  placeholder = "Seleccionar",
  disabled,
  className,
  labelClassName,
  renderValue,
}: SelectFormProps<T>) {
  const error = errors[name]
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className={labelClassName ?? "text-sm font-medium text-foreground"}>
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select value={field.value ?? ""} onValueChange={field.onChange} disabled={disabled}>
            <Select.Trigger id={name} className={className}>
              <Select.Value placeholder={placeholder}>
                {renderValue ? renderValue(field, options) : undefined}
              </Select.Value>
            </Select.Trigger>
            <Select.Popup>
              <Select.List>
                {options.map((opt) => (
                  <Select.Item key={opt.value} value={opt.value}>
                    {opt.label}
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select>
        )}
      />
      {error?.message && <p className="text-sm text-destructive">{error.message as string}</p>}
    </div>
  )
}
