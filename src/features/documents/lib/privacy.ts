export const PRIVACY_OPTIONS = [
  {
    value: 0,
    label: 'Público',
    description: 'Cualquier trabajador puede verla.',
    tone: 'text-doc-accent',
    dot: 'bg-doc-accent',
  },
  {
    value: 1,
    label: 'Solo mi área',
    description: 'Solo las personas de la misma área.',
    tone: 'text-doc-ink',
    dot: 'bg-doc-ink',
  },
  {
    value: 2,
    label: 'Solo mi sede',
    description: 'Solo las personas de la misma sede.',
    tone: 'text-doc-muted',
    dot: 'bg-doc-muted',
  },
  {
    value: 3,
    label: 'Solo mencionados',
    description: 'Solo las personas que elijas.',
    tone: 'text-doc-warning',
    dot: 'bg-doc-warning',
  },
  {
    value: 4,
    label: 'Privado',
    description: 'Solo tú y el superadministrador.',
    tone: 'text-doc-danger',
    dot: 'bg-doc-danger',
  },
] as const

export function privacyLabel(level: number): string {
  return PRIVACY_OPTIONS.find((option) => option.value === level)?.label ?? 'Público'
}

export function privacyTone(level: number): string {
  return PRIVACY_OPTIONS.find((option) => option.value === level)?.tone ?? 'text-doc-accent'
}

export function privacyDot(level: number): string {
  return PRIVACY_OPTIONS.find((option) => option.value === level)?.dot ?? 'bg-doc-accent'
}

export const PRIVACY_LABEL_MAP: Record<number, string> = Object.fromEntries(
  PRIVACY_OPTIONS.map((option) => [option.value, option.label]),
)
