import type { ReactNode } from 'react'
import { ShieldOff } from 'lucide-react'
import PageSpinner from '@/components/ui/PageSpinner'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { useDocumentAccess } from '../hooks/useDocumentAccess'

export function DocumentsRoute({ children }: { children: ReactNode }) {
  const { data, isLoading } = useDocumentAccess()

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <PageSpinner fullPage={false} centered={false} />
      </div>
    )
  }

  if (!data?.canView) {
    return (
      <div className="documents-workspace -m-5 flex min-h-[calc(100dvh-4.5rem)] items-center justify-center bg-doc-paper p-6">
        <Empty className="max-w-md rounded-xl border border-doc-line bg-doc-paper-strong/40 p-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShieldOff className="h-5 w-5" />
            </EmptyMedia>
            <EmptyTitle className="text-2xl font-semibold tracking-tight text-doc-ink">
              Sin acceso a Documentos
            </EmptyTitle>
            <EmptyDescription>
              Tu usuario no tiene acceso a este módulo. Pide a un administrador
              que revise tus permisos.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return <>{children}</>
}
