import type { TemplateItemPayload, TemplateItemTree } from "./types"

export type BuilderItem = {
  id: string
  item_name: string
  item_description: string
  children: BuilderItem[]
}

export function newBuilderItem(): BuilderItem {
  return {
    id: crypto.randomUUID(),
    item_name: "",
    item_description: "",
    children: [],
  }
}

export function treeToPayload(items: BuilderItem[]): TemplateItemPayload[] {
  return items.map((item, index) => ({
    item_name: item.item_name.trim(),
    position: (index + 1) * 1000,
    ...(item.item_description.trim()
      ? { item_description: item.item_description.trim() }
      : {}),
    ...(item.children.length > 0
      ? { children: treeToPayload(item.children) }
      : {}),
  }))
}

export function treeFromDetail(items: TemplateItemTree[]): BuilderItem[] {
  return items.map((item) => ({
    id: `item-${item.id_item}`,
    item_name: item.item_name,
    item_description: item.item_description ?? "",
    children: treeFromDetail(item.children ?? []),
  }))
}

export function findFirstEmptyName(items: BuilderItem[]): BuilderItem | null {
  for (const item of items) {
    if (!item.item_name.trim()) return item
    const empty = findFirstEmptyName(item.children)
    if (empty) return empty
  }
  return null
}
