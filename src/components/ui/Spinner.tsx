import { cn } from "@/features/shared/lib/utils"

const sizeMap: Record<string, string> = {
  sm: "size-4",
  md: "size-6",
  lg: "size-9",
  xl: "size-11",
}

type SpinnerProps = {
  size?: keyof typeof sizeMap
  className?: string
}

function Spinner({ size = "sm", className }: SpinnerProps) {
  return (
    <div
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn(
        "shrink-0 rounded-full border-2 border-border border-t-brand-primary animate-spin",
        sizeMap[size],
        className,
      )}
    />
  )
}

export { Spinner }
