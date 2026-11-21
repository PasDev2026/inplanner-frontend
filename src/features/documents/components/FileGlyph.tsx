import { cn } from '@/features/shared/lib/utils'
import { FILE_KIND_STYLES, fileKind } from '../lib/file-type'

export function FileGlyph({
  fileName,
  extension,
  className,
}: {
  fileName: string
  extension?: string
  className?: string
}) {
  const kind = fileKind(extension || fileName)
  const style = FILE_KIND_STYLES[kind]

  return (
    <span
      className={cn(
        'relative inline-flex h-10 w-8 shrink-0 items-end justify-center rounded-[3px] border bg-white pb-1 shadow-[0_1px_0_rgba(11,42,58,0.08)] dark:bg-doc-paper-strong',
        style.border,
        style.text,
        className,
      )}
      aria-hidden="true"
    >
      <span
        className={cn(
          'absolute right-0 top-0 h-2.5 w-2.5 rounded-bl-[3px] border-b border-l bg-doc-paper',
          style.border,
        )}
      />
      <span className="text-[7px] font-extrabold uppercase tracking-wide">
        {extension?.replace('.', '') || style.label}
      </span>
    </span>
  )
}
