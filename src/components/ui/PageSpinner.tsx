import { cn } from "@/features/shared/lib/utils"
import { Spinner } from "@/components/ui/Spinner"

type PageSpinnerProps = {
  size?: number
  className?: string
  fullPage?: boolean
  centered?: boolean
}

const sizeToClass: Record<number, string> = {
  15: "size-11",
  12: "size-9",
  10: "size-8",
}

export default function PageSpinner({
  size = 15,
  className,
  fullPage = false,
  centered = true,
}: PageSpinnerProps) {
  const loader = (
    <Spinner
      className={cn("text-foreground", sizeToClass[size], className)}
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
