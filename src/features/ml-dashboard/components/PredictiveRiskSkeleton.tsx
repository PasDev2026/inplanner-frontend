import { Skeleton } from "@/components/ui/skeleton"

export default function PredictiveRiskSkeleton() {
  return (
    <div className="space-y-5" aria-label="Cargando dashboard predictivo" role="status">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-10 w-[min(100%,420px)]" />
          <Skeleton className="h-4 w-[min(100%,520px)]" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-64 rounded-full" />
            <Skeleton className="h-7 w-52 rounded-full" />
            <Skeleton className="h-7 w-44 rounded-full" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-40 rounded-lg" />
        </div>
      </div>

      <Skeleton className="h-11 w-56 rounded-xl" />

      <div className="grid gap-4 xl:grid-cols-12">
        <Skeleton className="h-[150px] rounded-xl xl:col-span-8" />
        <Skeleton className="h-[150px] rounded-xl xl:col-span-4" />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Skeleton className="h-[340px] rounded-xl xl:col-span-8" />
        <Skeleton className="h-[340px] rounded-xl xl:col-span-4" />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Skeleton className="h-[400px] rounded-xl xl:col-span-7" />
        <Skeleton className="h-[400px] rounded-xl xl:col-span-5" />
      </div>

      <Skeleton className="h-[520px] rounded-xl" />
      <span className="sr-only">Cargando datos mock del modelo predictivo…</span>
    </div>
  )
}
