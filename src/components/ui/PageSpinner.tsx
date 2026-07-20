import { cn } from "@/features/shared/lib/utils"
import { Spinner } from "@/components/ui/Spinner"

type PageSpinnerProps = {
  size?: number
  className?: string
  fullPage?: boolean
  centered?: boolean
}

const sizeToVariant: Record<number, "sm" | "md" | "lg" | "xl"> = {
  15: "xl",
  12: "lg",
  10: "md",
}

export default function PageSpinner({
  size = 15,
  className,
  fullPage = false,
  centered = true,
}: PageSpinnerProps) {
  const loader = (
    <Spinner
      size={sizeToVariant[size] ?? "md"}
      className={cn(className)}
      aria-label="Cargando..."
    />
  )

  if (fullPage) {
    return <div className="flex items-center justify-center h-screen">{loader}</div>
  }

  if (centered) {
    return <div className="flex items-center justify-center w-full min-h-[50vh]">{loader}</div>
  }

  return loader
}
