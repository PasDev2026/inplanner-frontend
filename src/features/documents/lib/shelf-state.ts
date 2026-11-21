export function closedShelvesStorageKey(userId: string): string {
  return `documents:closed-shelves:${userId}`
}

export function readClosedRootIds(userId: string): Set<string> {
  if (typeof window === 'undefined') return new Set()

  try {
    const raw = sessionStorage.getItem(closedShelvesStorageKey(userId))
    if (!raw) return new Set()

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()

    return new Set(parsed.filter((id): id is string => typeof id === 'string'))
  } catch {
    return new Set()
  }
}

export function persistClosedRootIds(
  userId: string,
  ids: Set<string>,
): void {
  if (typeof window === 'undefined') return

  try {
    sessionStorage.setItem(
      closedShelvesStorageKey(userId),
      JSON.stringify([...ids]),
    )
  } catch {
    // sessionStorage puede fallar en modo privado o por cuota.
  }
}
