const draftKey = (formId: string) => `inplanner:draft:${formId}`

export function readDraft(formId: string): Record<string, unknown> | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(draftKey(formId))
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null
  } catch {
    return null
  }
}

export function writeDraft(
  formId: string,
  values: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(draftKey(formId), JSON.stringify(values))
  } catch {
    // almacenamiento no disponible: se ignora
  }
}

export function removeDraft(formId: string): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(draftKey(formId))
  } catch {
    // noop
  }
}
