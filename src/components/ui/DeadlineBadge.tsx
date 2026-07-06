import { Badge } from "@/components/ui/badge"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"

type DeadlineBadgeProps = {
    dueDate: string | null | undefined
    isOverdue?: boolean
    variant?: 'compact' | 'full'
}

export default function DeadlineBadge({ 
    dueDate, 
    isOverdue = false, 
    variant = 'full' 
}: DeadlineBadgeProps) {
    if (!dueDate) return null

    const date = new Date(dueDate)
    const formattedDate = date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const daysUntilDue = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    const isNearDue = !isOverdue && daysUntilDue >= 0 && daysUntilDue <= 3

    let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "secondary"
    let badgeClass = ""
    let text = `Vence: ${formattedDate}`

    if (isOverdue) {
        badgeVariant = "destructive"
        text = `Vencido: ${formattedDate}`
    } else if (isNearDue) {
        badgeVariant = "secondary"
        badgeClass = "bg-warning/15 text-warning border-warning/25 hover:bg-warning/25"
        text = daysUntilDue === 0 ? "Vence hoy" : `Vence en ${daysUntilDue} días`
    }

    if (variant === 'compact') {
        return (
            <HoverCard>
                <HoverCardTrigger>
                    <Badge variant={badgeVariant} className={badgeClass}>
                        {formattedDate}
                    </Badge>
                </HoverCardTrigger>
                <HoverCardContent>
                    <p className="text-xs whitespace-nowrap">{text}</p>
                </HoverCardContent>
            </HoverCard>
        )
    }

    return (
        <Badge variant={badgeVariant} className={badgeClass}>
            {text}
        </Badge>
    )
}
