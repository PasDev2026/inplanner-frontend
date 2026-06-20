import { useState, useEffect } from "react"
import { ChevronUp } from "lucide-react"

const SCROLL_THRESHOLD = 400

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SCROLL_THRESHOLD)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 p-3 rounded-full bg-brand-primary text-white shadow-lg transition-all duration-200 ease-out hover:bg-brand-dark hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/40 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      aria-label="Volver arriba"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  )
}
