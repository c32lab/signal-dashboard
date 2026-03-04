import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { usePerformance, useAccuracyTrend, useSignalQuality } from '../hooks/useApi'
import type { PerformanceSymbol, AccuracyTrendItem, SignalQualitySymbol } from '../types'
import { validatePercent, validatePnL } from '../utils/dataValidation'
import DataWarning from '../components/DataWarning'

const SYMBOL_COLORS: Record<string, string> = {
  BTCUSDT: '#60a5fa',
  ETHUSDT: '#a78bfa',
  SOLUSDT: '#22d3ee',
  BNBUSDT: '#fbbf24',
  XRPUSDT: '#34d399',
  AVAXUSDT: '#f87171',
  LINKUSDT: '#f472b6',
}

function accuracyColor(pct: number) {
  if (pct > 50) return '#34d399'
  if (pct >= 30) return '#fbbf24'
  return '#f87171'
}

function formatHour(hour: string): string {
  const d = new Date(hour)
  if (isNaN(d.getTime())) return hour
  return d.toLocaleString([], {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function pnlColor(pnl: number | null | undefined) {
  if (pnl == null) return 'text-gray-400'
  if (pnl > 0) return 'text-green-400'
  if (pnl < 0) return 'text-red-400'
  return 'text-gray-400'
}

function pnlStr(pnl: number | null | undefined) {
  if (pnl == null) return '—'
  return `${pnl > 0 ? '+' : ''}${pnl.toFixed(2)}%`
}

const TOOLTIP_STYLE = {
  contentStyle: { background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 },
  labelStyle: { color: '#9ca3af' },
  itemStyle: { color: '#e5e7eb' },
}

// ── Section A: Accuracy Leaderboard ──────────────────────────────────────────

function AccuracyLeaderboard({ data }: { data: PerformanceSymbol[] }) {
  const sorted = [...data].sort((a, b) => b.accuracy_pct - a.accuracy_pct)

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <h2 className="text-sm font-semibold text-gray-200 mb-4">Accuracy Leaderboard</h2>
      <ResponsiveContainer width="100%" height={Math.max(180, sorted.length * 44)}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 4, right: 56, bottom: 4, left: 56 }}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="symbol"
            tickFormatter={(v: string) => v.replace('USDT', '')}
            tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip
            formatter={(value: number) => [`${Number(value).toFixed(1)}%`, 'Accuracy']}
            {...TOOLTIP_STYLE}
          />
          <Bar dataKey="accuracy_pct" name="Accuracy" radius={[0, 4, 4, 0]}>
            {sorted.map((entry) => (
              <Cell key={entry.symbol} fill={accuracyColor(entry.accuracy_pct)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="text-left py-2 px-3">Symbol</th>
              <th className="text-right py-2 px-3">Accuracy</th>
              <th className="text-right py-2 px-3">Correct / Total</th>
              <th className="text-right py-2 px-3">Avg PnL</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const accVal = validatePercent(row.accuracy_pct, 'Accuracy')
              const pnlVal = row.avg_pnl_pct != null ? validatePnL(row.avg_pnl_pct) : { valid: true }
              const hasAnomaly = !accVal.valid || !pnlVal.valid
              return (
                <tr key={row.symbol} className={`border-b border-gray-800/50 ${hasAnomaly ? 'bg-red-900/20' : ''}`}>
                  <td className="py-1.5 px-3 font-semibold text-gray-200">
                    {row.symbol.replace('USDT', '')}
                  </td>
                  <td
                    className="py-1.5 px-3 text-right font-mono font-bold"
                    style={{ color: accuracyColor(row.accuracy_pct) }}
                  >
                    {row.accuracy_pct.toFixed(1)}%
                    {!accVal.valid && <DataWarning message={accVal.warning!} />}
                  </td>
                  <td className="py-1.5 px-3 text-right text-gray-400">
                    {row.correct} / {row.total}
                  </td>
                  <td className={`py-1.5 px-3 text-right font-mono ${pnlColor(row.avg_pnl_pct)}`}>
                    {pnlStr(row.avg_pnl_pct)}
                    {!pnlVal.valid && <DataWarning message={pnlVal.warning!} />}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ── Section B: Accuracy Trend ─────────────────────────────────────────────────

function AccuracyTrend({
  data,
  hours,
  onHoursChange,
}: {
  data: AccuracyTrendItem[]
  hours: number
  onHoursChange: (h: number) => void
}) {
  const symbols = useMemo(() => [...new Set(data.map((d) => d.symbol))], [data])

  const pivoted = useMemo(() => {
    const map = new Map<string, Record<string, number | string>>()
    for (const item of data) {
      const h = formatHour(item.hour)
      if (!map.has(h)) map.set(h, { hour: h })
      const row = map.get(h)!
      row[item.symbol.replace('USDT', '')] = item.accuracy_pct
    }
    return Array.from(map.values())
  }, [data])

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-200">Accuracy Trend</h2>
        <div className="flex gap-1">
          {[6, 12, 24].map((h) => (
            <button
              key={h}
              onClick={() => onHoursChange(h)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                hours === h
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      {pivoted.length === 0 ? (
        <p className="text-center text-gray-600 py-12 text-sm">No trend data</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={pivoted} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="hour"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <Tooltip
              formatter={(value: number, name: string) => [`${Number(value).toFixed(1)}%`, name]}
              {...TOOLTIP_STYLE}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
            {symbols.map((sym) => (
              <Line
                key={sym}
                type="monotone"
                dataKey={sym.replace('USDT', '')}
                stroke={SYMBOL_COLORS[sym] ?? '#9ca3af'}
                strokeWidth={2}
                dot={false}
                connectNulls
                name={sym.replace('USDT', '')}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </section>
  )
}

// ── Section C: Signal Quality Table ──────────────────────────────────────────

function SignalQualityTable({
  data,
  hours,
  onHoursChange,
}: {
  data: SignalQualitySymbol[]
  hours: number
  onHoursChange: (h: number) => void
}) {
  const bestPnl = data.length ? Math.max(...data.map((d) => d.best_pnl ?? -Infinity)) : null
  const worstPnl = data.length ? Math.min(...data.map((d) => d.worst_pnl ?? Infinity)) : null

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-200">Signal Quality</h2>
        <div className="flex gap-1">
          {[1, 6, 24].map((h) => (
            <button
              key={h}
              onClick={() => onHoursChange(h)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                hours === h
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              {['Symbol', 'Signals', 'Correct', 'Accuracy', 'Avg PnL', 'Best PnL', 'Worst PnL'].map(
                (h) => (
                  <th
                    key={h}
                    className={`py-2 px-3 font-semibold uppercase tracking-wider ${
                      h === 'Symbol' ? 'text-left' : 'text-right'
                    }`}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-600">
                  No data
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const isBest = bestPnl !== null && row.best_pnl === bestPnl
                const isWorst = worstPnl !== null && row.worst_pnl === worstPnl
                const accVal = validatePercent(row.accuracy_pct, 'Accuracy')
                const avgPnlVal = row.avg_pnl_pct != null ? validatePnL(row.avg_pnl_pct) : { valid: true }
                const hasAnomaly = !accVal.valid || !avgPnlVal.valid
                return (
                  <tr
                    key={row.symbol}
                    className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${hasAnomaly ? 'bg-red-900/20' : ''}`}
                  >
                    <td className="py-2 px-3 font-semibold text-gray-200">
                      {row.symbol.replace('USDT', '')}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-400">{row.total_signals}</td>
                    <td className="py-2 px-3 text-right text-gray-400">{row.correct}</td>
                    <td
                      className="py-2 px-3 text-right font-mono font-bold"
                      style={{ color: accuracyColor(row.accuracy_pct) }}
                    >
                      {row.accuracy_pct.toFixed(1)}%
                      {!accVal.valid && <DataWarning message={accVal.warning!} />}
                    </td>
                    <td className={`py-2 px-3 text-right font-mono ${pnlColor(row.avg_pnl_pct)}`}>
                      {pnlStr(row.avg_pnl_pct)}
                      {!avgPnlVal.valid && <DataWarning message={avgPnlVal.warning!} />}
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-mono font-bold ${
                        isBest
                          ? 'text-green-300 bg-green-900/20'
                          : pnlColor(row.best_pnl)
                      }`}
                    >
                      {pnlStr(row.best_pnl)}
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-mono font-bold ${
                        isWorst
                          ? 'text-red-300 bg-red-900/20'
                          : pnlColor(row.worst_pnl)
                      }`}
                    >
                      {pnlStr(row.worst_pnl)}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ── Loading / Error helpers ───────────────────────────────────────────────────

function SectionSkeleton({ text }: { text: string }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center text-gray-500 text-sm">
      {text}
    </div>
  )
}

function SectionError({ message }: { message: string }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center text-red-400 text-sm">
      {message}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function QualityTracker() {
  const [trendHours, setTrendHours] = useState(24)
  const [qualityHours, setQualityHours] = useState(6)

  const perfRes = usePerformance()
  const trendRes = useAccuracyTrend(trendHours)
  const qualityRes = useSignalQuality(qualityHours)

  const perfData = (perfRes.data as { by_symbol?: PerformanceSymbol[] } | undefined)?.by_symbol
  const trendData = trendRes.data as AccuracyTrendItem[] | undefined
  const qualityData = (
    qualityRes.data as { by_symbol?: SignalQualitySymbol[] } | undefined
  )?.by_symbol

  return (
    <div className="p-6 space-y-6">
      {/* A: Leaderboard */}
      {perfRes.isLoading ? (
        <SectionSkeleton text="Loading leaderboard…" />
      ) : perfRes.error ? (
        <SectionError message={`Leaderboard: ${perfRes.error.message}`} />
      ) : perfData?.length ? (
        <AccuracyLeaderboard data={perfData} />
      ) : (
        <SectionSkeleton text="No performance data" />
      )}

      {/* B: Trend */}
      {trendRes.isLoading ? (
        <SectionSkeleton text="Loading trend…" />
      ) : trendRes.error ? (
        <SectionError message={`Trend: ${trendRes.error.message}`} />
      ) : (
        <AccuracyTrend
          data={trendData ?? []}
          hours={trendHours}
          onHoursChange={setTrendHours}
        />
      )}

      {/* C: Signal Quality */}
      {qualityRes.isLoading ? (
        <SectionSkeleton text="Loading signal quality…" />
      ) : qualityRes.error ? (
        <SectionError message={`Quality: ${qualityRes.error.message}`} />
      ) : (
        <SignalQualityTable
          data={qualityData ?? []}
          hours={qualityHours}
          onHoursChange={setQualityHours}
        />
      )}
    </div>
  )
}
