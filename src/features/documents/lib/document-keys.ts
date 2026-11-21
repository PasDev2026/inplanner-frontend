import type {
  QueryDocumentsParams,
  QueryPermissionsParams,
  QueryTrashParams,
} from './types'

export const documentKeys = {
  all: ['documents'] as const,
  access: ['documentAccess'] as const,
  tree: ['documentFolders'] as const,
  folder: (id: string) => ['documentFolder', id] as const,
  folderAll: ['documentFolder'] as const,
  list: (params: QueryDocumentsParams) => ['documents', params] as const,
  trash: (params: QueryTrashParams) => ['documentsTrash', params] as const,
  trashAll: ['documentsTrash'] as const,
  permissions: (params: QueryPermissionsParams) =>
    ['documentPermissions', params] as const,
  users: (search: string) => ['documentUsers', search] as const,
}
