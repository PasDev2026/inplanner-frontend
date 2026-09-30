import { MarkerType, type Edge } from "@xyflow/react"
import { EDGE_COLOR, EDGE_STROKE_WIDTH } from "./edge-style"

export interface EdgePair {
  parent: string
  child: string
}

export function buildEdges(pairs: EdgePair[]): Edge[] {
  return pairs.map(({ parent, child }) => ({
    id: `e:${parent}->${child}`,
    source: parent,
    target: child,
    type: "default",
    style: { stroke: EDGE_COLOR, strokeWidth: EDGE_STROKE_WIDTH },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: EDGE_COLOR,
      width: 14,
      height: 14,
    },
  }))
}
