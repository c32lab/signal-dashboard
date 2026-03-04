import { useState, useCallback } from 'react'
import type { Decision, PerformanceSymbol } from '../types'
import { useDecisions, usePerformance, useOverview } from '../hooks/useApi'
import { api } from '../api'
import { validatePrice, validateConfidence } from '../utils/dataValidation'
import DataWarning from '../components/DataWarning'

const PAGE_SIZE = 50

const SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT', 'AVAX/USDT', 'LINK/USDT']

const ACTIONS = ['LONG', 'SHORT', 'HOLD']
const DIRECTIONS = ['LONG', 'SHORT', 'NEUTRAL']

// ── Helpers ───────────────────────────────────────────────────────────────────

function actionBadge(action: string): string {
  switch (action) {
    case 'LONG': return 'bg-green-900 text-green-300'
    case 'SHORT': return 'bg-red-900 text-red-300'
    default: return 'bg-gray-800 text-gray-400'
  }
}

function dirBadge(dir: string): string {
  switch (dir) {
    case 'LONG': return 'bg-green-900/60 text-green-400'
    case 'SHORT': return 'bg-red-900/60 text-red-400'
    default: return 'bg-gray-800 text-gray-500'
  }
}

function typeBadge(type: string): string {
  switch (type?.toUpperCase()) {
    case 'FAST': return 'bg-blue-900 text-blue-300'
    case 'SLOW': return 'bg-purple-900 text-purple-300'
    default: return 'bg-gray-800 text-gray-500'
  }
}

function scoreColor(score: number): string {
  if (score > 0) return 'text-green-400'
  if (score < 0) return 'text-red-400'
  return 'text-gray-400'
}

function accColor(pct: number | null | undefined): string {
  if (pct == null) return 'text-gray-100'
  if (pct > 50) return 'text-green-400'
  if (pct >= 30) return 'text-amber-400'
  return 'text-red-400'
}

function pnlColor(pnl: number | null | undefined): string {
  if (pnl == null) return 'text-gray-300'
  if (pnl > 0) return 'text-green-400'
  if (pnl < 0) return 'text-red-400'
  return 'text-gray-300'
}

function pnlStr(pnl: number | null | undefined): string {
  if (pnl == null) return '—'
  return `${pnl > 0 ? '+' : ''}${pnl.toFixed(2)}%`
}

function formatTs(ts: string): string {
  const d = new Date(ts)
  if (isNaN(d.getTime())) return ts
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatPrice(p: number | null | undefined): string {
  if (p == null) return '—'
  return p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}

function stripUsdt(sym: string): string {
  return sym.replace(/\/USDT$/, '').replace(/USDT$/, '')
}

function parseRawJson(rawJson?: string): { stop_loss: number | null; take_profit: number | null } {
  if (!rawJson) return { stop_loss: null, take_profit: null }
  try {
    const p = JSON.parse(rawJson)
    return {
      stop_loss: p.suggested_stop_loss ?? null,
      take_profit: p.suggested_take_profit ?? null,
    }
  } catch {
    return { stop_loss: null, take_profit: null }
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  color = 'text-gray-100',
}: {
  label: string
  value: string
  color?: string
}) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex flex-col gap-1">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
    </div>
  )
}

function FilterSelect({
  value,
  onChange,
  disabled,
  title,
  children,
}: {
  value: string
  onChange?: (v: string) => void
  disabled?: boolean
  title?: string
  children: React.ReactNode
}) {
  return (
    <select
      value={value}
      onChange={e => onChange?.(e.target.value)}
      disabled={disabled}
      title={title}
      className="bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </select>
  )
}

function SymbolSummary({
  symbol,
  bySymbol,
}: {
  symbol: string
  bySymbol: PerformanceSymbol[]
}) {
  const row = bySymbol.find(s => s.symbol === symbol || s.symbol.replace('/', '') === symbol.replace('/', ''))
  if (!row) return null
  return (
    <div className="bg-gray-900 border border-blue-800/50 rounded-xl p-4 flex flex-wrap gap-6 items-center">
      <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">
        {stripUsdt(symbol)} Performance
      </span>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">Total Trades</p>
        <p className="text-lg font-bold text-gray-200">{row.total}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">Correct</p>
        <p className="text-lg font-bold text-gray-200">{row.correct}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">Accuracy</p>
        <p className={`text-lg font-bold ${accColor(row.accuracy_pct)}`}>{row.accuracy_pct.toFixed(1)}%</p>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">Avg PnL</p>
        <p className={`text-lg font-bold font-mono ${pnlColor(row.avg_pnl_pct)}`}>
          {pnlStr(row.avg_pnl_pct)}
        </p>
      </div>
    </div>
  )
}

