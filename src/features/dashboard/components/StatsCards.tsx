import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/features/shared/lib/utils"
import { cardMeta } from "@/features/dashboard/constants/stats-cards"
import type { StatsCardsProps } from "@/features/dashboard/constants/stats-cards"

export default function StatsCards(props: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cardMeta.map(({ key, label, icon: Icon, iconColor, bgColor, value }) => (
        <Card key={key}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={cn("rounded-full p-2 shrink-0", bgColor)}>
                <Icon className={cn("h-4 w-4", iconColor)} />
              </div>
              <div className="min-w-0">
                <CardDescription className="truncate">{label}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {value(props)}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
