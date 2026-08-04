import { Card, CardHeader } from "@/components/ui/card"
import { cn } from "@/features/shared/lib/utils"
import { myCardMeta } from "@/features/mi-dashboard/constants/my-stats-cards"
import type { MyStatsCardsProps } from "@/features/mi-dashboard/constants/my-stats-cards"

export default function MyStatsCards({ taskCounts }: MyStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {myCardMeta.map(({ key, label, icon: Icon, iconColor, bgColor, value }) => (
        <Card key={key}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={cn("rounded-full p-2 shrink-0", bgColor)}>
                <Icon className={cn("h-4 w-4", iconColor)} />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground truncate">{label}</p>
                <p className="text-2xl font-semibold tabular-nums">{value(taskCounts)}</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
