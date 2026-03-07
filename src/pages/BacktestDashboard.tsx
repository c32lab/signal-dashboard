import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useBacktest } from '../hooks/useApi'
import { formatDateTime, formatDate, formatChartTime } from '../utils/format'
import type { BacktestResult, BacktestSummary, SymbolBacktest } from '../types/backtest'
import SectionErrorBoundary from '../components/SectionErrorBoundary'

const PAGE_SIZE = 20

const CONFIG_COLORS: Record<string, string> = {
  A_current: '#60a5fa',     // blue
  B_pre_freeze: '#f97316',  // orange
  C_balanced: '#a78bfa',    // purple
}

function pct(v: number | undefined | null, decimals = 1): string {
  return `${(v ?? 0).toFixed(decimals)}%`
}

function daysBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

function bestConfigName(summary: BacktestSummary[]): string | null {
  if (summary.length === 0) return null
  let best = summary[0]
  for (const s of summary) {
    if (s.total_pnl_pct > best.total_pnl_pct) best = s
  }
  return best.config
}

function Skeleton() {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-pulse">
      <div className="h-8 bg-gray-800 rounded w-64" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
            <div className="h-5 bg-gray-800 rounded w-32" />
            <div className="h-4 bg-gray-800 rounded w-full" />
            <div className="h-4 bg-gray-800 rounded w-3/4" />
          </div>
        ))}
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl h-64" />
    </div>
  )
}

interface SummaryCardProps {
  config: string
  description: string
  win_rate_pct: number
  total_pnl_pct: number
  sharpe: number
  max_drawdown_pct: number
  total_trades: number
  isBest: boolean
}

