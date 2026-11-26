import { Check, ChevronRight, X } from 'lucide-react'
import { cn } from '@/features/shared/lib/utils'
import type { TransferStatus } from '../lib/types'

const STEPS = [
  { key: 'SOLICITUD', label: 'Solicitud' },
  { key: 'JEFATURA', label: 'Jefatura' },
  { key: 'FINANZAS', label: 'Finanzas' },
  { key: 'OK', label: 'Autorizado' },
  { key: 'SUSTENTADO', label: 'Sustentado' },
  { key: 'PAGADO', label: 'Pagado' },
] as const

const STATUS_INDEX: Record<Exclude<TransferStatus, 'RECHAZADO'>, number> = {
  PENDIENTE_JEFATURA: 1,
  PENDIENTE_FINANZAS: 2,
  OK: 3,
  SUSTENTADO: 4,
  PAGADO: 5,
}

export default function StatusStepper({
  status,
  rejectedStage,
}: {
  status: TransferStatus
  rejectedStage?: 'JEFATURA' | 'FINANZAS' | null
}) {
  const isRejected = status === 'RECHAZADO'
  const currentIndex = isRejected
    ? rejectedStage === 'FINANZAS'
      ? 2
      : 1
    : STATUS_INDEX[status]
  const allComplete = status === 'PAGADO'

  return (
    <div className="flex items-center overflow-x-auto pb-1">
      {STEPS.map((step, index) => {
        const complete = allComplete || index < currentIndex
        const current = !isRejected && !allComplete && index === currentIndex
        const rejected = isRejected && index === currentIndex

        return (
          <div key={step.key} className="flex shrink-0 items-center">
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-semibold',
                complete &&
                  'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
                current &&
                  'border-brand-primary bg-brand-primary/10 text-brand-dark dark:text-brand-light',
                rejected &&
                  'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
                !complete &&
                  !current &&
                  !rejected &&
                  'border-border text-muted-foreground',
              )}
            >
              {complete ? (
                <Check className="h-3.5 w-3.5" />
              ) : rejected ? (
                <X className="h-3.5 w-3.5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span
              className={cn(
                'ml-1.5 text-[11px] font-medium whitespace-nowrap',
                complete && 'text-emerald-700 dark:text-emerald-300',
                current && 'text-brand-dark dark:text-brand-light',
                rejected && 'text-rose-700 dark:text-rose-300',
                !complete &&
                  !current &&
                  !rejected &&
                  'text-muted-foreground',
              )}
            >
              {step.label}
            </span>
            {index < STEPS.length - 1 && (
              <ChevronRight className="mx-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            )}
          </div>
        )
      })}
    </div>
  )
}
