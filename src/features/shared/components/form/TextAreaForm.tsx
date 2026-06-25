import { type FieldErrors, type FieldPath, type FieldValues, type UseFormRegister } from "react-hook-form"
import { Textarea } from "@/components/ui/textarea"

type TextAreaFormProps<T extends FieldValues> = {
  label: string
  name: FieldPath<T>
  register: UseFormRegister<T>
  errors: FieldErrors<T>
  placeholder?: string
  disabled?: boolean
  rows?: number
  className?: string
  labelClassName?: string
}

export function TextAreaForm<T extends FieldValues>({
  label,
  name,
  register,
  errors,
  placeholder,
  disabled,
  rows,
  className,
  labelClassName,
}: TextAreaFormProps<T>) {
  const error = errors[name]
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className={labelClassName ?? "text-sm font-medium text-foreground"}>
        {label}
      </label>
      <Textarea
        id={name}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={className}
        {...register(name)}
      />
      {error?.message && <p className="text-sm text-destructive">{error.message as string}</p>}
    </div>
  )
}
