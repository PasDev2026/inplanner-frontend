import { ButtonHTMLAttributes } from "react"
import { Loader2 } from "lucide-react"

type LoginButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean
}

export function LoginButton({
  isLoading,
  disabled,
  children,
  ...props
}: LoginButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className="inline-flex w-full items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:brightness-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100"
      style={{ backgroundColor: 'hsl(var(--brand-primary))' }}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Ingresando...
        </>
      ) : (
        children
      )}
    </button>
  )
}
