import { useQuery } from "@tanstack/react-query"
import { fetchDashboardStats } from "@/features/dashboard/actions/dashboard.api"
import { DASHBOARD_STATS_KEY } from "@/features/dashboard/lib/dashboard-keys"

export function useDashboard() {
  return useQuery({
    queryKey: DASHBOARD_STATS_KEY,
    queryFn: fetchDashboardStats,
  })
}
