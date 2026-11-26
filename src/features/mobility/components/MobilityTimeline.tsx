import {
  CheckCircle2,
  ChevronDown,
  FilePlus2,
  Paperclip,
  Wallet,
  XCircle,
} from 'lucide-react'
import { cn } from '@/features/shared/lib/utils'
import { formatDateTime } from '../lib/format'
import type { TransferEvent, TransferEventType } from '../lib/types'

const EVENT_META: Record<
  TransferEventType,
  { icon: typeof CheckCircle2; classes: string }
> = {
  CREATED: {
    icon: FilePlus2,
    classes:
      'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300',
  },
  SUPERVISOR_APPROVED: {
    icon: CheckCircle2,
    classes:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
  FINANCE_APPROVED: {
    icon: CheckCircle2,
    classes:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
  SUPERVISOR_REJECTED: {
    icon: XCircle,
    classes:
      'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
  },
  FINANCE_REJECTED: {
    icon: XCircle,
    classes:
      'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
  },
  EVIDENCE_UPLOADED: {
    icon: Paperclip,
    classes:
      'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300',
  },
  PAYMENT_REGISTERED: {
    icon: Wallet,
    classes:
      'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300',
  },
}

export default function MobilityTimeline({
  events,
}: {
  events: TransferEvent[]
}) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Sin movimientos registrados.
      </p>
    )
  }

  return (
    <ol>
      {events.map((event, index) => {
        const isLast = index === events.length - 1
        const meta = EVENT_META[event.event_type]
        const Icon = meta.icon

        return (
          <li key={event.id_event} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border',
                  meta.classes,
                  isLast &&
                    'ring-2 ring-brand-primary/25 ring-offset-2 ring-offset-background',
                )}
              >
                <Icon className="h-4 w-4" />
              </span>

              {!isLast && (
                <div className="flex flex-1 flex-col items-center justify-center py-1">
                  <span className="w-px flex-1 bg-border" />
                  <ChevronDown className="my-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                  <span className="w-px flex-1 bg-border" />
                </div>
              )}
            </div>

            <div className={cn('min-w-0 flex-1 pt-1', !isLast && 'pb-4')}>
              <p className="text-sm font-medium">{event.event_label}</p>
              <p className="text-xs text-muted-foreground">
                {event.actor.nombre_completo} ·{' '}
                {formatDateTime(event.created_at)}
              </p>
              {event.comment && (
                <p className="mt-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs text-muted-foreground">
                  {event.comment}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
