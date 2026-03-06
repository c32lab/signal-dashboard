import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useBacktest } from '../hooks/useApi'
import { formatDateTime, formatDate, formatChartTime } from '../utils/format'
import type { BacktestResult, SymbolBacktest } from '../types/backtest'

const CONFIG_COLORS: Record<string, string> = {
  A_current: '#60a5fa',     // blue
  B_pre_freeze: '#f97316',  // orange
  C_balanced: '#a78bfa',    // purple
}

function pct(v: number, decimals = 1): string {
  return `${v.toFixed(decimals)}%`
}

function Skeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
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
  win_rate: number
  total_pnl_pct: number
  sharpe: number
  max_drawdown_pct: number
}

function SummaryCard({ config, description, win_rate, total_pnl_pct, sharpe, max_drawdown_pct }: SummaryCardProps) {
  const color = CONFIG_COLORS[config] ?? '#9ca3af'
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <span className="font-semibold text-sm text-gray-100">{config}</span>
      </div>
      <p className="text-xs text-gray-400">{description}</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-gray-500 mb-0.5">Win Rate</div>
          <div className={`font-mono font-semibold ${win_rate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
            {pct(win_rate)}
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
          <div className="font-mono font-semibold text-gray-200">{sharpe.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-0.5">Max DD</div>
          <div className="font-mono font-semibold text-red-400">{pct(max_drawdown_pct)}</div>
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
            labelFormatter={(ts) => formatDateTime(String(ts))}
            formatter={(value, name) => [`${Number(value).toFixed(2)}%`, String(name)]}
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
              {rows.map((r) => (
                <tr key={r.config} className="border-t border-gray-800 bg-gray-900">
                  <td className="px-4 py-2">
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: CONFIG_COLORS[r.config] ?? '#9ca3af' }}
                    />
                    <span className="text-gray-200">{r.config}</span>
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-gray-300">{r.trades}</td>
                  <td className={`px-4 py-2 text-right font-mono ${r.win_rate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                    {pct(r.win_rate)}
                  </td>
                  <td className={`px-4 py-2 text-right font-mono ${r.total_pnl_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {pct(r.total_pnl_pct)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-gray-300">{r.sharpe.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

interface ResultViewProps {
  result: BacktestResult
}

function ResultView({ result }: ResultViewProps) {
  const symbols = Object.keys(result.by_symbol).sort()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-100">Backtest A/B Test</h1>
        <div className="mt-1 text-xs text-gray-500 space-x-3">
          <span>Generated: {formatDateTime(result.generated_at)}</span>
          <span>·</span>
          <span>
            Data: {formatDate(result.data_range.start)} – {formatDate(result.data_range.end)}
          </span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {result.summary.map((s) => (
          <SummaryCard
            key={s.config}
            config={s.config}
            description={result.configs[s.config]?.description ?? ''}
            win_rate={s.win_rate}
            total_pnl_pct={s.total_pnl_pct}
            sharpe={s.sharpe}
            max_drawdown_pct={s.max_drawdown_pct}
          />
        ))}
      </div>

      {/* PnL curve */}
      {Object.keys(result.pnl_curve).length > 0 && (
        <PnlChart pnl_curve={result.pnl_curve} />
      )}

      {/* By-symbol table */}
      {symbols.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-300">By Symbol</h2>
          {symbols.map((sym) => (
            <SymbolRow key={sym} symbol={sym} rows={result.by_symbol[sym]} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function BacktestDashboard() {
  const { data, error, isLoading } = useBacktest()

  if (isLoading) return <Skeleton />

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-950 border border-red-800 text-red-300 rounded-xl p-4 text-sm">
          Failed to load backtest data: {error.message}
        </div>
      </div>
    )
  }

  if (!data || data.results.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-500 text-sm">
          No backtest data available.
        </div>
      </div>
    )
  }

  const result = data.results[0]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ResultView result={result} />
    </div>
  )
}
