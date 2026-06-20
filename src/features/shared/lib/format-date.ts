import { format as dateFnsFormat } from "date-fns"
import { es } from "date-fns/locale"

export function formatDate(isoString: string | null | undefined): string {
    if (!isoString || typeof isoString !== 'string') return '—'
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '—'
    const formatter = new Intl.DateTimeFormat('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
    return formatter.format(date)
}

export function formatDateShort(isoString: string | null | undefined): string | null {
    if (!isoString || typeof isoString !== 'string') return null
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return null
    return dateFnsFormat(date, "d MMM", { locale: es })
}

export function toDate(iso: unknown): Date | undefined {
    if (!iso || typeof iso !== 'string') return undefined
    const d = new Date(iso)
    return isNaN(d.getTime()) ? undefined : d
}

export function formatDateRange(startDate: string | null | undefined, dueDate: string | null | undefined): string {
    const start = formatDateShort(startDate)
    const end = formatDateShort(dueDate)
    if (start && end) return `${start} → ${end}`
    if (start) return start
    if (end) return end
    return ""
}

export function parseDateInput(value: string): Date | null {
    if (!value) return null
    const date = new Date(value)
    return isNaN(date.getTime()) ? null : date
}

export function toISODateString(date: Date | null): string | null {
    if (!date) return null
    return dateFnsFormat(date, "yyyy-MM-dd")
}

export function toISOString(date: Date | null): string | null {
    if (!date) return null
    return date.toISOString()
}