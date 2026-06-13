import { PropagateLoader } from "react-spinners"
import { cn } from "@/features/shared/lib/utils"

type SpinnerProps = {
  size?: number
  color?: string
  className?: string
  fullPage?: boolean
}

export default function Spinner({
  size = 15,
  color = "var(--brand-primary)",
  className,
  fullPage = true,
}: SpinnerProps) {
  const loader = (
    <PropagateLoader
      color={color}
      size={size}
      aria-label="Cargando..."
    />
  )

  if (!fullPage) return loader

  return (
    <div className={cn("flex items-center justify-center h-screen", className)}>
      {loader}
    </div>
  )
}