function SummaryCard({ config, description, win_rate_pct, total_pnl_pct, sharpe, max_drawdown_pct, total_trades, isBest }: SummaryCardProps) {
  const color = CONFIG_COLORS[config] ?? '#9ca3af'
  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors rounded-xl p-4 space-y-3 relative">
      {isBest && (
        <span className="absolute top-2 right-2 text-amber-400 text-sm" title="Best PnL">⭐</span>
      )}
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <span className="font-semibold text-sm text-gray-100">{config}</span>
      </div>
      <p className="text-xs text-gray-400">{description}</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-gray-500 mb-0.5">Win Rate</div>
          <div className={`font-mono font-semibold ${win_rate_pct >= 50 ? 'text-green-400' : 'text-red-400'}`}>
            {pct(win_rate_pct)}
          </div>
        </div>
        <div>
          <div className="text-gray-500 mb-0.5">Total PnL</div>
          <div className={`font-mono font-semibold ${total_pnl_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {pct(total_pnl_pct)}
          </div>
        </div>
        <div>
          <div className="text-gray-500 mb-0.5">Sharpe</div>
          <div className="font-mono font-semibold text-gray-200">{(sharpe ?? 0).toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-0.5">Max DD</div>
          <div className="font-mono font-semibold text-red-400">{pct(max_drawdown_pct)}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-0.5">Trades</div>
          <div className="font-mono font-semibold text-gray-200">{total_trades}</div>
        </div>
      </div>
    </div>
  )
}

interface PnlChartProps {
  pnl_curve: BacktestResult['pnl_curve']
}

function PnlChart({ pnl_curve }: PnlChartProps) {
  // Merge all timestamps across configs into a unified sorted list
  const configNames = Object.keys(pnl_curve)
  const allTimestamps = Array.from(
    new Set(configNames.flatMap((c) => pnl_curve[c].map((p) => p.timestamp)))
  ).sort()

  // Build a lookup map per config for fast access
  const lookups: Record<string, Record<string, number>> = {}
  for (const c of configNames) {
    lookups[c] = {}
    for (const pt of pnl_curve[c]) {
      lookups[c][pt.timestamp] = pt.cumulative_pnl_pct
    }
  }

  const chartData = allTimestamps.map((ts) => {
    const row: Record<string, string | number> = { timestamp: ts }
    for (const c of configNames) {
      if (lookups[c][ts] !== undefined) {
        row[c] = lookups[c][ts]
      }
    }
    return row
  })

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h2 className="text-sm font-semibold text-gray-300 mb-4">Cumulative PnL%</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(ts: string) => formatChartTime(ts)}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            minTickGap={60}
          />
          <YAxis
            tickFormatter={(v: number) => `${v.toFixed(1)}%`}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            width={52}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
            labelStyle={{ color: '#9ca3af', fontSize: 11 }}
            itemStyle={{ fontSize: 12 }}
            labelFormatter={(ts: unknown) => formatDateTime(String(ts ?? ''))}
            formatter={(value: unknown, name: unknown) => [`${Number(value ?? 0).toFixed(2)}%`, String(name ?? '')]}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
          {configNames.map((c) => (
            <Line
              key={c}
              type="monotone"
              dataKey={c}
              stroke={CONFIG_COLORS[c] ?? '#9ca3af'}
              dot={false}
              strokeWidth={2}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

interface SymbolRowProps {
  symbol: string
  rows: SymbolBacktest[]
}

interface TradeDistributionChartProps {
  summary: BacktestSummary[]
}

function TradeDistributionChart({ summary }: TradeDistributionChartProps) {
  const chartData = summary.map((s) => ({
    config: s.config,
    win_rate: s.win_rate_pct,
    pnl: s.total_pnl_pct,
  }))

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h2 className="text-sm font-semibold text-gray-300 mb-4">Trade Distribution</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="config"
            tick={{ fill: '#6b7280', fontSize: 11 }}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={(v: number) => `${(v ?? 0).toFixed(0)}%`}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            width={48}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v: number) => `${(v ?? 0).toFixed(0)}%`}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            width={48}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
            labelStyle={{ color: '#9ca3af', fontSize: 11 }}
            itemStyle={{ fontSize: 12 }}
            formatter={(value: unknown, name: unknown) => [
              `${Number(value ?? 0).toFixed(1)}%`,
              String(name ?? '') === 'win_rate' ? 'Win Rate' : 'PnL%',
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: '#9ca3af' }}
            formatter={(value: unknown) => (String(value ?? '') === 'win_rate' ? 'Win Rate' : 'Total PnL%')}
          />
          <Bar yAxisId="left" dataKey="win_rate" fill="#4ade80" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="right" dataKey="pnl" fill="#60a5fa" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function SymbolRow({ symbol, rows }: SymbolRowProps) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-900 hover:bg-gray-800 transition-colors text-left"
        onClick={() => setExpanded((e) => !e)}
      >
        <span className="font-mono text-sm text-gray-100">{symbol}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-t border-gray-800 bg-gray-950">
                <th className="text-left px-4 py-2 text-gray-500 font-medium">Config</th>
                <th className="text-right px-4 py-2 text-gray-500 font-medium">Trades</th>
                <th className="text-right px-4 py-2 text-gray-500 font-medium">Win Rate</th>
                <th className="text-right px-4 py-2 text-gray-500 font-medium">PnL%</th>
                <th className="text-right px-4 py-2 text-gray-500 font-medium">Sharpe</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const hasDirectional = (r.long_count ?? 0) > 0 || (r.short_count ?? 0) > 0
                return (
                  <tr key={r.config} className="border-t border-gray-800 bg-gray-900">
                    <td className="px-4 py-2">
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: CONFIG_COLORS[r.config] ?? '#9ca3af' }}
                      />
                      <span className="text-gray-200">{r.config}</span>
                      {hasDirectional && (
                        <div className="mt-1.5 ml-4 space-y-0.5 text-[10px]">
                          <div className="flex gap-3">
                            <span className="text-green-400">LONG</span>
                            <span className="text-gray-400">×{r.long_count ?? 0}</span>
                            <span className={((r.long_pnl_pct ?? 0) >= 0) ? 'text-green-400' : 'text-red-400'}>
                              {pct(r.long_pnl_pct ?? 0)}
                            </span>
                          </div>
                          <div className="flex gap-3">
                            <span className="text-red-400">SHORT</span>
                            <span className="text-gray-400">×{r.short_count ?? 0}</span>
                            <span className={((r.short_pnl_pct ?? 0) >= 0) ? 'text-green-400' : 'text-red-400'}>
                              {pct(r.short_pnl_pct ?? 0)}
                            </span>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-gray-300">{r.trades}</td>
                    <td className={`px-4 py-2 text-right font-mono ${(r.win_rate_pct ?? 0) >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                      {pct(r.win_rate_pct ?? 0)}
                    </td>
                    <td className={`px-4 py-2 text-right font-mono ${r.total_pnl_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pct(r.total_pnl_pct)}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-gray-300">{(r.sharpe ?? 0).toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const REGIME_OPTIONS = ['all', 'trending', 'ranging', 'volatile'] as const
type RegimeFilter = typeof REGIME_OPTIONS[number]

const REGIME_ACTIVE_STYLES: Record<RegimeFilter, string> = {
  all: 'bg-blue-600 text-white',
  trending: 'bg-green-600 text-white',
  ranging: 'bg-yellow-600 text-white',
  volatile: 'bg-red-600 text-white',
}

const REGIME_LABEL_COLORS: Record<string, string> = {
  trending: 'text-green-400',
  ranging: 'text-yellow-400',
  volatile: 'text-red-400',
}

interface RegimeMiniCardProps {
  regime: string
  summaries: BacktestSummary[]
}

function RegimeMiniCard({ regime, summaries }: RegimeMiniCardProps) {
  const totalTrades = summaries.reduce((sum, s) => sum + s.total_trades, 0)
  const avgWinRate = summaries.length > 0
    ? summaries.reduce((sum, s) => sum + s.win_rate_pct, 0) / summaries.length
    : 0
  const avgPnl = summaries.length > 0
    ? summaries.reduce((sum, s) => sum + s.total_pnl_pct, 0) / summaries.length
    : 0

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 space-y-2">
      <span className={`text-sm font-semibold uppercase ${REGIME_LABEL_COLORS[regime] ?? 'text-gray-300'}`}>
        {regime}
      </span>
      {totalTrades === 0 ? (
        <p className="text-xs text-gray-500">No data</p>
      ) : (
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <div className="text-gray-500 mb-0.5">Trades</div>
            <div className="font-mono font-semibold text-gray-200">{totalTrades}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-0.5">Win Rate</div>
            <div className={`font-mono font-semibold ${avgWinRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
              {pct(avgWinRate)}
            </div>
          </div>
          <div>
            <div className="text-gray-500 mb-0.5">PnL%</div>
            <div className={`font-mono font-semibold ${avgPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {pct(avgPnl)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface ResultViewProps {
  result: BacktestResult
}

function ResultView({ result }: ResultViewProps) {
  const [selectedRegime, setSelectedRegime] = useState<RegimeFilter>('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (selectedRegime === 'all') return result

    // If by_regime exists and has data for this regime, use it for summary
    const regimeSummary = result.by_regime?.[selectedRegime]
    const summary = regimeSummary ?? result.summary.filter(s => s.regime === selectedRegime)

    // Filter by_symbol rows
    const bySymbol: Record<string, SymbolBacktest[]> = {}
    for (const [sym, rows] of Object.entries(result.by_symbol)) {
      const filtered = rows.filter(r => r.regime === selectedRegime)
      if (filtered.length > 0) bySymbol[sym] = filtered
    }

    // Filter pnl_curve
    const pnlCurve: Record<string, typeof result.pnl_curve[string]> = {}
    for (const [config, points] of Object.entries(result.pnl_curve)) {
      const filtered = points.filter(p => p.regime === selectedRegime)
      if (filtered.length > 0) pnlCurve[config] = filtered
    }

    return { ...result, summary, by_symbol: bySymbol, pnl_curve: pnlCurve }
  }, [result, selectedRegime])

  const symbols = Object.keys(filtered.by_symbol).sort()
  const totalPages = Math.max(1, Math.ceil(symbols.length / PAGE_SIZE))
  const pageSymbols = symbols.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const best = bestConfigName(filtered.summary)
  const totalTrades = filtered.summary.reduce((sum, s) => sum + s.total_trades, 0)
  const days = result.data_range
    ? daysBetween(result.data_range.start, result.data_range.end)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-100">Backtest A/B Test</h1>
        <div className="mt-1 text-xs text-gray-500 space-x-3 flex flex-wrap gap-y-1">
          <span>Generated: {formatDateTime(result.generated_at)}</span>
          {result.data_range && (
            <>
              <span>·</span>
              <span>
                Data: {formatDate(result.data_range.start)} – {formatDate(result.data_range.end)}
              </span>
              <span>·</span>
              <span>{days} 天</span>
            </>
          )}
          <span>·</span>
          <span>{totalTrades} 笔交易</span>
        </div>
      </div>

      {/* Regime filter pills */}
      <div className="flex gap-2 flex-wrap">
        {REGIME_OPTIONS.map(r => (
          <button
            key={r}
            onClick={() => { setSelectedRegime(r); setPage(1) }}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              selectedRegime === r
                ? REGIME_ACTIVE_STYLES[r]
                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <SectionErrorBoundary title="Summary Cards">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.summary.map((s) => (
            <SummaryCard
              key={s.config}
              config={s.config}
              description={result.configs[s.config]?.description ?? ''}
              win_rate_pct={s.win_rate_pct}
              total_pnl_pct={s.total_pnl_pct}
              sharpe={s.sharpe}
              max_drawdown_pct={s.max_drawdown_pct}
              total_trades={s.total_trades}
              isBest={s.config === best}
            />
          ))}
        </div>
      </SectionErrorBoundary>

      {/* Performance by Regime */}
      {result.by_regime && Object.keys(result.by_regime).length > 0 && (
        <SectionErrorBoundary title="Performance by Regime">
          <div>
            <h2 className="text-sm font-semibold text-gray-300 mb-3">Performance by Regime</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['trending', 'ranging', 'volatile'].map(regime => (
                <RegimeMiniCard
                  key={regime}
                  regime={regime}
                  summaries={result.by_regime![regime] ?? []}
                />
              ))}
            </div>
          </div>
        </SectionErrorBoundary>
      )}

      {/* PnL curve */}
      {filtered.pnl_curve && Object.keys(filtered.pnl_curve).length > 0 && (
        <SectionErrorBoundary title="PnL Chart">
          <PnlChart pnl_curve={filtered.pnl_curve} />
        </SectionErrorBoundary>
      )}

      {/* Trade Distribution chart */}
      {filtered.summary.length > 1 && (
        <SectionErrorBoundary title="Trade Distribution">
          <TradeDistributionChart summary={filtered.summary} />
        </SectionErrorBoundary>
      )}

      {/* By-symbol table */}
      {symbols.length > 0 && (
        <SectionErrorBoundary title="By Symbol">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-300">
              By Symbol
              <span className="ml-2 text-xs text-gray-500 font-normal">
                ({symbols.length} symbols)
              </span>
            </h2>
            {pageSymbols.map((sym) => (
              <SymbolRow key={sym} symbol={sym} rows={filtered.by_symbol[sym]} />
            ))}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-gray-500">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, symbols.length)} of {symbols.length}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>
                  <span className="text-xs text-gray-400 leading-7">
                    {page} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </SectionErrorBoundary>
      )}
    </div>
  )
}

export default function BacktestDashboard() {
  const { data, error, isLoading } = useBacktest()
  const [activeIdx, setActiveIdx] = useState(0)

  // Detect duplicate tab labels to add index prefix — must be before early returns (hooks rule)
  const tabLabels = useMemo(() => {
    if (!data || data.results.length === 0) return []
    const raw = data.results.map(r =>
      r.data_range
        ? `${formatDate(r.data_range.start)} – ${formatDate(r.data_range.end)}`
        : formatDateTime(r.generated_at) || 'Backtest'
    )
    const counts = new Map<string, number>()
    raw.forEach(l => counts.set(l, (counts.get(l) ?? 0) + 1))
    const seen = new Map<string, number>()
    return raw.map(l => {
      if ((counts.get(l) ?? 0) > 1) {
        const idx = (seen.get(l) ?? 0) + 1
        seen.set(l, idx)
        return `#${idx} ${l}`
      }
      return l
    })
  }, [data])

  if (isLoading) return <Skeleton />

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-950 border border-red-800 text-red-300 rounded-xl p-4 text-sm">
          Failed to load backtest data: {error.message}
        </div>
      </div>
    )
  }

  if (!data || data.results.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-500 text-sm">
          No backtest data available.
        </div>
      </div>
    )
  }

  // Clamp activeIdx to avoid out-of-bounds after data reload
  const safeIdx = Math.min(activeIdx, data.results.length - 1)
  const result = data.results[safeIdx] ?? data.results[0]

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Multi-result tabs */}
      {data.results.length > 1 && (
        <div className="flex gap-1 border-b border-gray-800 overflow-x-auto">
          {data.results.map((_r, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`px-4 py-2 text-sm whitespace-nowrap transition-colors border-b-2 ${
                idx === safeIdx
                  ? 'text-blue-400 border-blue-400 font-semibold'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
            >
              {tabLabels[idx]}
            </button>
          ))}
        </div>
      )}
      <ResultView result={result} />
    </div>
  )
}
