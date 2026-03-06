import { useMemo } from 'react'
import { ReactFlow, Background, BackgroundVariant, Controls } from '@xyflow/react'
import type { Node, Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { ReasoningGraph } from '../../types/predict'

const NODE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  source:  { bg: '#1f2937', border: '#6b7280', text: '#d1d5db' },
  event:   { bg: '#1e3a5f', border: '#3b82f6', text: '#93c5fd' },
  match:   { bg: '#422006', border: '#f59e0b', text: '#fcd34d' },
  pattern: { bg: '#431407', border: '#f97316', text: '#fdba74' },
  chain:   { bg: '#2e1065', border: '#8b5cf6', text: '#c4b5fd' },
  symbol:  { bg: '#14532d', border: '#22c55e', text: '#86efac' },
}

const SYMBOL_SHORT: { bg: string; border: string; text: string } = {
  bg: '#450a0a', border: '#ef4444', text: '#fca5a5'
}

export default function ReasoningFlowGraph({ graph }: { graph: ReasoningGraph }) {
  const rfNodes: Node[] = useMemo(() =>
    graph.nodes.map((n) => {
      const isShort = n.type === 'symbol' && (n.data as { direction?: string }).direction === 'SHORT'
      const colors = isShort ? SYMBOL_SHORT : (NODE_COLORS[n.type] ?? NODE_COLORS.source)
      return {
        id: n.id,
        position: n.position,
        data: { label: String(n.data.label ?? n.id) },
        style: {
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          color: colors.text,
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '11px',
          fontWeight: 600,
          maxWidth: '180px',
        },
      }
    }), [graph.nodes])

  const rfEdges: Edge[] = useMemo(() =>
    graph.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      style: { stroke: '#4b5563' },
      labelStyle: { fill: '#9ca3af', fontSize: 10 },
      animated: false,
    })), [graph.edges])

  return (
    <div style={{ height: 280 }} className="rounded-lg border border-gray-800 overflow-hidden">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} color="#374151" gap={20} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  )
}
