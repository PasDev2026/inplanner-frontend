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

    const baseClasses = "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border"
    
    let colorClasses = "bg-muted text-muted-foreground border-border"
    let text = `Vence: ${formattedDate}`

    if (isOverdue) {
        colorClasses = "bg-destructive/15 text-destructive border-destructive/25"
        text = `Vencido: ${formattedDate}`
    } else if (isNearDue) {
        colorClasses = "bg-warning/15 text-warning border-warning/25"
        text = daysUntilDue === 0 ? "Vence hoy" : `Vence en ${daysUntilDue} días`
    }

    if (variant === 'compact') {
        return (
            <HoverCard>
                <HoverCardTrigger>
                    <span className={`${baseClasses} ${colorClasses}`}>
                        {formattedDate}
                    </span>
                </HoverCardTrigger>
                <HoverCardContent>
                    <p className="text-xs whitespace-nowrap">{text}</p>
                </HoverCardContent>
            </HoverCard>
        )
    }

    return (
        <span className={`${baseClasses} ${colorClasses}`}>
            {text}
        </span>
    )
}
