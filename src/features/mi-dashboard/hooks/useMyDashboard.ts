import { useQuery } from "@tanstack/react-query"
import { fetchMyStats } from "@/features/mi-dashboard/actions/mi-dashboard.api"
import { MY_STATS_KEY } from "@/features/mi-dashboard/lib/mi-dashboard-keys"

export function useMyDashboard() {
  return useQuery({
    queryKey: MY_STATS_KEY,
    queryFn: fetchMyStats,
    staleTime: 0,
  })
}
