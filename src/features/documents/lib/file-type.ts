export const ALLOWED_DOCUMENT_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
  '.csv',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
]

export const MAX_DOCUMENT_SIZE_MB = 25
export const MAX_DOCUMENT_SIZE = MAX_DOCUMENT_SIZE_MB * 1024 * 1024

export function getExtension(fileName: string): string {
  const index = fileName.lastIndexOf('.')
  return index >= 0 ? fileName.slice(index).toLowerCase() : ''
}

export function isAllowedExtension(fileName: string): boolean {
  return ALLOWED_DOCUMENT_EXTENSIONS.includes(getExtension(fileName))
}

export type DocumentFileKind = 'pdf' | 'word' | 'excel' | 'powerpoint' | 'image' | 'text' | 'other'

export function fileKind(fileNameOrExtension: string): DocumentFileKind {
  const extension = fileNameOrExtension.startsWith('.')
    ? fileNameOrExtension.toLowerCase()
    : getExtension(fileNameOrExtension)

  if (extension === '.pdf') return 'pdf'
  if (['.doc', '.docx'].includes(extension)) return 'word'
  if (['.xls', '.xlsx', '.csv'].includes(extension)) return 'excel'
  if (['.ppt', '.pptx'].includes(extension)) return 'powerpoint'
  if (['.png', '.jpg', '.jpeg', '.webp'].includes(extension)) return 'image'
  if (['.txt'].includes(extension)) return 'text'
  return 'other'
}

export const FILE_KIND_STYLES: Record<
  DocumentFileKind,
  { border: string; text: string; label: string }
> = {
  pdf: { border: 'border-rose-300/70', text: 'text-rose-600', label: 'PDF' },
  word: { border: 'border-sky-300/70', text: 'text-sky-700', label: 'DOC' },
  excel: { border: 'border-emerald-300/70', text: 'text-emerald-700', label: 'XLS' },
  powerpoint: { border: 'border-orange-300/70', text: 'text-orange-700', label: 'PPT' },
  image: { border: 'border-teal-300/70', text: 'text-teal-700', label: 'IMG' },
  text: { border: 'border-slate-300/70', text: 'text-slate-600', label: 'TXT' },
  other: { border: 'border-doc-line', text: 'text-doc-muted', label: 'FILE' },
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB'
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function isPreviewable(mimeType: string): boolean {
  return ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'].includes(
    mimeType,
  )
}
