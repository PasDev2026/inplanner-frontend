import { useCallback, useEffect, useMemo } from "react"
import { useNodesState, type Edge } from "@xyflow/react"
import { computeBranchDropTarget } from "@/features/projects/branches/lib/branch-dnd"
import type { BackendTask } from "@/features/shared/lib/types"
import { NODE_H, NODE_W, projectNodeId, taskIdFromNodeId } from "../lib/constants"
import type { DiagramPositions, DiagramViewMode } from "../lib/diagram-storage"
import { resolveDropTarget, type DiagramRect } from "../lib/drop-target"
import type { DiagramFlowNode } from "../types"

type DragStopHandler = (
  event: MouseEvent | TouchEvent,
  node: DiagramFlowNode,
  nodes: DiagramFlowNode[],
) => void

interface UseDiagramNodesParams {
  graphNodes: DiagramFlowNode[]
  edges: Edge[]
  mode: DiagramViewMode
  positions: DiagramPositions
  tasks: BackendTask[]
  rootsCount: number
  projectId: number
  onReorder: (taskId: number, parentId: number | null, index: number) => void
  onPositionChange: (nodeId: string, position: { x: number; y: number }) => void
}

export function useDiagramNodes({
  graphNodes,
  edges,
  mode,
  positions,
  tasks,
  rootsCount,
  projectId,
  onReorder,
  onPositionChange,
}: UseDiagramNodesParams) {
  const rootId = projectNodeId(projectId)

  const effectiveNodes = useMemo(() => {
    if (mode !== "organize") return graphNodes
    return graphNodes.map((node) => {
      // En modo Organizar el nodo Proyecto también es movible.
      const withDrag =
        node.id === rootId ? { ...node, draggable: true } : node
      const position = positions[node.id]
      return position ? { ...withDrag, position } : withDrag
    })
  }, [graphNodes, mode, positions, rootId])

  const [nodes, setNodes, onNodesChange] =
    useNodesState<DiagramFlowNode>(effectiveNodes)

  useEffect(() => {
    setNodes(effectiveNodes)
  }, [effectiveNodes, setNodes])

  const onNodeDragStop: DragStopHandler = useCallback(
    (_event, node, allNodes) => {
      if (mode === "organize") {
        onPositionChange(node.id, { x: node.position.x, y: node.position.y })
        return
      }

      const taskId = taskIdFromNodeId(node.id)
      if (taskId == null) {
        setNodes(graphNodes)
        return
      }

      const candidates: DiagramRect[] = allNodes
        .filter((candidate) => candidate.id !== node.id)
        .map((candidate) => ({
          id: candidate.id,
          x: candidate.position.x,
          y: candidate.position.y,
          width: NODE_W,
          height: NODE_H,
        }))

      const resolved = resolveDropTarget(
        {
          id: node.id,
          x: node.position.x,
          y: node.position.y,
          width: NODE_W,
          height: NODE_H,
        },
        candidates,
      )

      // Encaja al layout tras soltar.
      setNodes(graphNodes)
      if (!resolved) return

      if (resolved.overId === rootId) {
        onReorder(taskId, null, rootsCount)
        return
      }

      const overTaskId = taskIdFromNodeId(resolved.overId)
      if (overTaskId == null) return

      const target = computeBranchDropTarget({
        tasks,
        activeId: taskId,
        overId: overTaskId,
        zone: resolved.zone,
      })
      if (!target) return
      onReorder(taskId, target.parentId, target.index)
    },
    [
      mode,
      graphNodes,
      rootId,
      rootsCount,
      tasks,
      onReorder,
      onPositionChange,
      setNodes,
    ],
  )

  return { nodes, edges, onNodesChange, onNodeDragStop }
}
