import { ButtonHTMLAttributes } from "react"

export function LoginButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:brightness-90 active:scale-[0.98]"
      style={{ backgroundColor: 'var(--brand-primary)' }}
    />
  )
}
