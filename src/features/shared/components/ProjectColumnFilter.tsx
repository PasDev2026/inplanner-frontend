import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PROJECTS_FILTERED_KEY } from "@/features/projects/lib/project-keys"
import { getProjects } from "@/features/projects/actions/project.api"
import { X, Check } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type ProjectColumnFilterProps = {
  selected: number[]
  onChange: (ids: number[]) => void
}

// ponytail: lista con límite 100; si crecen los proyectos, pasar la búsqueda al
// servidor (getProjects({ search })) para no truncar las opciones.
export default function ProjectColumnFilter({ selected, onChange }: ProjectColumnFilterProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const { data } = useQuery({
    queryKey: PROJECTS_FILTERED_KEY({ page: 1, limit: 100 }),
    queryFn: () => getProjects({ page: 1, limit: 100 }),
    staleTime: 5 * 60 * 1000,
  })

  const projects = data?.data ?? []

  const filtered = search
    ? projects.filter((p) =>
        p.name_project.toLowerCase().includes(search.toLowerCase()),
      )
    : projects

  const selectedProjects = projects.filter(p => selected.includes(p.id_project))

  const triggerLabel = selectedProjects.length
    ? selectedProjects.map(p => p.name_project).join(", ")
    : "Proyecto"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors group ${
              selected.length ? "text-brand-primary" : "text-muted-foreground"
            }`}
          >
            <span className="max-w-[120px] truncate">{triggerLabel}</span>
          </button>
        }
      />
      <PopoverContent sideOffset={6} align="start" className="w-56 p-2">
        <div className="space-y-2">
          {selected.length > 0 && (
            <button
              onClick={() => { onChange([]); setSearch("") }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" /> Limpiar
            </button>
          )}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar proyecto..."
            className="w-full rounded-md border border-border bg-card text-foreground px-2.5 py-1.5 text-xs outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            autoFocus
          />
          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {filtered.map((project) => {
              const isSelected = selected.includes(project.id_project)
              return (
                <div
                  key={project.id_project}
                  onClick={() => {
                    onChange(
                      isSelected
                        ? selected.filter(id => id !== project.id_project)
                        : [...selected, project.id_project]
                    )
                    setSearch("")
                  }}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-xs font-medium transition-colors ${
                    isSelected ? "bg-accent text-brand-dark" : "text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="flex-1 truncate">{project.name_project}</span>
                  {isSelected && (
                    <Check className="h-3 w-3 shrink-0" />
                  )}
                </div>
              )
            })}
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">Sin resultados</p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
