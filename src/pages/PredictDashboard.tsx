import { useState, useMemo } from 'react'
import useSWR from 'swr'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  usePrediction,
  useTrends,
  useIndustryChain,
  useOpenInterest,
  useLongShortRatio,
  useTakerVolume,
} from '../hooks/usePredictApi'
import { predictApi } from '../api/predict'
import SectionErrorBoundary from '../components/SectionErrorBoundary'
import { ReactFlow, Background, Controls, MiniMap, BackgroundVariant } from '@xyflow/react'
import type { Node, Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type {
  Prediction,
  Event,
  Pattern,
  MacroSnapshot,
  Trend,
  ChainNode,
  ChainEdge,
  AccuracyEntry,
  Validation,
  OpenInterestPoint,
  LongShortRatioPoint,
  TakerVolumePoint,
} from '../types/predict'

// ─── Shared components ────────────────────────────────────────────────────────

function MacroCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-gray-900 rounded-lg p-3 sm:p-4 flex flex-col gap-1">
      <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      <span className="text-lg sm:text-2xl font-bold text-gray-100">{value}</span>
      {sub && <span className="text-xs text-gray-500">{sub}</span>}
    </div>
  )
}

function DirectionBadge({ direction }: { direction: string }) {
  const isLong = direction?.toUpperCase() === 'LONG'
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-bold ${
        isLong ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
      }`}
    >
      {direction}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-blue-900 text-blue-300',
    completed: 'bg-green-900 text-green-300',
    expired: 'bg-gray-700 text-gray-400',
    failed: 'bg-red-900 text-red-300',
  }
  const cls = map[status?.toLowerCase()] ?? 'bg-gray-700 text-gray-400'
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold ${cls}`}>
      {status}
    </span>
  )
}

// ─── Active Predictions table (existing, used in Section 1) ──────────────────

