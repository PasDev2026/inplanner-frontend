export type TemplateItemTree = {
  id_item: number
  item_name: string
  item_description: string | null
  position: number
  priority: number | null
  children: TemplateItemTree[]
}

export type TemplateSummary = {
  id_template: number
  template_name: string
  owner_id: string
  owner_name?: string
  items_count: number
  created_at: string
  updated_at: string
}

export type TemplateDetail = TemplateSummary & {
  items: TemplateItemTree[]
}

export type TemplateItemPayload = {
  item_name: string
  item_description?: string
  position?: number
  priority?: number
  children?: TemplateItemPayload[]
}

export type ApplyTemplateResult = import("@/features/shared/lib/types").BackendTask[]
