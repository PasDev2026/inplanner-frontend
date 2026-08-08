import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { getReportActivities } from "@/features/reports/actions/report.api"
import { REPORT_ACTIVITIES_KEY } from "@/features/reports/lib/report-keys"
import type { ReportFilters } from "@/features/reports/actions/report.api"

export function useReportActivities(filters: ReportFilters) {
  return useQuery({
    queryKey: [...REPORT_ACTIVITIES_KEY, filters],
    queryFn: () => getReportActivities(filters),
    placeholderData: keepPreviousData,
  })
}
