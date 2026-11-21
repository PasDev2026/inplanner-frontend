import { describe, expect, it } from 'vitest'
import {
  buildSedeNameMap,
  collectExpandedIds,
  filterFolderTree,
  flattenFolders,
  formatSedeName,
} from './folder-utils'
import type { FolderNode } from './types'

function folder(partial: Partial<FolderNode> & Pick<FolderNode, 'id' | 'name'>): FolderNode {
  return {
    id: partial.id,
    name: partial.name,
    parentId: null,
    rootFolderId: null,
    privacyLevel: 0,
    privacyLabel: 'Público',
    owner: null,
    areaId: null,
    areaName: null,
    sedeId: null,
    canEdit: false,
    createdAt: '2026-11-21T00:00:00.000Z',
    updatedAt: '2026-11-21T00:00:00.000Z',
    ...partial,
  }
}

describe('folder-utils', () => {
  it('flattens the tree and preserves the full path', () => {
    const tree = [
      folder({
        id: 'root',
        name: 'Manuales',
        children: [
          folder({
            id: 'child',
            name: 'Operaciones',
            parentId: 'root',
            children: [
              folder({
                id: 'grandchild',
                name: '2026',
                parentId: 'child',
              }),
            ],
          }),
        ],
      }),
    ]

    expect(flattenFolders(tree).map((item) => item.path)).toEqual([
      'Manuales',
      'Manuales / Operaciones',
      'Manuales / Operaciones / 2026',
    ])
  })

  it('calculates root id and direct children count', () => {
    const tree = [
      folder({
        id: 'root',
        name: 'Manuales',
        children: [
          folder({ id: 'child-a', name: 'A', parentId: 'root' }),
          folder({ id: 'child-b', name: 'B', parentId: 'root' }),
        ],
      }),
    ]

    const [root, child] = flattenFolders(tree)

    expect(root.rootId).toBe('root')
    expect(root.childrenCount).toBe(2)
    expect(child.rootId).toBe('root')
    expect(child.depth).toBe(1)
  })

  it('removes the INSALUD prefix from sede names', () => {
    expect(formatSedeName('INSALUD Hub')).toBe('Hub')
    expect(formatSedeName('insalud Sur')).toBe('Sur')
    expect(formatSedeName('Sede Central')).toBe('Sede Central')
    expect(formatSedeName(null)).toBeNull()
  })

  it('builds a sede name map by id', () => {
    const map = buildSedeNameMap([
      { id: 'sede-1', nombre: 'INSALUD Hub' },
      { id: 'sede-2', nombre: 'INSALUD Sur' },
    ])

    expect(map.get('sede-1')).toBe('INSALUD Hub')
    expect(map.get('sede-2')).toBe('INSALUD Sur')
  })

  it('filters the tree keeping ancestors of matching folders', () => {
    const tree = [
      folder({
        id: 'root',
        name: 'TEST',
        children: [
          folder({
            id: 'a',
            name: 'Operaciones',
            parentId: 'root',
            children: [
              folder({ id: 'a1', name: '2026', parentId: 'a' }),
            ],
          }),
          folder({ id: 'b', name: 'Otros', parentId: 'root' }),
        ],
      }),
    ]

    const filtered = filterFolderTree(tree, (item) => item.name === '2026')

    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('root')
    expect(filtered[0].children?.[0].id).toBe('a')
    expect(filtered[0].children?.[0].children?.[0].id).toBe('a1')
  })

  it('keeps the whole subtree when a parent matches', () => {
    const tree = [
      folder({
        id: 'root',
        name: 'TEST',
        children: [folder({ id: 'child', name: 'Hija', parentId: 'root' })],
      }),
    ]

    const filtered = filterFolderTree(tree, (item) => item.name === 'TEST')

    expect(filtered[0].children?.[0].id).toBe('child')
  })

  it('collects ids of all folders that have children', () => {
    const tree = [
      folder({
        id: 'root',
        name: 'TEST',
        children: [
          folder({
            id: 'child',
            name: 'Hija',
            parentId: 'root',
            children: [folder({ id: 'leaf', name: 'Nieta', parentId: 'child' })],
          }),
        ],
      }),
    ]

    expect(collectExpandedIds(tree)).toEqual(['root', 'child'])
  })
})
