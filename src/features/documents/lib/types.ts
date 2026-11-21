export type PrivacyLevel = 0 | 1 | 2 | 3 | 4

export interface FolderOwner {
  id: string
  name: string
}

export interface MentionedUser {
  id: string
  name: string
}

export interface FolderNode {
  id: string
  name: string
  parentId: string | null
  rootFolderId: string | null
  privacyLevel: number
  privacyLabel: string
  owner: FolderOwner | null
  areaId: number | null
  areaName: string | null
  sedeId: string | null
  canEdit: boolean
  documentsCount?: number
  childrenCount?: number
  mentionedUsers?: MentionedUser[]
  children?: FolderNode[]
  breadcrumb?: { id: string; name: string }[]
  createdAt: string
  updatedAt: string
}

export interface DocumentItem {
  id: string
  folderId: string
  folderPath: string
  folderPrivacyLevel: number
  fileName: string
  mimeType: string
  extension: string
  bytes: number
  uploadedBy: { id: string; name: string } | null
  createdAt: string
  updatedAt: string
}

export interface DocumentAccess {
  level: 'VIEWER' | 'EDITOR' | 'NONE'
  canView: boolean
  canEdit: boolean
  canCreateRootFolder: boolean
  canManagePermissions: boolean
  areaId: number | null
  areaName: string | null
  activeSedeId: string | null
}

export interface PermissionItem {
  id: string
  userId: string
  name: string
  email: string | null
  permission: 'VIEWER' | 'EDITOR' | 'NONE'
  isDefault: boolean
  grantedAt: string | null
  grantedBy: { id: string; name: string } | null
}

export interface TrashItem {
  type: 'folder' | 'document'
  id: string
  name: string
  path: string
  privacyLevel: number
  batchId: string | null
  deletedAt: string
  deletedBy: { id: string | null; name: string | null } | null
  foldersCount: number
  documentsCount: number
}

export interface DocumentUser {
  id: string
  name: string
  areaId: number | null
  areaName: string | null
  sedeId: string | null
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}

export interface CreateFolderPayload {
  name: string
  parentId?: string | null
  privacyLevel?: number
  areaId?: number
  sedeId?: string
  mentionedUserIds?: string[]
}

export interface UpdateFolderPayload {
  name?: string
  parentId?: string
  privacyLevel?: number
  areaId?: number
  sedeId?: string
  mentionedUserIds?: string[]
  ownerId?: string
}

export interface QueryDocumentsParams {
  folderId?: string
  q?: string
  page?: number
  limit?: number
  sort?: 'date' | 'name'
  order?: 'asc' | 'desc'
}

export interface QueryTrashParams {
  type?: 'folder' | 'document'
  page?: number
  limit?: number
}

export interface QueryPermissionsParams {
  search?: string
  permission?: 'VIEWER' | 'EDITOR' | 'NONE'
  page?: number
  limit?: number
}
