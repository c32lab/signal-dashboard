import { useState, useMemo } from 'react'
import { ReactFlow, Background, Controls, MiniMap, BackgroundVariant } from '@xyflow/react'
import type { Node, Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { ChainNode, ChainEdge } from '../../types/predict'

// Hex colors for ReactFlow nodes
const NODE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  theme:          { bg: '#1e3a5f', border: '#3b82f6', text: '#93c5fd' },
  demand_driver:  { bg: '#2d1b4e', border: '#a855f7', text: '#d8b4fe' },
  core:           { bg: '#3d2a00', border: '#f59e0b', text: '#fcd34d' },
  ticker:         { bg: '#1a3a2a', border: '#22c55e', text: '#86efac' },
  upstream:       { bg: '#0c2e35', border: '#06b6d4', text: '#67e8f9' },
  downstream:     { bg: '#3a1e2a', border: '#ec4899', text: '#f9a8d4' },
  event:          { bg: '#1f2937', border: '#6b7280', text: '#d1d5db' },
}

// Tailwind classes for filter buttons
const NODE_TYPE_COLORS: Record<string, { btn: string; text: string }> = {
  theme:          { btn: 'bg-blue-900/60 text-blue-300 border border-blue-700',    text: 'text-blue-300' },
  demand_driver:  { btn: 'bg-purple-900/60 text-purple-300 border border-purple-700', text: 'text-purple-300' },
  core:           { btn: 'bg-amber-900/60 text-amber-300 border border-amber-700',  text: 'text-amber-300' },
  ticker:         { btn: 'bg-green-900/60 text-green-300 border border-green-700',  text: 'text-green-300' },
  upstream:       { btn: 'bg-cyan-900/60 text-cyan-300 border border-cyan-700',     text: 'text-cyan-300' },
  downstream:     { btn: 'bg-pink-900/60 text-pink-300 border border-pink-700',     text: 'text-pink-300' },
  event:          { btn: 'bg-gray-700/60 text-gray-300 border border-gray-600',     text: 'text-gray-400' },
}

const EDGE_COLORS: Record<string, string> = {
  chain_member:  '#60a5fa',
  affects_ticker:'#f59e0b',
  has_ticker:    '#22c55e',
  correlation:   '#a855f7',
  transmits:     '#f43f5e',
}

const TYPE_ORDER = ['theme', 'demand_driver', 'core', 'ticker', 'upstream', 'downstream', 'event']
const COL_WIDTH = 260
const ROW_HEIGHT = 70

export function IndustryChainSection({ nodes, edges }: { nodes: ChainNode[]; edges: ChainEdge[] }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const types = useMemo(() => Array.from(new Set(nodes.map((n) => n.type))).sort(), [nodes])

  const filteredNodes = useMemo(() => nodes.filter((n) => {
    const q = search.toLowerCase()
    const matchSearch = q === '' || n.name.toLowerCase().includes(q) || n.id.toLowerCase().includes(q)
    const matchType = typeFilter === 'all' || n.type === typeFilter
    return matchSearch && matchType
  }), [nodes, search, typeFilter])

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes])

  // Build ReactFlow nodes with column-based layout
  const rfNodes: Node[] = useMemo(() => {
    const grouped: Record<string, ChainNode[]> = {}
    for (const n of filteredNodes) {
      if (!grouped[n.type]) grouped[n.type] = []
      grouped[n.type].push(n)
    }
    const orderedTypes = TYPE_ORDER.filter((t) => grouped[t]?.length > 0)
    for (const t of Object.keys(grouped)) {
      if (!TYPE_ORDER.includes(t)) orderedTypes.push(t)
    }
    const result: Node[] = []
    orderedTypes.forEach((type, colIdx) => {
      const colNodes = grouped[type] ?? []
      const colors = NODE_COLORS[type] ?? { bg: '#1f2937', border: '#6b7280', text: '#d1d5db' }
      colNodes.forEach((n, rowIdx) => {
        result.push({
          id: n.id,
          position: { x: colIdx * COL_WIDTH, y: rowIdx * ROW_HEIGHT },
          data: { label: n.name },
          style: {
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            color: colors.text,
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '11px',
            fontWeight: 600,
            maxWidth: '220px',
            whiteSpace: 'nowrap' as const,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
        })
      })
    })
    return result
  }, [filteredNodes])

  // O(1) type lookup for MiniMap (avoids O(n²) nodes.find)
  const nodeTypeMap = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const n of filteredNodes) {
      map[n.id] = n.type
    }
    return map
  }, [filteredNodes])

  // Build ReactFlow edges
  const rfEdges: Edge[] = useMemo(() => edges
    .filter((e) => filteredNodeIds.has(e.from_node) && filteredNodeIds.has(e.to_node))
    .map((e, i) => ({
      id: `e-${i}`,
      source: e.from_node,
      target: e.to_node,
      style: {
        stroke: EDGE_COLORS[e.relation] ?? '#6b7280',
        strokeWidth: Math.max(1, Math.round(e.strength * 3)),
        opacity: 0.6,
      },
    })), [edges, filteredNodeIds])

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search nodes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-600 w-full sm:w-52"
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              typeFilter === 'all' ? 'bg-gray-600 text-gray-100' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All ({nodes.length})
          </button>
          {types.map((t) => {
            const colors = NODE_TYPE_COLORS[t]
            const count = nodes.filter((n) => n.type === t).length
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  typeFilter === t && colors ? colors.btn : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {t} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* ReactFlow Graph */}
      <div className="h-[400px] md:h-[600px] bg-gray-950 rounded-lg border border-gray-800 overflow-hidden">
        {filteredNodes.length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-6 mt-4">No nodes match the filter</p>
        ) : (
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            minZoom={0.1}
            maxZoom={2}
            colorMode="dark"
          >
            <Background variant={BackgroundVariant.Dots} color="#374151" gap={20} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(n) => {
                const type = nodeTypeMap[n.id] ?? ''
                return (NODE_COLORS[type] ?? { border: '#6b7280' }).border
              }}
              style={{ background: '#111827' }}
            />
          </ReactFlow>
        )}
      </div>
    </div>
  )
}
