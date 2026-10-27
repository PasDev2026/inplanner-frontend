import { BrainCircuit, LayoutDashboard } from "lucide-react"
import { cn } from "@/features/shared/lib/utils"
import type { DashboardTab } from "@/features/ml-dashboard/types"

const TABS: { value: DashboardTab; label: string; icon: typeof LayoutDashboard }[] = [
  { value: "general", label: "General", icon: LayoutDashboard },
  { value: "ml", label: "ML", icon: BrainCircuit },
]

type DashboardTabsProps = {
  value: DashboardTab
  onChange: (value: DashboardTab) => void
}

export default function DashboardTabs({ value, onChange }: DashboardTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Vistas del dashboard predictivo"
      className="inline-flex w-full rounded-xl border border-border/70 bg-muted/40 p-1 sm:w-auto"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = tab.value === value

        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            id={`predictive-tab-${tab.value}`}
            aria-selected={isActive}
            aria-controls={`predictive-panel-${tab.value}`}
            onClick={() => onChange(tab.value)}
            className={cn(
              "inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-all sm:flex-none",
              isActive
                ? "bg-card text-foreground shadow-sm ring-1 ring-border/60"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className={cn("h-4 w-4", isActive ? "text-brand-primary" : "text-muted-foreground")} />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
