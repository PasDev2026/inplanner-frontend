import { useState } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, Check, ChevronDown } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  filterTriggerClass,
} from "@/features/shared/lib/filter-trigger"
import { cn } from "@/features/shared/lib/utils"

export type DiagramSort = { field: string; order: string } | null

const SORT_FIELDS = [
  { field: "name_project", label: "Proyecto" },
  { field: "responsible_name", label: "Responsable" },
  { field: "due_date", label: "Fecha de vencimiento" },
  { field: "priority", label: "Prioridad" },
  { field: "status", label: "Estado" },
] as const

type ProjectsBranchSortProps = {
  sort: DiagramSort
  onSortChange: (sort: DiagramSort) => void
}

export default function ProjectsBranchSort({
  sort,
  onSortChange,
}: ProjectsBranchSortProps) {
  const [open, setOpen] = useState(false)
  const activeLabel = SORT_FIELDS.find((opt) => opt.field === sort?.field)?.label
  const isDesc = sort?.order === "DESC"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button className={filterTriggerClass("chip", !!sort)}>
            {isDesc ? (
              <ArrowDown className="h-3.5 w-3.5" />
            ) : sort ? (
              <ArrowUp className="h-3.5 w-3.5" />
            ) : (
              <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
            )}
            <span className="max-w-[140px] truncate">{activeLabel ?? "Ordenar"}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </button>
        }
      />
      <PopoverContent sideOffset={6} align="end" className="w-52 p-1.5">
        <button
          type="button"
          onClick={() => {
            onSortChange(null)
            setOpen(false)
          }}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
            !sort ? "bg-accent text-brand-dark" : "text-muted-foreground hover:bg-muted",
          )}
        >
          <ArrowUpDown className="h-3 w-3" />
          Sin orden
        </button>
        {SORT_FIELDS.map((opt) => {
          const isActive = sort?.field === opt.field
          return (
            <button
              key={opt.field}
              type="button"
              onClick={() => {
                onSortChange({
                  field: opt.field,
                  order: isActive && !isDesc ? "DESC" : "ASC",
                })
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                isActive ? "bg-accent text-brand-dark" : "text-foreground hover:bg-muted",
              )}
            >
              <span className="flex-1 text-left">{opt.label}</span>
              {isActive && (
                <>
                  {isDesc ? (
                    <ArrowDown className="h-3 w-3" />
                  ) : (
                    <ArrowUp className="h-3 w-3" />
                  )}
                  <Check className="h-3 w-3" />
                </>
              )}
            </button>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}
