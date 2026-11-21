import type { FolderNode } from './types'

export function countFolderDocuments(
  node: FolderNode | null | undefined,
): number {
  if (!node) return 0

  return (
    (node.documentsCount ?? 0) +
    (node.children ?? []).reduce(
      (total, child) => total + countFolderDocuments(child),
      0,
    )
  )
}

export interface FlatFolder
  extends Omit<FolderNode, 'children' | 'breadcrumb'> {
  path: string
  rootId: string
  depth: number
  childrenCount: number
}

export function flattenFolders(
  nodes: FolderNode[],
  parentPath: string[] = [],
  rootId: string | null = null,
  depth = 0,
): FlatFolder[] {
  return nodes.flatMap((node) => {
    const children = node.children ?? []
    const currentRootId = rootId ?? node.id
    const pathParts = [...parentPath, node.name]

    return [
      {
        id: node.id,
        name: node.name,
        parentId: node.parentId,
        rootFolderId: node.rootFolderId,
        privacyLevel: node.privacyLevel,
        privacyLabel: node.privacyLabel,
        owner: node.owner,
        areaId: node.areaId,
        areaName: node.areaName,
        sedeId: node.sedeId,
        canEdit: node.canEdit,
        documentsCount: node.documentsCount,
        mentionedUsers: node.mentionedUsers,
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
        path: pathParts.join(' / '),
        rootId: currentRootId,
        depth,
        childrenCount: children.length,
      },
      ...flattenFolders(children, pathParts, currentRootId, depth + 1),
    ]
  })
}

/**
 * Filtra el árbol conservando los ancestros de las coincidencias. Si una
 * carpeta coincide, se conserva toda su rama para dar contexto.
 */
export function filterFolderTree(
  nodes: FolderNode[],
  predicate: (folder: FolderNode) => boolean,
): FolderNode[] {
  return nodes.flatMap((node) => {
    if (predicate(node)) {
      return [node]
    }

    const children = filterFolderTree(node.children ?? [], predicate)
    if (children.length === 0) {
      return []
    }

    return [{ ...node, children }]
  })
}

export function collectExpandedIds(nodes: FolderNode[]): string[] {
  return nodes.flatMap((node) => {
    const children = node.children ?? []
    if (children.length === 0) {
      return []
    }

    return [node.id, ...collectExpandedIds(children)]
  })
}

export function formatSedeName(name: string | null | undefined): string | null {
  if (!name) return null
  return name.replace(/^insalud\s+/i, '').trim() || name
}

export function buildSedeNameMap(
  sedes: { id: string; nombre: string }[],
): Map<string, string> {
  return new Map(sedes.map((sede) => [sede.id, sede.nombre]))
}