function PredictionTable({ predictions }: { predictions: Prediction[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b border-gray-800">
            <th className="text-left py-2 px-3 font-medium">Symbol</th>
            <th className="text-left py-2 px-3 font-medium">Direction</th>
            <th className="text-left py-2 px-3 font-medium">Confidence</th>
            <th className="text-left py-2 px-3 font-medium">Pattern</th>
            <th className="text-left py-2 px-3 font-medium">Impact</th>
            <th className="text-left py-2 px-3 font-medium">Price</th>
            <th className="text-left py-2 px-3 font-medium">Created</th>
          </tr>
        </thead>
        <tbody>
          {predictions.map((p) => (
            <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
              <td className="py-2 px-3 font-mono text-blue-300">{p.symbol}</td>
              <td className="py-2 px-3">
                <DirectionBadge direction={p.direction} />
              </td>
              {/* confidence: decimal_0_1 → ×100 */}
              <td className="py-2 px-3 text-gray-300">{(p.confidence * 100).toFixed(0)}%</td>
              <td className="py-2 px-3 text-gray-400 truncate max-w-[160px]">{p.trigger_pattern}</td>
              {/* expected_impact: already_pct — direct display, no ×100 */}
              <td className="py-2 px-3 text-gray-300">{p.expected_impact != null ? `${p.expected_impact.toFixed(1)}%` : '—'}</td>
              <td className="py-2 px-3 font-mono text-gray-300">
                {p.price_at_prediction != null ? `$${p.price_at_prediction.toLocaleString()}` : '—'}
              </td>
              <td className="py-2 px-3 text-gray-500 whitespace-nowrap">
                {new Date(p.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EventTable({ events }: { events: Event[] }) {
  const sorted = [...events].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20)
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b border-gray-800">
            <th className="text-left py-2 px-3 font-medium">Date</th>
            <th className="text-left py-2 px-3 font-medium">Symbol</th>
            <th className="text-left py-2 px-3 font-medium">Event</th>
            <th className="text-left py-2 px-3 font-medium">Category</th>
            <th className="text-left py-2 px-3 font-medium">ΔPrice</th>
            <th className="text-left py-2 px-3 font-medium">Tags</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((e) => (
            <tr key={e.id} className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
              <td className="py-2 px-3 text-gray-500 whitespace-nowrap">{e.date}</td>
              <td className="py-2 px-3 font-mono text-blue-300">{e.symbol}</td>
              <td className="py-2 px-3 text-gray-300 max-w-[260px]">
                <span title={e.event}>{e.event?.length > 60 ? e.event.slice(0, 60) + '…' : e.event}</span>
              </td>
              <td className="py-2 px-3 text-gray-400">{e.category}</td>
              {/* price_change: already_pct — direct display, no ×100 */}
              <td
                className={`py-2 px-3 font-mono font-bold ${
                  e.price_change > 0 ? 'text-red-400' : e.price_change < 0 ? 'text-green-400' : 'text-gray-400'
                }`}
              >
                {e.price_change != null ? `${e.price_change > 0 ? '+' : ''}${e.price_change.toFixed(2)}%` : '—'}
              </td>
              <td className="py-2 px-3">
                <div className="flex flex-wrap gap-1">
                  {(e.tags ?? []).slice(0, 3).map((t) => (
                    <span key={t} className="px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">{t}</span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PatternCard({ pattern }: { pattern: Pattern }) {
  const isUp = pattern.direction?.toUpperCase() === 'UP' || pattern.direction?.toUpperCase() === 'LONG'
  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-gray-200 truncate">{pattern.name}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded font-bold ml-2 shrink-0 ${
            isUp ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
          }`}
        >
          {pattern.direction}
        </span>
      </div>
      <div className="flex gap-4 text-xs text-gray-400 mb-2">
        {/* avg_impact is already_pct — direct display, no ×100 */}
        <span>Avg impact: <span className="text-gray-200 font-mono">{pattern.avg_impact != null ? `${pattern.avg_impact.toFixed(1)}%` : '—'}</span></span>
        <span>Base level: <span className="text-gray-200 font-mono">{pattern.base_level}</span></span>
      </div>
      {pattern.example_dates?.length > 0 && (
        <div className="text-xs text-gray-500">
          Examples: {pattern.example_dates.slice(0, 3).join(', ')}
        </div>
      )}
    </div>
  )
}

function MacroHistoryChart({ snapshots }: { snapshots: MacroSnapshot[] }) {
  const data = [...snapshots]
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .map((s) => ({
      time: new Date(s.timestamp).toLocaleDateString(),
      macro_score: s.macro_score,
      fear_greed: s.fear_greed,
    }))

  return (
    <div className="h-[200px] sm:h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="time"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          yAxisId="macro"
          domain={[0, 10]}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={28}
        />
        <YAxis
          yAxisId="fg"
          orientation="right"
          domain={[0, 100]}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={28}
        />
        <Tooltip
          contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 }}
          labelStyle={{ color: '#9ca3af' }}
          itemStyle={{ color: '#e5e7eb' }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
        <Line
          yAxisId="macro"
          type="monotone"
          dataKey="macro_score"
          stroke="#60a5fa"
          strokeWidth={2}
          dot={false}
          name="Macro Score"
        />
        <Line
          yAxisId="fg"
          type="monotone"
          dataKey="fear_greed"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={false}
          name="Fear & Greed"
        />
      </LineChart>
    </ResponsiveContainer>
    </div>
  )
}

// ─── Section A: Prediction History Table ─────────────────────────────────────

function PredictionHistoryTable({ predictions }: { predictions: Prediction[] }) {
  const sorted = [...predictions].sort((a, b) =>
    (b.created_at ?? b.timestamp ?? '').localeCompare(a.created_at ?? a.timestamp ?? '')
  )
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b border-gray-800">
            <th className="text-left py-2 px-3 font-medium">Time</th>
            <th className="text-left py-2 px-3 font-medium">Symbol</th>
            <th className="text-left py-2 px-3 font-medium">Direction</th>
            <th className="text-left py-2 px-3 font-medium">Confidence</th>
            <th className="text-left py-2 px-3 font-medium">Trigger Pattern</th>
            <th className="text-left py-2 px-3 font-medium">Expected Impact</th>
            <th className="text-left py-2 px-3 font-medium">Price</th>
            <th className="text-left py-2 px-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
              <td className="py-2 px-3 text-gray-500 whitespace-nowrap">
                {new Date(p.created_at ?? p.timestamp).toLocaleString()}
              </td>
              <td className="py-2 px-3 font-mono text-blue-300">{p.symbol}</td>
              <td className="py-2 px-3">
                <DirectionBadge direction={p.direction} />
              </td>
              {/* confidence: decimal_0_1 → ×100 */}
              <td className="py-2 px-3 text-gray-300">{(p.confidence * 100).toFixed(0)}%</td>
              <td className="py-2 px-3 text-gray-400 truncate max-w-[160px]" title={p.trigger_pattern}>
                {p.trigger_pattern}
              </td>
              {/* expected_impact is already_pct — direct display, no ×100 */}
              <td className="py-2 px-3 text-gray-300">
                {p.expected_impact != null ? `${p.expected_impact.toFixed(1)}%` : '—'}
              </td>
              <td className="py-2 px-3 font-mono text-gray-300">
                {p.price_at_prediction != null ? `$${p.price_at_prediction.toLocaleString()}` : '—'}
              </td>
              <td className="py-2 px-3">
                <StatusBadge status={p.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Section B: Trend Discovery ───────────────────────────────────────────────

function TrendsSection({ trends }: { trends: Trend[] }) {
  if (trends.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-sm font-medium mb-2">No trends discovered yet</p>
        <p className="text-gray-600 text-xs max-w-md mx-auto leading-relaxed">
          Trends are identified when the same event pattern triggers multiple occurrences within a
          rolling time window. Check back as more prediction data accumulates.
        </p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {trends.map((t, i) => (
        <div key={i} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="font-semibold text-gray-200 mb-2 truncate" title={t.pattern_name}>
            {t.pattern_name}
          </div>
          <div className="flex gap-4 text-xs text-gray-400 mb-3">
            <span>
              Events: <span className="text-gray-200 font-mono">{t.event_count}</span>
            </span>
            {/* avg_impact is already_pct — direct display */}
            <span>
              Avg impact:{' '}
              <span className="text-gray-200 font-mono">
                {t.avg_impact != null ? `${t.avg_impact.toFixed(1)}%` : '—'}
              </span>
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {t.symbols.map((s) => (
              <span
                key={s}
                className="px-1.5 py-0.5 bg-blue-900/50 text-blue-300 rounded text-xs font-mono"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="text-xs text-gray-500">Latest: {t.latest_date}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Section C: Industry Chain Visualization ──────────────────────────────────

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

function IndustryChainSection({ nodes, edges }: { nodes: ChainNode[]; edges: ChainEdge[] }) {
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

// ─── Section D+E: Prediction Accuracy + Validations ──────────────────────────

const SYMBOL_COLORS: Record<string, string> = {
  BTC: '#60a5fa',
  ETH: '#a78bfa',
  SOL: '#22d3ee',
  BNB: '#fbbf24',
  XRP: '#34d399',
}

function getSymbolColor(symbol: string): string {
  const base = symbol.replace('/USDT', '').replace('/USD', '')
  return SYMBOL_COLORS[base] ?? '#9ca3af'
}

function AccuracyAndValidationsSection({
  validations,
}: {
  accuracy: Record<string, AccuracyEntry>
  validations: Validation[]
}) {
  const [symbolFilter, setSymbolFilter] = useState('all')
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d' | 'all'>('30d')

  const symbols = Array.from(new Set(validations.map((v) => v.symbol))).sort()

  const cutoff = (() => {
    if (timeRange === 'all') return null
    const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30
    const d = new Date()
    d.setDate(d.getDate() - days)
    return d
  })()

  const timeFiltered = cutoff
    ? validations.filter((v) => new Date(v.validated_at) >= cutoff)
    : validations

  const filtered =
    symbolFilter === 'all'
      ? timeFiltered
      : timeFiltered.filter((v) => v.symbol === symbolFilter)

  const total = filtered.length
  const correct = filtered.filter((v) => v.is_correct === 1).length
  const accuracy_pct = total > 0 ? (correct / total) * 100 : 0
  const colorClass =
    accuracy_pct > 50 ? 'text-green-400' : accuracy_pct >= 40 ? 'text-yellow-400' : 'text-red-400'

  // Build trend chart: group by day × symbol
  const chartSymbols =
    symbolFilter === 'all'
      ? Array.from(new Set(filtered.map((v) => v.symbol))).sort()
      : [symbolFilter]

  const daySymbolMap: Record<string, Record<string, { correct: number; total: number }>> = {}
  for (const v of filtered) {
    const day = v.validated_at.slice(0, 10)
    if (!daySymbolMap[day]) daySymbolMap[day] = {}
    if (!daySymbolMap[day][v.symbol]) daySymbolMap[day][v.symbol] = { correct: 0, total: 0 }
    daySymbolMap[day][v.symbol].total++
    if (v.is_correct === 1) daySymbolMap[day][v.symbol].correct++
  }

  const trendData = Object.entries(daySymbolMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, symMap]) => {
      const point: Record<string, string | number> = { date: day }
      for (const sym of chartSymbols) {
        const s = symMap[sym]
        if (s) point[sym] = parseFloat(((s.correct / s.total) * 100).toFixed(1))
      }
      return point
    })

  return (
    <>
      {/* ── Section D: Prediction Accuracy ── */}
      <section className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200">Prediction Accuracy</h2>
        </div>
        <div className="p-4 space-y-4">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={symbolFilter}
              onChange={(e) => setSymbolFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-gray-600"
            >
              <option value="all">All Symbols</option>
              {symbols.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div className="flex gap-1">
              {(['7d', '14d', '30d', 'all'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    timeRange === r
                      ? 'bg-blue-700 text-blue-100'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {r === 'all' ? 'All' : r}
                </button>
              ))}
            </div>
          </div>

          {/* Stats from filtered validations */}
          {total === 0 ? (
            <p className="text-center text-gray-500 py-6 text-sm">
              No validations for selected filter
            </p>
          ) : (
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <div className="flex flex-col items-center gap-1 min-w-[100px] sm:min-w-[120px]">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Total</span>
                <span className="text-3xl sm:text-4xl font-bold font-mono text-gray-100">{total}</span>
                <span className="text-sm text-gray-400">predictions</span>
              </div>
              <div className="flex flex-col items-center gap-1 min-w-[100px] sm:min-w-[120px]">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Correct</span>
                <span className="text-3xl sm:text-4xl font-bold font-mono text-green-400">{correct}</span>
                <span className="text-sm text-gray-400">of {total}</span>
              </div>
              <div className="flex flex-col items-center gap-1 min-w-[100px] sm:min-w-[120px]">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Accuracy</span>
                <span className={`text-3xl sm:text-4xl font-bold font-mono ${colorClass}`}>
                  {accuracy_pct.toFixed(1)}%
                </span>
                <span className="text-sm text-gray-400">from validations</span>
              </div>
            </div>
          )}

          {/* Accuracy trend chart */}
          {trendData.length > 0 && (
            <div>
              <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Accuracy Trend</h3>
              <div className="h-[180px] sm:h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={36}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 }}
                      labelStyle={{ color: '#9ca3af' }}
                      itemStyle={{ color: '#e5e7eb' }}
                      formatter={(value: number | undefined, name?: string) => [`${Number(value ?? 0).toFixed(1)}%`, name ?? '']}
                    />
                    {chartSymbols.length > 1 && (
                      <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
                    )}
                    {chartSymbols.map((sym) => (
                      <Line
                        key={sym}
                        type="monotone"
                        dataKey={sym}
                        stroke={getSymbolColor(sym)}
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                        name={sym}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Section E: Recent Validations ── */}
      <section className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200">
            Recent Validations
            {filtered.length > 0 && (
              <span className="ml-2 text-xs text-gray-500">({filtered.length})</span>
            )}
          </h2>
        </div>
        <div className="p-2">
          <ValidationsTable validations={filtered} />
        </div>
      </section>
    </>
  )
}

// ─── Section E: Recent Validations ────────────────────────────────────────────

function ValidationsTable({ validations }: { validations: Validation[] }) {
  if (validations.length === 0) {
    return <p className="text-center text-gray-600 py-8 text-sm">No validation records</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b border-gray-800">
            <th className="text-left py-2 px-3 font-medium">Time</th>
            <th className="text-left py-2 px-3 font-medium">Symbol</th>
            <th className="text-left py-2 px-3 font-medium">Direction</th>
            <th className="text-left py-2 px-3 font-medium">Confidence</th>
            <th className="text-left py-2 px-3 font-medium">Actual Δ</th>
            <th className="text-left py-2 px-3 font-medium">Result</th>
            <th className="text-left py-2 px-3 font-medium">Price Entry→Exit</th>
            <th className="text-left py-2 px-3 font-medium">Trigger</th>
          </tr>
        </thead>
        <tbody>
          {validations.map((v) => (
            <tr key={v.id} className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
              <td className="py-2 px-3 text-gray-500 whitespace-nowrap">
                {new Date(v.validated_at).toLocaleString()}
              </td>
              <td className="py-2 px-3 font-mono text-blue-300">{v.symbol}</td>
              <td className="py-2 px-3">
                <DirectionBadge direction={v.direction} />
              </td>
              {/* confidence: decimal_0_1 → ×100 */}
              <td className="py-2 px-3 text-gray-300">{(v.confidence * 100).toFixed(0)}%</td>
              {/* actual_change: already_pct — direct display, no ×100 */}
              <td
                className={`py-2 px-3 font-mono font-bold ${
                  v.actual_change > 0
                    ? 'text-green-400'
                    : v.actual_change < 0
                    ? 'text-red-400'
                    : 'text-gray-400'
                }`}
              >
                {v.actual_change > 0 ? '+' : ''}{v.actual_change.toFixed(2)}%
              </td>
              <td className="py-2 px-3 whitespace-nowrap">
                {v.is_correct === 1 ? (
                  <span className="text-green-400 font-medium">✅ Correct</span>
                ) : (
                  <span className="text-red-400 font-medium">❌ Wrong</span>
                )}
              </td>
              <td className="py-2 px-3 font-mono text-gray-300 whitespace-nowrap">
                ${v.price_at_prediction.toLocaleString()} → ${v.price_at_validation.toLocaleString()}
              </td>
              <td className="py-2 px-3 text-gray-500 max-w-[200px]">
                <span title={v.trigger_event} className="cursor-help">
                  {v.trigger_event?.length > 40
                    ? v.trigger_event.slice(0, 40) + '…'
                    : v.trigger_event}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Section F: Derivatives Overview ─────────────────────────────────────────

const DERIV_TOOLTIP_STYLE = { background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 }

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

function fmtOIValue(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`
  return `$${v.toLocaleString()}`
}

function OIChart({ data, isLoading }: { data: OpenInterestPoint[] | undefined; isLoading: boolean }) {
  if (isLoading) {
    return <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">Loading...</div>
  }
  if (!data || data.length === 0) {
    return <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">No data available</div>
  }
  const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp)
  const latest = sorted[sorted.length - 1]
  const chartData = sorted.map((p) => ({ time: fmtTime(p.timestamp), value: p.sum_open_interest_value }))
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-200">Open Interest</h3>
        {latest && <span className="text-xs font-mono text-blue-300">{fmtOIValue(latest.sum_open_interest_value)}</span>}
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="oiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={52}
              tickFormatter={fmtOIValue}
            />
            <Tooltip
              contentStyle={DERIV_TOOLTIP_STYLE}
              labelStyle={{ color: '#9ca3af' }}
              itemStyle={{ color: '#e5e7eb' }}
              formatter={(v: number | undefined) => [fmtOIValue(v ?? 0), 'OI Value']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#60a5fa"
              strokeWidth={2}
              fill="url(#oiGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function LSRChart({ data, isLoading }: { data: LongShortRatioPoint[] | undefined; isLoading: boolean }) {
  if (isLoading) {
    return <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">Loading...</div>
  }
  if (!data || data.length === 0) {
    return <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">No data available</div>
  }
  const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp)
  const latest = sorted[sorted.length - 1]
  // long_account/short_account: decimal_0_1 → ×100 for display
  const chartData = sorted.map((p) => ({
    time: fmtTime(p.timestamp),
    long: parseFloat((p.long_account * 100).toFixed(1)),   // decimal_0_1 → ×100
    short: parseFloat((p.short_account * 100).toFixed(1)), // decimal_0_1 → ×100
  }))
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-200">Long/Short Ratio</h3>
        {latest && <span className="text-xs font-mono text-gray-300">{latest.long_short_ratio.toFixed(2)}</span>}
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="time"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={36}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              contentStyle={DERIV_TOOLTIP_STYLE}
              labelStyle={{ color: '#9ca3af' }}
              itemStyle={{ color: '#e5e7eb' }}
              formatter={(v: number | undefined, name: string | undefined) => [`${(v ?? 0).toFixed(1)}%`, name ?? '']}
            />
            <Bar dataKey="long" stackId="a" fill="#22c55e" name="Long %" />
            <Bar dataKey="short" stackId="a" fill="#ef4444" name="Short %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function TakerVolumeChart({ data, isLoading }: { data: TakerVolumePoint[] | undefined; isLoading: boolean }) {
  if (isLoading) {
    return <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">Loading...</div>
  }
  if (!data || data.length === 0) {
    return <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">No data available</div>
  }
  const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp)
  const latest = sorted[sorted.length - 1]
  const chartData = sorted.map((p) => ({
    time: fmtTime(p.timestamp),
    buy: p.buy_vol,
    sell: p.sell_vol,
  }))
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-200">Taker Buy/Sell Volume</h3>
        {latest && <span className="text-xs font-mono text-gray-300">{latest.buy_sell_ratio.toFixed(3)}</span>}
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="time"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(v: number) => v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : String(v)}
            />
            <Tooltip
              contentStyle={DERIV_TOOLTIP_STYLE}
              labelStyle={{ color: '#9ca3af' }}
              itemStyle={{ color: '#e5e7eb' }}
            />
            <Bar dataKey="buy" fill="#22c55e" name="Buy Vol" />
            <Bar dataKey="sell" fill="#ef4444" name="Sell Vol" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const DERIV_SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT']

function DerivativesOverviewSection() {
  const [derivSymbol, setDerivSymbol] = useState('BTC/USDT')
  const { data: oiData, isLoading: oiLoading } = useOpenInterest(derivSymbol, 24)
  const { data: lsrData, isLoading: lsrLoading } = useLongShortRatio(derivSymbol, 24)
  const { data: tvData, isLoading: tvLoading } = useTakerVolume(derivSymbol, 24)

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-sm font-semibold text-gray-200">Derivatives Overview</h2>
        <div className="flex gap-1">
          {DERIV_SYMBOLS.map((s) => (
            <button
              key={s}
              onClick={() => setDerivSymbol(s)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                derivSymbol === s
                  ? 'bg-blue-700 text-blue-100'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {s.replace('/USDT', '')}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <OIChart data={oiData} isLoading={oiLoading} />
        <LSRChart data={lsrData} isLoading={lsrLoading} />
        <TakerVolumeChart data={tvData} isLoading={tvLoading} />
      </div>
    </section>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function PredictDashboard() {
  const { data, error, isLoading } = usePrediction()
  // Fetch all predictions without status filter for the history table
  const { data: allPredictions, isLoading: histLoading } = useSWR(
    'predict/predictions/all',
    () => predictApi.predictions({ limit: 50 }),
    { refreshInterval: 30_000 }
  )
  const { data: trendsData, isLoading: trendsLoading } = useTrends()
  const { data: chainData, isLoading: chainLoading } = useIndustryChain()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
        Loading predictions…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400 text-sm">
        Failed to load: {error.message}
      </div>
    )
  }

  if (!data) return null

  const { macro, event_kb, predictions, macro_history, accuracy, recent_validations } = data
  const activeList = predictions?.active ?? []
  const events = event_kb?.events ?? []
  const patterns = event_kb?.patterns ?? []

  const trends = Array.isArray(trendsData) ? trendsData : (trendsData as unknown as { trends?: Trend[] })?.trends ?? []
  const chainNodes = chainData?.nodes ?? []
  const chainEdges = chainData?.edges ?? []

  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Macro Score Cards */}
      <SectionErrorBoundary title="Macro Overview">
      <section>
        <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Macro Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <MacroCard
            label="Macro Score"
            value={macro.score != null ? macro.score.toFixed(1) : '—'}
            sub="0–10"
          />
          <MacroCard
            label="Fear & Greed"
            value={macro.fear_greed != null ? String(macro.fear_greed) : '—'}
            sub={macro.fear_greed_trend}
          />
          <MacroCard
            label="ETF Flow 1D"
            value={macro.etf_flow_1d != null ? `$${(macro.etf_flow_1d / 1e6).toFixed(0)}M` : '—'}
            sub={macro.etf_flow_5d != null ? `5D: $${(macro.etf_flow_5d / 1e6).toFixed(0)}M` : undefined}
          />
          <MacroCard
            label="Volume Ratio"
            value={macro.volume_ratio != null ? macro.volume_ratio.toFixed(2) : '—'}
          />
          <MacroCard
            label="Funding Rate"
            value={macro.funding_rate != null ? `${(macro.funding_rate * 100).toFixed(3)}%` : '—'}
            sub={macro.funding_rate_avg != null ? `Avg: ${(macro.funding_rate_avg * 100).toFixed(3)}%` : undefined}
          />
        </div>
      </section>
      </SectionErrorBoundary>

      {/* Active Predictions */}
      <SectionErrorBoundary title="Active Predictions">
      <section className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200">
            Active Predictions
            <span className="ml-2 text-xs text-gray-500">({activeList.length})</span>
          </h2>
        </div>
        <div className="p-2">
          {activeList.length === 0 ? (
            <p className="text-center text-gray-600 py-8 text-sm">No active predictions</p>
          ) : (
            <PredictionTable predictions={activeList} />
          )}
        </div>
      </section>
      </SectionErrorBoundary>

      {/* Event KB */}
      <SectionErrorBoundary title="Event Library">
      <section className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200">
            Event Library
            <span className="ml-2 text-xs text-gray-500">(latest 20)</span>
          </h2>
        </div>
        <div className="p-2">
          {events.length === 0 ? (
            <p className="text-center text-gray-600 py-8 text-sm">No events</p>
          ) : (
            <EventTable events={events} />
          )}
        </div>
      </section>
      </SectionErrorBoundary>

      {/* Patterns + Chart */}
      <SectionErrorBoundary title="Patterns & Macro Chart">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patterns */}
        <section>
          <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Event Patterns</h2>
          {patterns.length === 0 ? (
            <p className="text-gray-600 text-sm">No patterns</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {patterns.map((p) => (
                <PatternCard key={p.id} pattern={p} />
              ))}
            </div>
          )}
        </section>

        {/* Macro History Chart */}
        <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="text-sm font-semibold text-gray-200 mb-4">Macro History</h2>
          {macro_history?.length > 0 ? (
            <MacroHistoryChart snapshots={macro_history} />
          ) : (
            <p className="text-center text-gray-600 text-sm py-16">No history data</p>
          )}
        </section>
      </div>
      </SectionErrorBoundary>

      {/* ── Section A: Prediction History ─��───────────────────────────────── */}
      <SectionErrorBoundary title="Prediction History">
      <section className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200">
            Prediction History
            <span className="ml-2 text-xs text-gray-500">
              {histLoading ? 'loading…' : `(${(allPredictions ?? []).length})`}
            </span>
          </h2>
        </div>
        <div className="p-2">
          {histLoading ? (
            <p className="text-center text-gray-600 py-8 text-sm">Loading…</p>
          ) : !allPredictions || allPredictions.length === 0 ? (
            <p className="text-center text-gray-600 py-8 text-sm">No prediction history</p>
          ) : (
            <PredictionHistoryTable predictions={allPredictions} />
          )}
        </div>
      </section>
      </SectionErrorBoundary>

      {/* ── Section B: Trend Discovery ────────────────────────────────────── */}
      <SectionErrorBoundary title="Trend Discovery">
      <section className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200">
            Trend Discovery
            {!trendsLoading && trends.length > 0 && (
              <span className="ml-2 text-xs text-gray-500">({trends.length})</span>
            )}
          </h2>
        </div>
        <div className="p-4">
          {trendsLoading ? (
            <p className="text-center text-gray-600 py-8 text-sm">Loading…</p>
          ) : (
            <TrendsSection trends={trends} />
          )}
        </div>
      </section>
      </SectionErrorBoundary>

      {/* ── Sections D+E: Prediction Accuracy + Validations ──────────────── */}
      <SectionErrorBoundary title="Prediction Accuracy">
      <AccuracyAndValidationsSection
        accuracy={accuracy ?? {}}
        validations={recent_validations ?? []}
      />
      </SectionErrorBoundary>

      {/* ── Section C: Industry Chain Visualization ───────────────────────── */}
      <SectionErrorBoundary title="Industry Chain">
      <section className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200">
            Industry Chain
            {!chainLoading && chainNodes.length > 0 && (
              <span className="ml-2 text-xs text-gray-500">
                {chainNodes.length} nodes · {chainEdges.length} edges
              </span>
            )}
          </h2>
        </div>
        <div className="p-4">
          {chainLoading ? (
            <p className="text-center text-gray-600 py-8 text-sm">Loading…</p>
          ) : chainNodes.length === 0 ? (
            <p className="text-center text-gray-600 py-8 text-sm">No industry chain data</p>
          ) : (
            <IndustryChainSection nodes={chainNodes} edges={chainEdges} />
          )}
        </div>
      </section>
      </SectionErrorBoundary>

      {/* ── Section F: Derivatives Overview ───────────────────────────────── */}
      <SectionErrorBoundary title="Derivatives Overview">
      <DerivativesOverviewSection />
      </SectionErrorBoundary>
    </div>
  )
}
