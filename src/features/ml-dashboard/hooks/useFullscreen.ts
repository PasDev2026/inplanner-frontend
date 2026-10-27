import { useCallback, useEffect, useState, type RefObject } from "react"

export function useFullscreen<T extends HTMLElement>(elementRef: RefObject<T>) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const sync = () => {
      const element = elementRef.current
      setIsFullscreen(Boolean(element) && document.fullscreenElement === element)
    }

    sync()
    document.addEventListener("fullscreenchange", sync)
    return () => document.removeEventListener("fullscreenchange", sync)
  }, [elementRef])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        return
      }

      await elementRef.current?.requestFullscreen()
    } catch {
      // Some embedded previews block the Fullscreen API. The dashboard keeps
      // working normally even when the browser rejects the request.
    }
  }, [elementRef])

  return { isFullscreen, toggleFullscreen }
}
