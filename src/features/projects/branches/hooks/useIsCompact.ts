import { useEffect, useState } from "react"

/**
 * Indica si el viewport es compacto (móvil). Se usa para forzar la orientación
 * vertical del diagrama, donde el layout horizontal no es usable.
 */
export function useIsCompact(breakpoint = 640): boolean {
  const [compact, setCompact] = useState(
    () => typeof window !== "undefined" && window.innerWidth < breakpoint,
  )

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const handler = () => setCompact(query.matches)
    handler()
    query.addEventListener("change", handler)
    return () => query.removeEventListener("change", handler)
  }, [breakpoint])

  return compact
}
