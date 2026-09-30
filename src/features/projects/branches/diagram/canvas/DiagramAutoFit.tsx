import { useEffect } from "react"
import { useReactFlow } from "@xyflow/react"

/** Reencuadra la vista cuando cambia la cantidad de nodos (expandir/colapsar). */
export default function DiagramAutoFit({ nodesCount }: { nodesCount: number }) {
  const { fitView } = useReactFlow()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fitView({ padding: 0.2, duration: 300 })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [nodesCount, fitView])

  return null
}
