import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination"
import { ReportsFilters } from "@/features/reports/components/ReportsFilters"
import { ReportsTable } from "@/features/reports/components/ReportsTable"
import { useReportsFilters } from "@/features/reports/hooks/useReportsFilters"
import { useReportActivities } from "@/features/reports/hooks/useReportActivities"
import { exportReportActivities } from "@/features/reports/actions/report.api"
import { getSedes } from "@/features/shared/actions/centralizado.api"
import { SEDES_KEY } from "@/features/shared/lib/shared-keys"

const PAGE_SIZE = 50

export default function ReportsPage() {
  const {
    searchInput, setSearchInput,
    sedeInput, setSedeInput,
    responsibleInput, setResponsibleInput,
    projectInput, setProjectInput,
    dateFromInput, setDateFromInput,
    dateToInput, setDateToInput,
    statusInput, setStatusInput,
    priorityInput, setPriorityInput,
    page, setPage,
    debouncedFilters,
    isSearching,
    hasActiveFilters,
    clearAllFilters,
  } = useReportsFilters()

  const [exporting, setExporting] = useState(false)

  const { data: sedes = [] } = useQuery({
    queryKey: SEDES_KEY,
    queryFn: getSedes,
  })

  const { data, isLoading, isFetching } = useReportActivities({
    ...debouncedFilters,
    page,
    limit: PAGE_SIZE,
  })

  const activities = data?.data ?? []
  const total = data?.meta.total ?? 0

  const statusSelected = statusInput.split(",").filter(Boolean)
  const prioritySelected = priorityInput.split(",").filter(Boolean).map(Number)
  const responsibleSelected = responsibleInput.split(",").filter(Boolean)
  const projectSelected = projectInput.split(",").filter(Boolean).map(Number)

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportReportActivities({ ...debouncedFilters })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reportes</h1>
          <p className="text-muted-foreground text-sm">Actividades de todos tus proyectos</p>
        </div>
        <Button onClick={handleExport} disabled={exporting}>
          <Download className="h-4 w-4 mr-2" />
          {exporting ? "Exportando..." : "Exportar Excel"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <ReportsFilters
            search={searchInput}
            onSearchChange={setSearchInput}
            sede={sedeInput}
            onSedeChange={setSedeInput}
            dateFrom={dateFromInput}
            dateTo={dateToInput}
            onDateRangeChange={(from, to) => { setDateFromInput(from); setDateToInput(to) }}
            isSearching={isSearching}
            sedes={sedes}
            onClearAll={clearAllFilters}
          />
        </CardContent>
      </Card>

      <ReportsTable
        activities={activities}
        isLoading={isLoading}
        isFetching={isFetching}
        hasActiveFilters={hasActiveFilters}
        searchTerm={debouncedFilters.search}
        statusSelected={statusSelected}
        onStatusFilter={(v) => setStatusInput(v.join(","))}
        prioritySelected={prioritySelected}
        onPriorityFilter={(v) => setPriorityInput(v.join(","))}
        responsibleSelected={responsibleSelected}
        onResponsibleFilter={(v) => setResponsibleInput(v.join(","))}
        projectSelected={projectSelected}
        onProjectFilter={(v) => setProjectInput(v.join(","))}
      />

      {!isLoading && activities.length > 0 && (
        <Pagination
          page={page}
          total={total}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          label="actividades"
        />
      )}
    </div>
  )
}
