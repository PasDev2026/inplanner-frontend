import { useQuery } from "@tanstack/react-query"
import { fetchPredictiveRisk } from "@/features/ml-dashboard/services/predictive-risk.service"

export const PREDICTIVE_RISK_QUERY_KEY = ["ml-dashboard", "predictive-risk"] as const

export function usePredictiveRisk() {
  return useQuery({
    queryKey: PREDICTIVE_RISK_QUERY_KEY,
    queryFn: fetchPredictiveRisk,
    staleTime: 5 * 60_000,
    retry: 1,
  })
}