function DecisionRow({ d }: { d: Decision }) {
  const { stop_loss, take_profit } = parseRawJson(d.raw_json)
  const confV = validateConfidence(d.confidence)
  const priceV = validatePrice(d.price_at_decision, d.symbol)
  const zeroConf = d.confidence === 0 && d.action !== 'HOLD'
  const confWarn = !confV.valid
    ? confV.warning
    : zeroConf
    ? `Confidence=0 但 action=${d.action}`
    : undefined

  return (
    <tr className="border-t border-gray-800 hover:bg-gray-900/80 transition-colors">
      <td className="px-3 py-2 text-xs text-gray-400 whitespace-nowrap font-mono">
        {formatTs(d.timestamp)}
      </td>
      <td className="px-3 py-2 text-xs font-semibold text-gray-200">
        {stripUsdt(d.symbol)}
      </td>
      <td className="px-3 py-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${actionBadge(d.action)}`}>
          {d.action}
        </span>
      </td>
      <td className="px-3 py-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${dirBadge(d.direction)}`}>
          {d.direction || '—'}
        </span>
      </td>
      <td className="px-3 py-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeBadge(d.decision_type)}`}>
          {d.decision_type || '—'}
        </span>
      </td>
      <td className="px-3 py-2 text-xs text-right font-mono">
        {typeof d.confidence === 'number' ? (
          <>
            <span className={confWarn ? 'text-amber-400' : 'text-gray-300'}>
              {/* confidence: decimal_0_1 → ×100 */}
              {Math.round(d.confidence * 100)}%
            </span>
            {confWarn && <DataWarning message={confWarn} />}
          </>
        ) : '—'}
      </td>
      <td className={`px-3 py-2 text-xs text-right font-mono ${typeof d.combined_score === 'number' ? scoreColor(d.combined_score) : 'text-gray-400'}`}>
        {typeof d.combined_score === 'number' ? d.combined_score.toFixed(3) : '—'}
      </td>
      <td className="px-3 py-2 text-xs text-right font-mono text-gray-300">
        {typeof d.price_at_decision === 'number' ? (
          <>
            {formatPrice(d.price_at_decision)}
            {!priceV.valid && <DataWarning message={priceV.warning!} />}
          </>
        ) : '—'}
      </td>
      <td className="px-3 py-2 text-xs text-right font-mono text-gray-400">
        {formatPrice(stop_loss)}
      </td>
      <td className="px-3 py-2 text-xs text-right font-mono text-gray-400">
        {formatPrice(take_profit)}
      </td>
      <td className="px-3 py-2 text-xs text-gray-500 max-w-xs truncate" title={d.reasoning}>
        {d.reasoning}
      </td>
    </tr>
  )
}

// ── CSV Export ────────────────────────────────────────────────────────────────

