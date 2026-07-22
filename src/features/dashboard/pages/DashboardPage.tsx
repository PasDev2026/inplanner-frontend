import { useDashboard } from "@/features/dashboard/hooks/useDashboard"
import StatsCards from "@/features/dashboard/components/StatsCards"
import OverviewChart from "@/features/dashboard/components/OverviewChart"
import OverallProgress from "@/features/dashboard/components/OverallProgress"
import ProjectDistribution from "@/features/dashboard/components/ProjectDistribution"
import UpcomingTasks from "@/features/dashboard/components/UpcomingTasks"
import TasksByUser from "@/features/dashboard/components/TasksByUser"
import RecentProjects from "@/features/dashboard/components/RecentProjects"
import MonthlyProgress from "@/features/dashboard/components/MonthlyProgress"
import BySedeChart from "@/features/dashboard/components/BySedeChart"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboard()

  if (isError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-destructive">Error al cargar estadísticas</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <Skeleton className="h-[300px] w-full rounded-xl" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <Skeleton className="h-[320px] w-full rounded-xl" />
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
          <div className="flex flex-col gap-6">
            <Skeleton className="h-[340px] w-full rounded-xl" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <Skeleton className="h-[300px] w-full rounded-xl" />
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </div>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <StatsCards projectCounts={data.projectCounts} taskCounts={data.taskCounts} />
          </div>
          <div className="flex flex-col gap-6">
            <OverviewChart taskCounts={data.taskCounts} />
            <UpcomingTasks tasks={data.upcomingDeadlines} />
            <ProjectDistribution projectCounts={data.projectCounts} taskCounts={data.taskCounts} />
            <BySedeChart />
          </div>
          <div className="flex flex-col gap-6">
            <OverallProgress taskCounts={data.taskCounts} projectCounts={data.projectCounts} />
            <TasksByUser data={data.tasksByUser} />
            <MonthlyProgress />
            <RecentProjects projects={data.recentProjects} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
