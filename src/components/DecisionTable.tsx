import { useState, useMemo } from 'react'
import type { Decision } from '../types'
import { useDecisions } from '../hooks/useApi'
import { validatePrice, validateConfidence } from '../utils/dataValidation'
import DataWarning from './DataWarning'

const PAGE_SIZE = 20
const SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT', 'AVAX/USDT', 'LINK/USDT']
const DIRECTIONS = ['LONG', 'SHORT', 'HOLD']

type TimePreset = '1h' | '6h' | '24h' | '7d' | 'all'

const TIME_PRESETS: { label: string; value: TimePreset; hours?: number }[] = [
  { label: '1h', value: '1h', hours: 1 },
  { label: '6h', value: '6h', hours: 6 },
  { label: '24h', value: '24h', hours: 24 },
  { label: '7d', value: '7d', hours: 168 },
  { label: 'All', value: 'all' },
]

// Rounds to the nearest minute to prevent SWR key churn (P0 fix)
function fromIso(hours: number): string {
  const ms = Date.now() - hours * 3600_000
  const rounded = Math.floor(ms / 60_000) * 60_000
  return new Date(rounded).toISOString()
}

function directionBadge(direction: string) {
  switch (direction) {
    case 'LONG':
      return 'bg-green-900 text-green-300'
    case 'SHORT':
      return 'bg-red-900 text-red-300'
    default:
      return 'bg-gray-800 text-gray-400'
  }
}

function typeBadge(type: string) {
  switch (type?.toUpperCase()) {
    case 'FAST':
      return 'bg-blue-900 text-blue-300'
    case 'SLOW':
      return 'bg-purple-900 text-purple-300'
    default:
      return 'bg-gray-800 text-gray-500'
  }
}

function formatTs(ts: string): string {
  const d = new Date(ts)
  if (isNaN(d.getTime())) return ts
  return d.toLocaleString([], {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function DecisionRow({ d }: { d: Decision }) {
  return (
    <tr className="border-t border-gray-800 hover:bg-gray-900 transition-colors">
      <td className="px-3 py-2 text-xs text-gray-500 font-mono">{String(d.id).slice(-6)}</td>
      <td className="px-3 py-2 text-xs text-gray-400 whitespace-nowrap">{formatTs(d.timestamp)}</td>
      <td className="px-3 py-2 text-xs font-semibold text-gray-200">
        {d.symbol.replace('/USDT', '')}
      </td>
      <td className="px-3 py-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${directionBadge(d.direction)}`}>
          {d.direction}
        </span>
      </td>
      <td className="px-3 py-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeBadge(d.decision_type)}`}>
          {d.decision_type || '—'}
        </span>
      </td>
      <td className="px-3 py-2 text-xs text-gray-300">{d.action}</td>
      <td className="px-3 py-2 text-xs text-gray-300 text-right font-mono">
        {typeof d.price_at_decision === 'number' ? (
          <>
            {d.price_at_decision.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            {(() => {
              const v = validatePrice(d.price_at_decision, d.symbol)
              return v.valid ? null : <DataWarning message={v.warning!} />
            })()}
          </>
        ) : '—'}
      </td>
      <td className="px-3 py-2 text-xs text-gray-300 text-right">
        {(() => {
          const confV = validateConfidence(d.confidence)
          const zeroConf = d.confidence === 0 && d.action !== 'HOLD'
          const warn = !confV.valid
            ? confV.warning!
            : zeroConf
            ? `Confidence=0 但 action=${d.action}`
            : undefined
          return (
            <>
              {Math.round(d.confidence * 100)}% {/* confidence: decimal_0_1 → ×100 */}
              {warn && <DataWarning message={warn} />}
            </>
          )
        })()}
      </td>
      <td className="px-3 py-2 text-xs text-gray-400 text-right">
        {typeof d.combined_score === 'number' ? d.combined_score.toFixed(3) : '—'}
      </td>
      <td className="px-3 py-2 text-xs text-gray-500 max-w-xs truncate" title={d.reasoning}>
        {d.reasoning}
      </td>
    </tr>
  )
}

export default function DecisionTable() {
  const [symbolFilter, setSymbolFilter] = useState('')
  const [directionFilter, setDirectionFilter] = useState('')
  const [timePreset, setTimePreset] = useState<TimePreset>('24h')
  const [page, setPage] = useState(1)

  // Memoize fromTime with minute-level granularity to prevent SWR key churn (P0 fix)
  const minuteTick = Math.floor(Date.now() / 60_000)
  const fromTime = useMemo(() => {
    const preset = TIME_PRESETS.find((p) => p.value === timePreset)
    if (!preset?.hours) return undefined
    return fromIso(preset.hours)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timePreset, minuteTick])

  const offset = (page - 1) * PAGE_SIZE
  const { data, error, isLoading } = useDecisions({
    limit: PAGE_SIZE,
    offset,
    symbol: symbolFilter || undefined,
    direction: directionFilter || undefined,
    from: fromTime,
  })

  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = data?.decisions ?? []

  function handleSymbol(v: string) {
    setSymbolFilter(v)
    setPage(1)
  }
  function handleDirection(v: string) {
    setDirectionFilter(v)
    setPage(1)
  }
  function handleTimePreset(v: TimePreset) {
    setTimePreset(v)
    setPage(1)
  }

  return (
    <div className="px-2 sm:px-6">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
          Decision History
        </h2>
        <div className="ml-auto flex flex-wrap gap-2 items-center">
          {/* Time preset buttons */}
          <div className="flex gap-1">
            {TIME_PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => handleTimePreset(p.value)}
                className={`px-2 sm:px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  timePreset === p.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <select
            value={symbolFilter}
            onChange={(e) => handleSymbol(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded-lg px-2 sm:px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All symbols</option>
            {SYMBOLS.map((s) => (
              <option key={s} value={s}>
                {s.replace('/USDT', '')}
              </option>
            ))}
          </select>
          <select
            value={directionFilter}
            onChange={(e) => handleDirection(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded-lg px-2 sm:px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All directions</option>
            {DIRECTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && (
        <p className="text-gray-400 text-sm py-4">Loading decisions…</p>
      )}
      {error && (
        <p className="text-red-400 text-sm py-4">
          Failed to load decisions: {error?.message}
        </p>
      )}

      {!isLoading && !error && (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-left">
              <thead className="bg-gray-900">
                <tr>
                  {['ID', 'Time', 'Symbol', 'Direction', 'Type', 'Action', 'Price', 'Conf', 'Score', 'Reasoning'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-3 py-8 text-center text-gray-600 text-sm">
                      No decisions found
                    </td>
                  </tr>
                ) : (
                  pageRows.map((d) => <DecisionRow key={String(d.id)} d={d} />)
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span>
              {total} record{total !== 1 ? 's' : ''}
              {(symbolFilter || directionFilter || timePreset !== 'all') ? ' (filtered)' : ''}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ‹
              </button>
              <span className="px-2">
                {safePage} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ›
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
