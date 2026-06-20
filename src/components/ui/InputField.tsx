import { type InputHTMLAttributes, forwardRef, type ReactNode } from "react"

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: ReactNode
  suffix?: ReactNode
  error?: string
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, icon, suffix, error, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="text-sm font-semibold tracking-wide" style={{ color: 'var(--label-color)' }}>
          {label}
        </label>

        <div
          className="group flex items-center gap-3 rounded-xl px-4 py-3 transition-shadow duration-200 focus-within:ring-2"
          style={{
            backgroundColor: 'var(--input-bg)',
            '--tw-ring-color': 'var(--input-border-focus)',
          } as React.CSSProperties}
        >
          {icon && (
            <span
              className="group-icon shrink-0 transition-colors duration-200"
              style={{ color: 'var(--input-icon)' } as React.CSSProperties}
            >
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            className="border-none bg-transparent outline-none focus:ring-0 focus:border-none focus:outline-none w-full h-full text-sm placeholder:text-sm"
            style={{ color: 'var(--text-primary)' }}
            {...props}
          />

          {suffix && (
            <span className="shrink-0">
              {suffix}
            </span>
          )}
        </div>

        {error && (
          <p className="text-xs font-medium text-destructive">{error}</p>
        )}
      </div>
    )
  }
)

InputField.displayName = "InputField"

export default InputField
