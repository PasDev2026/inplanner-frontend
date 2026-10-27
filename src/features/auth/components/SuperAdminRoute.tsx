import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuthContext } from "@/features/auth/hooks/useAuthContext"
import { isSuperAdmin } from "@/features/shared/lib/policies"

type SuperAdminRouteProps = {
  children: ReactNode
}

export default function SuperAdminRoute({ children }: SuperAdminRouteProps) {
  const { user } = useAuthContext()

  if (!user || !isSuperAdmin(user)) {
    return <Navigate to="/mi-dashboard" replace />
  }

  return <>{children}</>
}
