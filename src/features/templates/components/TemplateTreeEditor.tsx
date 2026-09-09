import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react"
import { cn } from "@/features/shared/lib/utils"
import type { BuilderItem } from "../lib/template-tree"
import { newBuilderItem } from "../lib/template-tree"

type TemplateTreeEditorProps = {
  items: BuilderItem[]
  onChange: (items: BuilderItem[]) => void
  depth?: number
  addLabel?: string
}

function updateList(
  items: BuilderItem[],
  id: string,
  updater: (item: BuilderItem) => BuilderItem,
): BuilderItem[] {
  return items.map((item) =>
    item.id === id
      ? updater(item)
      : { ...item, children: updateList(item.children, id, updater) },
  )
}

function removeItem(items: BuilderItem[], id: string): BuilderItem[] {
  return items
    .filter((item) => item.id !== id)
    .map((item) => ({ ...item, children: removeItem(item.children, id) }))
}

function moveItem(items: BuilderItem[], id: string, offset: number): BuilderItem[] {
  const index = items.findIndex((item) => item.id === id)
  const target = index + offset
  if (index === -1 || target < 0 || target >= items.length) {
    return items.map((item) => ({ ...item, children: moveItem(item.children, id, offset) }))
  }
  const next = [...items]
  const [moved] = next.splice(index, 1)
  next.splice(target, 0, moved)
  return next
}

export default function TemplateTreeEditor({
  items,
  onChange,
  depth = 0,
  addLabel = "Añadir tarea",
}: TemplateTreeEditorProps) {
  const rowButton =
    "p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
  const rowButtonDisabled = "opacity-30 pointer-events-none"

  return (
    <div className={cn(depth > 0 && "ml-6 border-l border-border pl-3")}>
      <div className="space-y-1.5">
        {items.map((item, index) => (
          <div key={item.id} className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={item.item_name}
                onChange={(e) =>
                  onChange(
                    updateList(items, item.id, (it) => ({
                      ...it,
                      item_name: e.target.value,
                    })),
                  )
                }
                placeholder={
                  depth === 0 ? "Nombre de la tarea" : "Nombre de la subtarea"
                }
                className={cn(
                  "flex-1 min-w-0 text-sm rounded-md border border-border bg-[var(--input-bg)] px-2.5 py-1.5",
                  "focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/40",
                  "placeholder:text-muted-foreground/60 transition-colors",
                )}
              />
              <button
                type="button"
                title="Subir"
                disabled={index === 0}
                className={cn(rowButton, index === 0 && rowButtonDisabled)}
                onClick={() => onChange(moveItem(items, item.id, -1))}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                title="Bajar"
                disabled={index === items.length - 1}
                className={cn(rowButton, index === items.length - 1 && rowButtonDisabled)}
                onClick={() => onChange(moveItem(items, item.id, 1))}
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                title="Añadir subtarea"
                className={cn(rowButton, "text-brand-primary hover:text-brand-dark")}
                onClick={() =>
                  onChange(
                    updateList(items, item.id, (it) => ({
                      ...it,
                      children: [...it.children, newBuilderItem()],
                    })),
                  )
                }
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                title="Eliminar"
                className={cn(rowButton, "text-destructive hover:text-destructive/80")}
                onClick={() => {
                  const next = removeItem(items, item.id)
                  onChange(next.length > 0 ? next : [newBuilderItem()])
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            {item.children.length > 0 && (
              <TemplateTreeEditor
                items={item.children}
                onChange={(children) =>
                  onChange(
                    updateList(items, item.id, (it) => ({ ...it, children })),
                  )
                }
                depth={depth + 1}
                addLabel="Añadir subtarea"
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange([...items, newBuilderItem()])}
        className="mt-2 flex items-center gap-1 text-xs text-brand-primary hover:text-brand-dark transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        {addLabel}
      </button>
    </div>
  )
}
