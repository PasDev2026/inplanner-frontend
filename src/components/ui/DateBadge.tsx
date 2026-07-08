import { Badge } from "@/components/ui/badge"

type DateBadgeProps = {
    date: string | null | undefined
}

export default function DateBadge({ date }: DateBadgeProps) {
    if (!date) return null

    const formattedDate = new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })

    return (
        <Badge variant="outline">
            {formattedDate}
        </Badge>
    )
}
