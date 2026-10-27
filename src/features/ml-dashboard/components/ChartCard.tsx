import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/features/shared/lib/utils"
import { SURFACE_SHADOW } from "@/features/ml-dashboard/lib/risk"

type ChartCardProps = {
  title: string
  description: string
  action?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}

export default function ChartCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: ChartCardProps) {
  return (
    <Card className={cn("flex h-full flex-col overflow-hidden border-border/70", SURFACE_SHADOW, className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-1">
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-base font-semibold tracking-tight">{title}</CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </CardHeader>
      <CardContent className={cn("flex-1 pt-4", contentClassName)}>{children}</CardContent>
    </Card>
  )
}
