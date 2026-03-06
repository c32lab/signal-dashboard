import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { DirectionBadge } from './badges'
import type { AccuracyEntry, Validation } from '../../types/predict'
import { formatDateTime, formatPrice } from '../../utils/format'

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
                {formatDateTime(v.validated_at)}
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
                {formatPrice(v.price_at_prediction, v.symbol)} → {formatPrice(v.price_at_validation, v.symbol)}
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

export function AccuracyAndValidationsSection({
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
