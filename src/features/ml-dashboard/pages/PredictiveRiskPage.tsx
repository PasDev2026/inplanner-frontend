import { useRef, useState } from "react"
import { cn } from "@/features/shared/lib/utils"
import DashboardTabs from "@/features/ml-dashboard/components/DashboardTabs"
import InsightsPanel from "@/features/ml-dashboard/components/InsightsPanel"
import ModelDetailsPanel from "@/features/ml-dashboard/components/ModelDetailsPanel"
import PredictiveRiskError from "@/features/ml-dashboard/components/PredictiveRiskError"
import PredictiveRiskHeader from "@/features/ml-dashboard/components/PredictiveRiskHeader"
import PredictiveRiskSkeleton from "@/features/ml-dashboard/components/PredictiveRiskSkeleton"
import RiskByDimensionCard from "@/features/ml-dashboard/components/RiskByDimensionCard"
import RiskDistributionCard from "@/features/ml-dashboard/components/RiskDistributionCard"
import RiskKpiScoreboard from "@/features/ml-dashboard/components/RiskKpiScoreboard"
import RiskTasksTable from "@/features/ml-dashboard/components/RiskTasksTable"
import RiskTrendChart from "@/features/ml-dashboard/components/RiskTrendChart"
import TaskRiskDrawer from "@/features/ml-dashboard/components/TaskRiskDrawer"
import { useFullscreen } from "@/features/ml-dashboard/hooks/useFullscreen"
import { usePredictiveRisk } from "@/features/ml-dashboard/hooks/usePredictiveRisk"
import { useRiskTaskFilters } from "@/features/ml-dashboard/hooks/useRiskTaskFilters"
import type { DashboardTab, InsightFilter } from "@/features/ml-dashboard/types"

export default function PredictiveRiskPage() {
  const { data, isLoading, isFetching, refetch } = usePredictiveRisk()
  const [activeTab, setActiveTab] = useState<DashboardTab>("general")
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const { isFullscreen, toggleFullscreen } = useFullscreen(pageRef)

  const {
    filters,
    setFilters,
    sort,
    setSort,
    filteredTasks,
    counts,
    hasActiveFilters,
    clearFilters,
    applyInsightFilter,
  } = useRiskTaskFilters(data?.tasks ?? [])

  const selectedTask =
    data?.tasks.find((task) => task.id === selectedTaskId) ?? null

  const changeTab = (tab: DashboardTab) => {
    setActiveTab(tab)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const openModelTab = () => {
    setSelectedTaskId(null)
    changeTab("ml")
  }

  const handleInsightFilter = (filter: InsightFilter) => {
    applyInsightFilter(filter)
    window.requestAnimationFrame(() => {
      tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  if (isLoading) {
    return <PredictiveRiskSkeleton />
  }

  if (!data) {
    return (
      <PredictiveRiskError
        onRetry={() => {
          void refetch()
        }}
        isRetrying={isFetching}
      />
    )
  }

  return (
    <div
      ref={pageRef}
      className={cn(
        "space-y-5 bg-background",
        isFullscreen && "min-h-screen overflow-y-auto p-6",
      )}
    >
      <PredictiveRiskHeader
        model={data.model}
        isRefreshing={isFetching}
        isFullscreen={isFullscreen}
        onRefresh={() => {
          void refetch()
        }}
        onToggleFullscreen={() => {
          void toggleFullscreen()
        }}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DashboardTabs value={activeTab} onChange={changeTab} />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          General: cartera y prioridades · ML: validación, variables y limitaciones.
        </p>
      </div>

      {activeTab === "general" ? (
        <div
          id="predictive-panel-general"
          role="tabpanel"
          aria-labelledby="predictive-tab-general"
          className="space-y-4"
        >
          <RiskKpiScoreboard
            summary={data.summary}
            model={data.model}
            onOpenModel={openModelTab}
          />

          <div className="grid gap-4 xl:grid-cols-12">
            <div className="xl:col-span-8">
              <RiskTrendChart data={data.summary.trend} />
            </div>
            <div className="xl:col-span-4">
              <RiskDistributionCard
                distribution={data.summary.distribution}
                totalTasks={data.summary.totalTasks}
              />
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-12">
            <div className="xl:col-span-7">
              <RiskByDimensionCard
                byProject={data.summary.byProject}
                bySede={data.summary.bySede}
              />
            </div>
            <div className="xl:col-span-5">
              <InsightsPanel
                insights={data.summary.insights}
                onApplyFilter={handleInsightFilter}
              />
            </div>
          </div>

          <div ref={tableRef} className="scroll-mt-24">
            <RiskTasksTable
              tasks={filteredTasks}
              totalSample={data.tasks.length}
              filters={filters}
              onFiltersChange={setFilters}
              sort={sort}
              onSortChange={setSort}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
              counts={counts}
              filterOptions={data.filterOptions}
              referenceDate={data.model.referenceDate}
              onSelectTask={(task) => setSelectedTaskId(task.id)}
            />
          </div>
        </div>
      ) : (
        <div
          id="predictive-panel-ml"
          role="tabpanel"
          aria-labelledby="predictive-tab-ml"
        >
          <ModelDetailsPanel
            model={data.model}
            featureImportance={data.featureImportance}
            comparison={data.modelComparison}
          />
        </div>
      )}

      <TaskRiskDrawer
        task={selectedTask}
        open={selectedTask !== null}
        model={data.model}
        onOpenChange={(open) => {
          if (!open) setSelectedTaskId(null)
        }}
        onOpenModel={openModelTab}
      />
    </div>
  )
}
