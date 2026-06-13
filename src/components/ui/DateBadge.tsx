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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-brand-primary/10 text-brand-primary border-brand-primary/20">
            {formattedDate}
        </span>
    )
}
