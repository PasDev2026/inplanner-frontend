import { useMemo } from "react"
import type { Edge } from "@xyflow/react"
import type { BranchNode } from "@/features/projects/lib/project-branch"
import type { BackendProject } from "@/features/shared/lib/types"
import { buildEdges, type EdgePair } from "../edges/build-edges"
import { NODE_W, projectNodeId, taskNodeId } from "../lib/constants"
import { computeLayout, type LayoutItem } from "../lib/layout"
import type {
  DiagramFlowNode,
  ProjectNodeData,
  TaskNodeData,
} from "../types"

interface UseDiagramGraphParams {
  project: BackendProject
  roots: BranchNode[]
  expanded: ReadonlySet<string>
  onToggle: (id: string) => void
  onSelectTask: (taskId: number) => void
}

export function useDiagramGraph({
  project,
  roots,
  expanded,
  onToggle,
  onSelectTask,
}: UseDiagramGraphParams): { nodes: DiagramFlowNode[]; edges: Edge[] } {
  return useMemo(() => {
    const rootId = projectNodeId(project.id_project)
    const layoutItems: LayoutItem[] = [{ id: rootId, parentId: null }]
    const pairs: EdgePair[] = []
    const taskDataById = new Map<string, TaskNodeData>()

    const addTask = (node: BranchNode, parentId: string) => {
      const id = taskNodeId(node.task.id_task)
      layoutItems.push({ id, parentId })
      pairs.push({ parent: parentId, child: id })
      taskDataById.set(id, {
        task: node.task,
        progress: node.progress,
        total: node.total,
        completed: node.completed,
        priority: node.task.priority ?? null,
        dueDate: node.task.due_date ?? null,
        assignees: node.task.assignments ?? [],
        hasChildren: node.children.length > 0,
        expanded: expanded.has(id),
        onToggle,
        onSelect: onSelectTask,
      })
      if (expanded.has(id)) {
        node.children.forEach((child) => addTask(child, id))
      }
    }

    if (expanded.has(rootId)) {
      roots.forEach((root) => addTask(root, rootId))
    }

    const positions = computeLayout(layoutItems)

    const nodes: DiagramFlowNode[] = layoutItems.map((item) => {
      const position = positions.get(item.id) ?? { x: 0, y: 0 }

      if (item.id === rootId) {
        const data: ProjectNodeData = {
          name: project.name_project,
          status: project.status,
          progress: project.progress,
          priority: project.priority ?? null,
          dueDate: project.due_date ?? null,
          assignees: project.responsibles ?? [],
          hasChildren: roots.length > 0,
          expanded: expanded.has(rootId),
          onToggle,
        }
        return {
          id: item.id,
          type: "project",
          position,
          data,
          style: { width: NODE_W },
          draggable: false,
        }
      }

      return {
        id: item.id,
        type: "task",
        position,
        data: taskDataById.get(item.id)!,
        style: { width: NODE_W },
        draggable: true,
      }
    })

    return { nodes, edges: buildEdges(pairs) }
  }, [project, roots, expanded, onToggle, onSelectTask])
}