async function exportCsv(filters: {
  symbol?: string
  action?: string
  direction?: string
  type?: string
}) {
  const batchSize = 200
  const maxRecords = 2000
  const allRows: Decision[] = []
  // direction is client-side only, don't send to backend
  const { direction, ...serverFilters } = filters

  for (let offset = 0; offset < maxRecords; offset += batchSize) {
    const resp = await api.decisions({ ...serverFilters, limit: batchSize, offset })
    allRows.push(...resp.decisions)
    if (allRows.length >= resp.total || resp.decisions.length < batchSize) break
  }

  // Apply direction filter client-side
  const filtered = direction
    ? allRows.filter(d => d.direction === direction)
    : allRows

  const headers = [
    'timestamp', 'symbol', 'action', 'direction', 'decision_type',
    'confidence', 'combined_score', 'price_at_decision', 'stop_loss', 'take_profit', 'reasoning',
  ]
  const rows = filtered.map(d => {
    const { stop_loss, take_profit } = parseRawJson(d.raw_json)
    return [
      d.timestamp,
      stripUsdt(d.symbol),
      d.action,
      d.direction,
      d.decision_type,
      typeof d.confidence === 'number' ? `${(d.confidence * 100).toFixed(1)}%` : '', // confidence: decimal_0_1 → ×100
      typeof d.combined_score === 'number' ? d.combined_score.toFixed(3) : '',
      typeof d.price_at_decision === 'number' ? d.price_at_decision.toFixed(4) : '',
      stop_loss != null ? String(stop_loss) : '',
      take_profit != null ? String(take_profit) : '',
      `"${(d.reasoning || '').replace(/"/g, '""')}"`,
    ]
  })

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `decisions_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TraderHistory() {
  const [symbolFilter, setSymbolFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [directionFilter, setDirectionFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [offset, setOffset] = useState(0)
  const [exporting, setExporting] = useState(false)

  // Server-side filters (symbol, action, type are supported by backend)
  const serverFilters = {
    limit: PAGE_SIZE,
    offset,
    symbol: symbolFilter || undefined,
    action: actionFilter || undefined,
    type: typeFilter || undefined,
    // NOTE: direction is NOT supported server-side, handled client-side below
  }

  const { data: decisionsData, isLoading, error } = useDecisions(serverFilters)
  const { data: perfData } = usePerformance()
  const { data: overviewData } = useOverview()

  // Client-side direction filter (backend ignores direction param)
  const rawDecisions = decisionsData?.decisions ?? []
  const serverTotal = decisionsData?.total ?? 0

  const decisions = directionFilter
    ? rawDecisions.filter(d => d.direction === directionFilter)
    : rawDecisions
  // When direction filter active, total is approximate (server doesn't filter)
  const total = directionFilter ? decisions.length : serverTotal
  const isDirectionFiltered = !!directionFilter

  const overall = perfData?.overall
  const actionDist = overviewData?.action_distribution
  const activeSignals = actionDist
    ? (actionDist['LONG'] ?? 0) + (actionDist['SHORT'] ?? 0)
    : null

  const typeOptions = overviewData?.type_distribution
    ? Object.keys(overviewData.type_distribution).sort()
    : []

  const endRecord = isDirectionFiltered
    ? decisions.length
    : Math.min(offset + PAGE_SIZE, total)
  const startRecord = isDirectionFiltered
    ? (decisions.length > 0 ? 1 : 0)
    : (total === 0 ? 0 : offset + 1)
  const currentPage = isDirectionFiltered ? 1 : Math.floor(offset / PAGE_SIZE) + 1
  const totalPages = isDirectionFiltered ? 1 : Math.max(1, Math.ceil(total / PAGE_SIZE))

  function resetPage() { setOffset(0) }

  function handleSymbol(v: string) { setSymbolFilter(v); resetPage() }
  function handleAction(v: string) { setActionFilter(v); resetPage() }
  function handleDirection(v: string) { setDirectionFilter(v); resetPage() }
  function handleType(v: string) { setTypeFilter(v); resetPage() }

  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      await exportCsv({
        symbol: symbolFilter || undefined,
        action: actionFilter || undefined,
        direction: directionFilter || undefined,
        type: typeFilter || undefined,
      })
    } finally {
      setExporting(false)
    }
  }, [symbolFilter, actionFilter, directionFilter, typeFilter])

  return (
    <div className="p-6 space-y-6">
      {/* A. KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Trades"
          value={overall ? String(overall.total) : '—'}
        />
        <KpiCard
          label="Win Rate"
          value={overall ? `${overall.accuracy_pct.toFixed(1)}%` : '—'}
          color={accColor(overall?.accuracy_pct)}
        />
        <KpiCard
          label="Avg PnL"
          value={overall ? pnlStr(overall.avg_pnl_pct) : '—'}
          color={pnlColor(overall?.avg_pnl_pct)}
        />
        <KpiCard
          label="Active Signals"
          value={activeSignals != null ? String(activeSignals) : '—'}
          color="text-blue-400"
        />
      </div>

      {/* B. Filter Bar */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Filters</span>

          <FilterSelect value={symbolFilter} onChange={handleSymbol}>
            <option value="">All Symbols</option>
            {SYMBOLS.map(s => (
              <option key={s} value={s}>{stripUsdt(s)}</option>
            ))}
          </FilterSelect>

          <FilterSelect value={actionFilter} onChange={handleAction}>
            <option value="">All Actions</option>
            {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </FilterSelect>

          <FilterSelect value={typeFilter} onChange={handleType}>
            <option value="">All Types</option>
            {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </FilterSelect>

          <FilterSelect value={directionFilter} onChange={handleDirection}>
            <option value="">All Directions</option>
            {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </FilterSelect>

          <div title="Coming soon">
            <FilterSelect value="" disabled>
              <option value="">All Time</option>
            </FilterSelect>
          </div>

          <div className="ml-auto">
            <button
              onClick={handleExport}
              disabled={exporting || total === 0}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? 'Exporting…' : 'Export CSV'}
            </button>
          </div>
        </div>
      </div>

      {/* F. Symbol Performance Summary */}
      {symbolFilter && perfData?.by_symbol && (
        <SymbolSummary symbol={symbolFilter} bySymbol={perfData.by_symbol} />
      )}

      {/* C. Decision Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800">
        {isLoading && (
          <p className="text-gray-400 text-sm p-8 text-center">Loading decisions…</p>
        )}
        {error && (
          <p className="text-red-400 text-sm p-8 text-center">
            Failed to load decisions: {(error as Error)?.message}
          </p>
        )}

        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-950 sticky top-0 z-10">
                <tr>
                  {['Time', 'Symbol', 'Action', 'Dir', 'Type', 'Conf', 'Score', 'Price', 'SL', 'TP', 'Reasoning'].map(h => (
                    <th
                      key={h}
                      className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {decisions.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-3 py-12 text-center text-gray-600 text-sm">
                      No decisions found
                    </td>
                  </tr>
                ) : (
                  decisions.map(d => <DecisionRow key={String(d.id)} d={d} />)
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* D. Pagination */}
      {!isLoading && !error && total > 0 && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            第 {startRecord}–{endRecord} 条 / 共 {total} 条
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setOffset(o => Math.max(0, o - PAGE_SIZE))}
              disabled={offset === 0}
              className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ‹ 上一页
            </button>
            <span className="px-3">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setOffset(o => o + PAGE_SIZE)}
              disabled={endRecord >= total}
              className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              下一页 ›
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
