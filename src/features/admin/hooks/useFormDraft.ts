import { useCallback, useEffect, useRef, useState } from "react"
import type { FieldValues, UseFormReturn } from "react-hook-form"
import { readDraft, removeDraft, writeDraft } from "../lib/form-draft"

interface Options<T extends FieldValues> {
  /** Identificador estable del formulario. */
  formId: string
  /** Solo se guarda mientras esté activo (modal abierto). */
  enabled: boolean
  /** Valores en blanco; también define qué campos se aceptan. */
  defaults: T
  /** Campos que nunca se persisten (contraseñas, etc.). */
  exclude?: (keyof T & string)[]
}

// Solo se aceptan del borrador los campos que existen en `defaults` y cuyo
// tipo coincide, para no romper el formulario si su estructura cambió.
function mergeDraft<T extends FieldValues>(
  defaults: T,
  draft: Record<string, unknown>,
  exclude: string[],
): T {
  const merged: Record<string, unknown> = { ...defaults }
  for (const key of Object.keys(defaults)) {
    if (exclude.includes(key) || !(key in draft)) continue
    const base = defaults[key]
    const value = draft[key]
    const compatible = base == null || value == null || typeof base === typeof value
    if (compatible) merged[key] = value
  }
  return merged as T
}

/**
 * Persiste en localStorage lo que el usuario escribe en un formulario
 * de react-hook-form y lo recupera al reabrirlo. Cerrar no borra el borrador;
 * solo "Descartar" o guardar con éxito.
 */
export function useFormDraft<T extends FieldValues>(
  form: UseFormReturn<T>,
  { formId, enabled, defaults, exclude = [] }: Options<T>,
) {
  const [hasDraft, setHasDraft] = useState(false)

  const configRef = useRef({ defaults, exclude })
  useEffect(() => {
    configRef.current = { defaults, exclude }
  })

  useEffect(() => {
    if (!enabled) return

    const subscription = form.watch((values, info) => {
      if (!info.name) return
      const { defaults: base, exclude: omit } = configRef.current
      const persistible: Record<string, unknown> = {}
      for (const key of Object.keys(base)) {
        if (!omit.includes(key)) {
          persistible[key] = (values as Record<string, unknown>)[key]
        }
      }
      const enBlanco = Object.keys(persistible).every(
        (key) => JSON.stringify(persistible[key]) === JSON.stringify(base[key]),
      )
      if (enBlanco) removeDraft(formId)
      else writeDraft(formId, persistible)
    })

    return () => subscription.unsubscribe()
  }, [enabled, formId, form])

  const resetToDraft = useCallback(
    (overrides?: Partial<T>) => {
      const { defaults: base, exclude: omit } = configRef.current
      const draft = readDraft(formId)
      setHasDraft(Boolean(draft))
      const values = draft ? mergeDraft(base, draft, omit) : base
      form.reset({ ...values, ...overrides } as T)
    },
    [formId, form],
  )

  const clear = useCallback(() => {
    removeDraft(formId)
    setHasDraft(false)
  }, [formId])

  const discard = useCallback(() => {
    clear()
    form.reset(configRef.current.defaults)
  }, [clear, form])

  return { hasDraft, resetToDraft, clear, discard }
}

export type FormDraft = ReturnType<typeof useFormDraft>
