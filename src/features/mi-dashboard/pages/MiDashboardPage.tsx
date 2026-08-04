import { useMyDashboard } from "@/features/mi-dashboard/hooks/useMyDashboard"
import MyStatsCards from "@/features/mi-dashboard/components/MyStatsCards"
import MyStatusDistribution from "@/features/mi-dashboard/components/MyStatusDistribution"
import MyWeeklyActivity from "@/features/mi-dashboard/components/MyWeeklyActivity"
import MyUpcomingTasks from "@/features/mi-dashboard/components/MyUpcomingTasks"
import MyProjectsList from "@/features/mi-dashboard/components/MyProjectsList"
import { Skeleton } from "@/components/ui/skeleton"

export default function MiDashboardPage() {
  const { data, isLoading, isError } = useMyDashboard()

  if (isError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Mi Dashboard</h1>
        <p className="text-destructive">Error al cargar tus estadísticas</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Mi Dashboard</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          </div>
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-[300px] rounded-xl" />
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <MyStatsCards taskCounts={data.taskCounts} />
          </div>
          <MyStatusDistribution taskCounts={data.taskCounts} projects={data.myProjects} />
          <MyWeeklyActivity />
          <MyUpcomingTasks />
          <MyProjectsList projects={data.myProjects} progress={data.projectProgress} />
        </div>
      ) : null}
    </div>
  )
}
