import { describe, expect, it } from 'vitest'
import {
  DOCUMENT_PAGE_SIZE,
  buildDocumentListParams,
  buildFolderSubtitle,
} from './document-list'

describe('document-list', () => {
  it('searches globally when there is a search term', () => {
    expect(
      buildDocumentListParams({
        isSearching: true,
        search: 'manual',
        activeFolderId: 'folder-1',
        activeRootId: 'root-1',
      }),
    ).toEqual({ q: 'manual', page: 1, limit: DOCUMENT_PAGE_SIZE })
  })

  it('filters by the selected subfolder', () => {
    expect(
      buildDocumentListParams({
        isSearching: false,
        search: '',
        activeFolderId: 'folder-1',
        activeRootId: 'root-1',
      }),
    ).toEqual({ folderId: 'folder-1', page: 1, limit: DOCUMENT_PAGE_SIZE })
  })

  it('filters by the selected root when no subfolder is active', () => {
    expect(
      buildDocumentListParams({
        isSearching: false,
        search: '',
        activeFolderId: null,
        activeRootId: 'root-1',
      }),
    ).toEqual({ folderId: 'root-1', page: 1, limit: DOCUMENT_PAGE_SIZE })
  })

  it('falls back to the global list when there is no folder scope', () => {
    expect(
      buildDocumentListParams({
        isSearching: false,
        search: '',
        activeFolderId: null,
        activeRootId: null,
      }),
    ).toEqual({ page: 1, limit: DOCUMENT_PAGE_SIZE })
  })

  it('uses the folder subtitle when a root or folder is selected', () => {
    expect(buildFolderSubtitle(null, 'root-1')).toBe('Documentos de la carpeta')
    expect(buildFolderSubtitle('folder-1', 'root-1')).toBe(
      'Documentos de la carpeta',
    )
    expect(buildFolderSubtitle(null, null)).toBe('Recientes en el archivo')
  })
})
