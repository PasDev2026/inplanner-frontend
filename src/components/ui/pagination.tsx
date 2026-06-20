import { memo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

type PaginationProps = {
  page: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  label?: string
}

export const Pagination = memo(function Pagination({ page, total, pageSize, onPageChange, label = "registros" }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .reduce<(number | "...")[]>((acc, p, _i, all) => {
      const first = p === 1
      const last = p === all.length
      const near = Math.abs(p - page) <= 1
      const prevIsEllipsis = acc[acc.length - 1] === "..."
      if (first || last || near) {
        acc.push(p)
      } else if (!prevIsEllipsis) {
        acc.push("...")
      }
      return acc
    }, [])

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-muted/20">
      <p className="text-xs text-muted-foreground font-medium">
        Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} de {total} {label}
      </p>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((item, i) =>
          item === "..." ? (
            <span key={`ellipsis-${i}`} className="px-2 text-xs text-muted-foreground select-none">
              ...
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={`min-w-[28px] h-7 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer ${
                item === page
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {item}
            </button>
          )
        )}
        <button
          disabled={page * pageSize >= total}
          onClick={() => onPageChange(page + 1)}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
})

type LoadMoreButtonProps = {
  onLoadMore: () => void
  hasMore: boolean
  isLoading: boolean
  label?: string
}

export function LoadMoreButton({ onLoadMore, hasMore, isLoading, label = "Cargar más" }: LoadMoreButtonProps) {
  if (!hasMore) return null

  return (
    <div className="flex justify-center py-4">
      <Button
        onClick={onLoadMore}
        disabled={isLoading}
        variant="outline"
      >
        {isLoading ? "Cargando..." : label}
      </Button>
    </div>
  )
}
