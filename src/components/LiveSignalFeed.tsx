import { useState } from 'react'
import { useRecentDecisions } from '../hooks/useApi'
import type { Decision } from '../types'
import { formatTime } from '../utils/format'

function actionBadgeClass(action: string): string {
  switch (action?.toUpperCase()) {
    case 'LONG':  return 'bg-green-900 text-green-300'
    case 'SHORT': return 'bg-red-900 text-red-300'
    default:      return 'bg-gray-800 text-gray-400'
  }
}

function directionBadgeClass(direction: string): string {
  switch (direction?.toUpperCase()) {
    case 'LONG':  return 'bg-green-900/50 text-green-400'
    case 'SHORT': return 'bg-red-900/50 text-red-400'
    default:      return 'bg-gray-800 text-gray-500'
  }
}

function typePillClass(type: string): string {
  switch (type?.toUpperCase()) {
    case 'FAST': return 'bg-blue-900/60 text-blue-300'
    case 'SLOW': return 'bg-purple-900/60 text-purple-300'
    default:     return 'bg-gray-800 text-gray-500'
  }
}

function formatTimeFeed(ts: string): string {
  if (isNaN(new Date(ts).getTime())) return ts
  return formatTime(ts)
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-14 bg-gray-800 rounded-full h-1.5 overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-gray-400 font-mono w-8 text-right shrink-0">{pct}%</span>
    </div>
  )
}

function FeedRow({ d }: { d: Decision }) {
  return (
    <div className="flex items-center gap-2 py-1.5 border-t border-gray-800 hover:bg-gray-800/30 px-3 transition-colors text-xs">
      <span className="text-gray-500 font-mono w-16 shrink-0">{formatTimeFeed(d.timestamp)}</span>
      <span className="font-semibold text-gray-200 w-10 shrink-0">{d.symbol.replace('/USDT', '')}</span>
      <span className={`px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${actionBadgeClass(d.action)}`}>
        {d.action}
      </span>
      <span className={`px-1.5 py-0.5 rounded-full shrink-0 ${directionBadgeClass(d.direction)}`}>
        {d.direction}
      </span>
      <ConfidenceBar value={d.confidence} />
      <span className="text-gray-400 font-mono shrink-0 w-14 text-right">
        {typeof d.combined_score === 'number' ? d.combined_score.toFixed(3) : '—'}
      </span>
      <span className={`px-1.5 py-0.5 rounded-full shrink-0 ${typePillClass(d.decision_type)}`}>
        {d.decision_type || '—'}
      </span>
    </div>
  )
}

export default function LiveSignalFeed() {
  const [collapsed, setCollapsed] = useState(false)
  const { data, isLoading, error } = useRecentDecisions(60)

  const decisions = data?.decisions ?? []
  const total = data?.total ?? decisions.length
  const sorted = [...decisions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )
  const visible = sorted.slice(0, 50)
  const truncated = sorted.length > 50

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="text-sm font-semibold text-gray-200">Live Signal Feed</span>
          {!isLoading && !error && (
            <span className="text-xs text-gray-500">
              {total} signal{total !== 1 ? 's' : ''} in last 1h
            </span>
          )}
          {truncated && (
            <span className="text-xs text-gray-600 italic">showing latest 50</span>
          )}
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-gray-500 hover:text-gray-300 text-xs transition-colors shrink-0"
        >
          {collapsed ? '▼ expand' : '▲ collapse'}
        </button>
      </div>

      {!collapsed && (
        <div className="max-h-96 overflow-y-auto">
          {isLoading && (
            <p className="px-4 py-6 text-gray-500 text-xs">Loading…</p>
          )}
          {error && (
            <p className="px-4 py-6 text-red-400 text-xs">Failed to load signals</p>
          )}
          {!isLoading && !error && visible.length === 0 && (
            <p className="px-4 py-6 text-gray-600 text-xs">No signals in the last hour</p>
          )}
          {visible.map((d) => (
            <FeedRow key={String(d.id)} d={d} />
          ))}
        </div>
      )}
    </section>
  )
}
