import type { BranchNode } from "@/features/projects/lib/project-branch"
import { projectNodeId, taskNodeId } from "./constants"

/** Set de ids expandidos que incluye la raíz del proyecto y todos los descendientes. */
export function collectAllExpandedIds(
  projectId: number,
  roots: BranchNode[],
): Set<string> {
  const ids = new Set<string>([projectNodeId(projectId)])

  const walk = (node: BranchNode) => {
    ids.add(taskNodeId(node.task.id_task))
    node.children.forEach(walk)
  }

  roots.forEach(walk)
  return ids
}
