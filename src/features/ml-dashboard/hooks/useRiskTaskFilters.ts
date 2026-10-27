import { useCallback, useMemo, useState } from "react"
import type {
  InsightFilter,
  PredictiveTask,
  RiskLevel,
  TaskFilters,
  TaskSort,
} from "@/features/ml-dashboard/types"
import { filterAndSortTasks } from "@/features/ml-dashboard/lib/risk"

const EMPTY_FILTERS: TaskFilters = {
  search: "",
  sede: "all",
  project: "all",
  risk: "all",
}

export function useRiskTaskFilters(tasks: PredictiveTask[]) {
  const [filters, setFilters] = useState<TaskFilters>(EMPTY_FILTERS)
  const [sort, setSort] = useState<TaskSort>("probability_desc")

  const filteredTasks = useMemo(
    () => filterAndSortTasks(tasks, filters, sort),
    [tasks, filters, sort],
  )

  const counts = useMemo(() => {
    const aggregated = tasks.reduce<Record<RiskLevel, number>>(
      (accumulator, task) => {
        accumulator[task.risk] += 1
        return accumulator
      },
      { alto: 0, medio: 0, bajo: 0 },
    )

    return {
      total: tasks.length,
      ...aggregated,
    }
  }, [tasks])

  const hasActiveFilters =
    filters.search.trim().length > 0 ||
    filters.sede !== "all" ||
    filters.project !== "all" ||
    filters.risk !== "all"

  const clearFilters = useCallback(() => {
    setFilters({ ...EMPTY_FILTERS })
    setSort("probability_desc")
  }, [])

  const applyInsightFilter = useCallback((filter: InsightFilter) => {
    setFilters({
      ...EMPTY_FILTERS,
      ...(filter.type === "sede"
        ? { sede: filter.value }
        : filter.type === "project"
          ? { project: filter.value }
          : { risk: filter.value }),
    })
    setSort("probability_desc")
  }, [])

  return {
    filters,
    setFilters,
    sort,
    setSort,
    filteredTasks,
    counts,
    hasActiveFilters,
    clearFilters,
    applyInsightFilter,
  }
}
