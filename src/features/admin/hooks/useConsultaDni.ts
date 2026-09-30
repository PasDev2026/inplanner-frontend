import { useState, type KeyboardEvent } from "react"
import type { UseFormReturn } from "react-hook-form"
import { toast } from "sonner"
import { searchDni, type TipoDocumentoItem } from "../actions/admin.api"
import type { CreateUserForm } from "../schemas/create-user.schema"

const DNI_CODIGO = "DNI"
const DNI_REGEX = /^\d{8}$/

/**
 * Autocompleta nombres y apellidos desde SUNAT al presionar Enter sobre el
 * número de documento, solo cuando el tipo de documento seleccionado es DNI.
 * Mientras el tipo sea DNI, limita la entrada a 8 dígitos.
 */
export function useConsultaDni(
  form: UseFormReturn<CreateUserForm>,
  tiposDocumento: TipoDocumentoItem[],
) {
  const [isBuscandoDni, setIsBuscandoDni] = useState(false)

  const dniTipoUuid = tiposDocumento.find(
    (tipo) => tipo.codigo?.toUpperCase() === DNI_CODIGO,
  )?.uuid_tipo_documento
  const esDni =
    Boolean(dniTipoUuid) && form.watch("tipo_documento_uuid") === dniTipoUuid

  const sanitize = esDni
    ? (value: string) => value.replace(/\D/g, "").slice(0, 8)
    : undefined

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return
    // Evita el submit implícito del formulario al buscar el documento.
    event.preventDefault()
    if (!esDni || isBuscandoDni) return

    const numeroDocumento = form.getValues("numero_documento")
    if (!DNI_REGEX.test(numeroDocumento)) return

    setIsBuscandoDni(true)
    searchDni(numeroDocumento)
      .then((result) => {
        if (!result) return
        form.setValue("nombres", result.nombres, {
          shouldValidate: true,
          shouldDirty: true,
        })
        form.setValue("apellido_paterno", result.apellido_paterno, {
          shouldValidate: true,
          shouldDirty: true,
        })
        form.setValue("apellido_materno", result.apellido_materno, {
          shouldValidate: true,
          shouldDirty: true,
        })
        toast.success("Datos encontrados en SUNAT")
      })
      .catch((error) => toast.error((error as Error).message))
      .finally(() => setIsBuscandoDni(false))
  }

  return {
    isBuscandoDni,
    esDni,
    onKeyDown,
    sanitize,
    inputMode: esDni ? ("numeric" as const) : undefined,
  }
}
