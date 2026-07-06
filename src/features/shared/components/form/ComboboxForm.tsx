import { type Control, type FieldErrors, type FieldPath, type FieldValues, Controller } from "react-hook-form"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox"

type ComboboxOption = {
  value: string
  label: string
}

type ComboboxFormProps<T extends FieldValues> = {
  label: string
  name: FieldPath<T>
  control: Control<T>
  errors: FieldErrors<T>
  options: ComboboxOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  labelClassName?: string
}

export function ComboboxForm<T extends FieldValues>({
  label,
  name,
  control,
  errors,
  options,
  placeholder = "Buscar...",
  disabled,
  className,
  labelClassName,
}: ComboboxFormProps<T>) {
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
          <Combobox value={field.value ?? ""} onValueChange={field.onChange} disabled={disabled}>
            <InputGroup className={className}>
              {/* @ts-expect-error render prop exists in @base-ui/react runtime */}
              <ComboboxValue render={<InputGroupInput placeholder={placeholder} />} />
              <InputGroupAddon align="inline-end">
                <ComboboxTrigger />
              </InputGroupAddon>
            </InputGroup>
            <ComboboxContent>
              <ComboboxList>
                {options.map((opt) => (
                  <ComboboxItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        )}
      />
      {error?.message && <p className="text-sm text-destructive">{error.message as string}</p>}
    </div>
  )
}
