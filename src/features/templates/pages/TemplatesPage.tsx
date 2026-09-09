import { useState } from "react"
import { format } from "date-fns"
import { LayoutTemplate, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import PageSpinner from "@/components/ui/PageSpinner"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { useTemplates, isSuperAdminUser } from "../hooks/useTemplateQueries"
import { useTemplateMutations } from "../hooks/useTemplateMutations"
import type { TemplateSummary } from "../lib/types"
import TemplateBuilderDialog from "../components/TemplateBuilderDialog"
import { useAuthContext } from "@/features/auth/hooks/useAuthContext"

export default function TemplatesPage() {
  const { data: templates = [], isLoading } = useTemplates()
  const { deleteMutation } = useTemplateMutations()
  const { user } = useAuthContext()
  const isAdmin = isSuperAdminUser(user?.roles)
  const [builderOpen, setBuilderOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | undefined>(undefined)

  const openCreate = () => {
    setEditingId(undefined)
    setBuilderOpen(true)
  }

  const openEdit = (template: TemplateSummary) => {
    setEditingId(template.id_template)
    setBuilderOpen(true)
  }

  const handleDelete = (template: TemplateSummary) => {
    toast(`¿Eliminar "${template.template_name}"?`, {
      description: "La plantilla dejará de estar disponible en tus proyectos",
      action: {
        label: "Eliminar",
        onClick: () => deleteMutation.mutate(template.id_template),
      },
    })
  }

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plantillas</h1>
          <p className="text-muted-foreground text-sm">
            Grupos de tareas y subtareas reutilizables para tus proyectos
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1.5" />
          Nueva plantilla
        </Button>
      </div>

      {isLoading ? (
        <div className="py-16 flex items-center justify-center">
          <PageSpinner fullPage={false} centered={false} />
        </div>
      ) : templates.length === 0 ? (
        <Empty className="border border-border py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LayoutTemplate />
            </EmptyMedia>
            <EmptyTitle>Aún no tienes plantillas</EmptyTitle>
            <EmptyDescription>
              Crea tu primera plantilla con el conjunto de tareas de un proceso
              repetitivo, y aplícala en tus proyectos con un clic.
            </EmptyDescription>
            <Button onClick={openCreate} className="mt-2">
              <Plus className="h-4 w-4 mr-1.5" />
              Crear plantilla
            </Button>
          </EmptyHeader>
        </Empty>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {templates.map((template) => (
              <div
                key={template.id_template}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                  <LayoutTemplate className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {template.template_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isAdmin && template.owner_name && (
                      <span className="text-foreground/70">
                        {template.owner_name} ·{" "}
                      </span>
                    )}
                    {template.items_count}{" "}
                    {template.items_count === 1 ? "tarea" : "tareas"} · Creada
                    el{" "}
                    {format(new Date(template.created_at), "dd/MM/yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Editar plantilla"
                    onClick={() => openEdit(template)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Eliminar plantilla"
                    className="text-destructive hover:text-destructive/80"
                    onClick={() => handleDelete(template)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <TemplateBuilderDialog
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        templateId={editingId}
      />
    </div>
  )
}
