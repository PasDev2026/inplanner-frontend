import {
  Background,
  BackgroundVariant,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type NodeChange,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import type { DiagramColorMode } from "../hooks/useDiagramColorMode"
import type { DiagramViewMode } from "../lib/diagram-storage"
import { diagramNodeTypes } from "../nodes/nodeTypes"
import type { DiagramFlowNode } from "../types"
import DiagramAutoFit from "./DiagramAutoFit"
import DiagramToolbar from "./DiagramToolbar"

type DiagramCanvasProps = {
  nodes: DiagramFlowNode[]
  edges: Edge[]
  colorMode: DiagramColorMode
  mode: DiagramViewMode
  onModeChange: (mode: DiagramViewMode) => void
  onResetLayout: () => void
  onNodesChange: (changes: NodeChange<DiagramFlowNode>[]) => void
  onNodeDragStop: (
    event: MouseEvent | TouchEvent,
    node: DiagramFlowNode,
    nodes: DiagramFlowNode[],
  ) => void
}

export default function DiagramCanvas({
  nodes,
  edges,
  colorMode,
  mode,
  onModeChange,
  onResetLayout,
  onNodesChange,
  onNodeDragStop,
}: DiagramCanvasProps) {
  return (
    <div
      role="tree"
      aria-label="Diagrama de ramas del proyecto"
      className="relative h-[70vh] w-full overflow-hidden rounded-xl border border-border bg-background"
    >
      <ReactFlowProvider>
        <ReactFlow<DiagramFlowNode, Edge>
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={diagramNodeTypes}
          colorMode={colorMode}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.5}
          nodesConnectable={false}
          nodesFocusable={false}
          elementsSelectable={false}
          nodeDragThreshold={4}
          panOnScroll
          zoomOnScroll
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1.2}
            color="hsl(var(--muted-foreground) / 0.35)"
          />
          <MiniMap pannable zoomable className="!bg-card" />
        </ReactFlow>
        <DiagramAutoFit nodesCount={nodes.length} />
        <DiagramToolbar
          mode={mode}
          onModeChange={onModeChange}
          onResetLayout={onResetLayout}
        />
      </ReactFlowProvider>
    </div>
  )
}
