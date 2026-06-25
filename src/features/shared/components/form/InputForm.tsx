import { type ReactNode } from "react"
import { type FieldErrors, type FieldPath, type FieldValues, type UseFormRegister } from "react-hook-form"
import { cn } from "@/features/shared/lib/utils"
import { Input } from "@/components/ui/input"

type InputFormProps<T extends FieldValues> = {
  label: string
  name: FieldPath<T>
  register: UseFormRegister<T>
  errors: FieldErrors<T>
  placeholder?: string
  type?: string
  disabled?: boolean
  className?: string
  labelClassName?: string
  suffix?: ReactNode
}

export function InputForm<T extends FieldValues>({
  label,
  name,
  register,
  errors,
  placeholder,
  type,
  disabled,
  className,
  labelClassName,
  suffix,
}: InputFormProps<T>) {
  const error = errors[name]
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className={labelClassName ?? "text-sm font-medium text-foreground"}>
        {label}
      </label>
      {suffix ? (
        <div className="relative">
          <Input
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={cn("pr-10", className)}
            {...register(name)}
          />
          <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">
            {suffix}
          </span>
        </div>
      ) : (
        <Input
          id={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={className}
          {...register(name)}
        />
      )}
      {error?.message && <p className="text-sm text-destructive">{error.message as string}</p>}
    </div>
  )
}
