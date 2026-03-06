import { useState, useMemo, useEffect } from 'react'
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
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { usePerformance, useAccuracyTrend, useSignalQuality, useAccuracy } from '../hooks/useApi'
import type {
  PerformanceSymbol,
  PerformanceResponse,
  AccuracyTrendItem,
  AccuracyTrendPoint,
  SignalQualitySymbol,
  SignalQualityResponse,
  AccuracyResponse,
} from '../types'
import { validatePercent, validatePnL } from '../utils/dataValidation'
import DataWarning from '../components/DataWarning'
import LastUpdated from '../components/LastUpdated'
import CombinerWeights from '../components/CombinerWeights'
import SectionErrorBoundary from '../components/SectionErrorBoundary'

const SYMBOL_COLORS: Record<string, string> = {
  'BTC/USDT': '#60a5fa',
  'ETH/USDT': '#a78bfa',
  'SOL/USDT': '#22d3ee',
  'BNB/USDT': '#fbbf24',
  'XRP/USDT': '#34d399',
  'AVAX/USDT': '#f87171',
  'LINK/USDT': '#f472b6',
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

const TREND_COLORS = ['#60a5fa', '#f59e0b', '#34d399', '#f87171', '#a78bfa', '#fb923c', '#22d3ee', '#e879f9']

// ── Overall Summary Card ──────────────────────────────────────────────────────

function OverallSummary({ overall }: { overall: PerformanceResponse['overall'] }) {
  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <h2 className="text-sm font-semibold text-gray-200 mb-4">Overall Performance</h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Overall Accuracy</p>
          <p
            className="text-2xl sm:text-3xl font-bold font-mono"
            style={{ color: accuracyColor(overall.accuracy_pct) }}
          >
            {overall.accuracy_pct.toFixed(2)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Avg PnL</p>
          <p className={`text-2xl sm:text-3xl font-bold font-mono ${pnlColor(overall.avg_pnl_pct)}`}>
            {pnlStr(overall.avg_pnl_pct)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Total Trades</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-200">{overall.total}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Correct</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-200">{overall.correct}</p>
        </div>
      </div>
    </section>
  )
}

// ── Accuracy Overview Card ────────────────────────────────────────────────────

type AccuracyWindow = '6h' | '12h' | '24h'

function AccuracyOverview({ data }: { data: AccuracyResponse }) {
  const [selectedWindow, setSelectedWindow] = useState<AccuracyWindow>('24h')
  const windowData = data.windows[selectedWindow]
  const acc1h = windowData.accuracy['1h_pct'].toFixed(1)
  const acc4h = windowData.accuracy['4h_pct'].toFixed(1)
  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-200">Accuracy Overview</h2>
        <div className="flex gap-1">
          {(['6h', '12h', '24h'] as AccuracyWindow[]).map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWindow(w)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                selectedWindow === w
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">1h Accuracy</p>
          <p
            className="text-2xl sm:text-3xl font-bold font-mono"
            style={{ color: accuracyColor(Number(acc1h)) }}
          >
            {acc1h}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">4h Accuracy</p>
          <p
            className="text-2xl sm:text-3xl font-bold font-mono"
            style={{ color: accuracyColor(Number(acc4h)) }}
          >
            {acc4h}%
          </p>
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-500 border-t border-gray-800 pt-3">
        <span>Window: {selectedWindow}</span>
        <span>Actionable signals: {windowData.total_actionable}</span>
      </div>
      {windowData.dampened_symbols.length > 0 && (
        <p className="mt-2 text-xs text-yellow-500">
          ⚠ Dampened: {windowData.dampened_symbols.join(', ')}
        </p>
      )}
    </section>
  )
}

// ── Section A: Accuracy Leaderboard ──────────────────────────────────────────

function AccuracyLeaderboard({ data }: { data: PerformanceSymbol[] }) {
  const sorted = [...data]
    .map((entry) => ({
      ...entry,
      accuracy_pct: entry.accuracy_pct != null && !isNaN(entry.accuracy_pct)
        ? entry.accuracy_pct
        : entry.total > 0 ? (entry.correct / entry.total) * 100 : 0,
    }))
    .sort((a, b) => b.accuracy_pct - a.accuracy_pct)

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
            tickFormatter={(v: string) => v.replace('/USDT', '')}
            tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip
            formatter={(value: number | undefined) => [`${Number(value ?? 0).toFixed(1)}%`, 'Accuracy']}
            {...TOOLTIP_STYLE}
          />
          <Bar dataKey="accuracy_pct" name="Accuracy" radius={[0, 4, 4, 0]} fill="#6b7280" isAnimationActive={false}>
            {sorted.map((entry) => (
              <Cell
                key={entry.symbol}
                fill={accuracyColor(entry.accuracy_pct)}
                fillOpacity={entry.total < 5 ? 0.5 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-xs min-w-[600px]">
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
              const lowSample = row.total < 5
              return (
                <tr
                  key={row.symbol}
                  className={`border-b border-gray-800/50 ${hasAnomaly ? 'bg-red-900/20' : ''} ${lowSample ? 'text-gray-600' : ''}`}
                >
                  <td className={`py-1.5 px-3 font-semibold ${lowSample ? 'text-gray-600' : 'text-gray-200'}`}>
                    {row.symbol.replace('/USDT', '')}
                  </td>
                  <td
                    className="py-1.5 px-3 text-right font-mono font-bold"
                    style={{ color: lowSample ? '#4b5563' : accuracyColor(row.accuracy_pct) }}
                  >
                    {row.accuracy_pct.toFixed(1)}%
                    {row.total < 10 && (
                      <span className="ml-1 text-gray-500 font-normal text-[10px]">(n={row.total})</span>
                    )}
                    {!accVal.valid && <DataWarning message={accVal.warning!} />}
                  </td>
                  <td className={`py-1.5 px-3 text-right ${lowSample ? 'text-gray-600' : 'text-gray-400'}`}>
                    {row.correct} / {row.total}
                  </td>
                  <td className={`py-1.5 px-3 text-right font-mono ${lowSample ? 'text-gray-600' : pnlColor(row.avg_pnl_pct)}`}>
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
      const acc = item.accuracy_pct != null && !isNaN(item.accuracy_pct)
        ? item.accuracy_pct
        : item.total > 0 ? (item.correct / item.total) * 100 : null
      if (acc != null) row[item.symbol.replace('/USDT', '')] = acc
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
        <div className="h-[200px] sm:h-[260px] min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
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
                formatter={(value: number | undefined, name?: string) => [`${Number(value ?? 0).toFixed(1)}%`, name ?? '']}
                {...TOOLTIP_STYLE}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
              {symbols.map((sym) => (
                <Line
                  key={sym}
                  type="monotone"
                  dataKey={sym.replace('/USDT', '')}
                  stroke={SYMBOL_COLORS[sym] ?? '#9ca3af'}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                  connectNulls
                  isAnimationActive={false}
                  name={sym.replace('/USDT', '')}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
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
        <table className="w-full text-xs min-w-[600px]">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              {['Symbol', 'Long', 'Short', 'Hold', 'Total', 'Actionable Rate'].map((h) => (
                <th
                  key={h}
                  className={`py-2 px-3 font-semibold uppercase tracking-wider ${
                    h === 'Symbol' ? 'text-left' : 'text-right'
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-600">
                  No data
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const total = row.long + row.short + row.hold
                const actionableRate = total ? ((row.long + row.short) / total) * 100 : 0
                return (
                  <tr
                    key={row.symbol}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-2 px-3 font-semibold text-gray-200">
                      {row.symbol.replace('/USDT', '')}
                    </td>
                    <td className="py-2 px-3 text-right text-green-400">{row.long}</td>
                    <td className="py-2 px-3 text-right text-red-400">{row.short}</td>
                    <td className="py-2 px-3 text-right text-gray-400">{row.hold}</td>
                    <td className="py-2 px-3 text-right text-gray-300">{total}</td>
                    <td className="py-2 px-3 text-right font-mono text-gray-300">
                      {actionableRate.toFixed(1)}%
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

// ── AccuracyTrendChart ────────────────────────────────────────────────────────

function AccuracyTrendChart() {
  const { data, isLoading, error } = useAccuracyTrend()
  const trend = data as AccuracyTrendPoint[] | undefined

  const symbols = useMemo(() => [...new Set((trend ?? []).map((d) => d.symbol))], [trend])

  const pivoted = useMemo(() => {
    const map = new Map<string, Record<string, number | string>>()
    for (const item of trend ?? []) {
      const h = formatHour(item.hour)
      if (!map.has(h)) map.set(h, { hour: h })
      const row = map.get(h)!
      const acc =
        item.accuracy_pct != null && !isNaN(item.accuracy_pct)
          ? item.accuracy_pct
          : item.total > 0
          ? (item.correct / item.total) * 100
          : null
      if (acc != null) row[item.symbol] = acc
    }
    return Array.from(map.values())
  }, [trend])

  if (isLoading) return <SectionSkeleton text="Loading accuracy trend…" />
  if (error) return <SectionError message={`Trend: ${(error as Error).message}`} />

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <h2 className="text-sm font-semibold text-gray-200 mb-4">Accuracy Trend (by hour)</h2>
      {pivoted.length === 0 ? (
        <p className="text-center text-gray-600 py-12 text-sm">No trend data</p>
      ) : (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
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
                formatter={(value: number | undefined, name?: string) => [
                  `${Number(value ?? 0).toFixed(1)}%`,
                  name ?? '',
                ]}
                {...TOOLTIP_STYLE}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
              <ReferenceLine
                y={50}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{ value: 'Target', fill: '#ef4444', fontSize: 11 }}
              />
              {symbols.map((sym, i) => (
                <Line
                  key={sym}
                  type="monotone"
                  dataKey={sym}
                  stroke={TREND_COLORS[i % TREND_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                  connectNulls
                  isAnimationActive={false}
                  name={sym.replace('/USDT', '')}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function QualityTracker() {
  const [trendHours, setTrendHours] = useState(24)
  const [qualityHours, setQualityHours] = useState(6)

  const perfRes = usePerformance()
  const trendRes = useAccuracyTrend()
  const qualityRes = useSignalQuality(qualityHours)
  const accuracyRes = useAccuracy()

  const [lastUpdated, setLastUpdated] = useState<Date>()

  useEffect(() => {
    if (perfRes.data) setLastUpdated(new Date())
  }, [perfRes.data])

  const perfData = (perfRes.data as PerformanceResponse | undefined)?.by_symbol
  const perfOverall = (perfRes.data as PerformanceResponse | undefined)?.overall
  const trendData = trendRes.data as AccuracyTrendItem[] | undefined
  const filteredTrendData = useMemo<AccuracyTrendItem[]>(() => {
    if (!trendData) return []
    const cutoff = new Date(Date.now() - trendHours * 60 * 60 * 1000)
    return trendData.filter((d) => new Date(d.hour) >= cutoff)
  }, [trendData, trendHours])
  const qualityData = useMemo<SignalQualitySymbol[]>(() => {
    const bySymbol = (qualityRes.data as SignalQualityResponse | undefined)?.by_symbol
    if (!bySymbol) return []
    return Object.entries(bySymbol).map(([symbol, counts]) => ({
      symbol,
      long: counts.long,
      short: counts.short,
      hold: counts.hold,
    }))
  }, [qualityRes.data])
  const accuracyData = accuracyRes.data as AccuracyResponse | undefined

  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <LastUpdated timestamp={lastUpdated} />
      {/* Accuracy Trend Chart */}
      <SectionErrorBoundary title="Accuracy Trend Chart">
        <AccuracyTrendChart />
      </SectionErrorBoundary>
      {/* Top row: Overall Summary + Accuracy Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {perfRes.isLoading ? (
          <SectionSkeleton text="Loading overall performance…" />
        ) : perfRes.error ? (
          <SectionError message={`Performance: ${perfRes.error.message}`} />
        ) : perfOverall ? (
          <SectionErrorBoundary title="Overall Performance">
            <OverallSummary overall={perfOverall} />
          </SectionErrorBoundary>
        ) : (
          <SectionSkeleton text="No overall data" />
        )}

        {accuracyRes.isLoading ? (
          <SectionSkeleton text="Loading accuracy overview…" />
        ) : accuracyRes.error ? (
          <SectionError message={`Accuracy: ${accuracyRes.error.message}`} />
        ) : accuracyData ? (
          <SectionErrorBoundary title="Accuracy Overview">
            <AccuracyOverview data={accuracyData} />
          </SectionErrorBoundary>
        ) : (
          <SectionSkeleton text="No accuracy data" />
        )}
      </div>

      {/* A: Leaderboard */}
      {perfRes.isLoading ? (
        <SectionSkeleton text="Loading leaderboard…" />
      ) : perfRes.error ? (
        <SectionError message={`Leaderboard: ${perfRes.error.message}`} />
      ) : perfData?.length ? (
        <SectionErrorBoundary title="Accuracy Leaderboard">
          <AccuracyLeaderboard data={perfData} />
        </SectionErrorBoundary>
      ) : (
        <SectionSkeleton text="No performance data" />
      )}

      {/* B: Trend */}
      {trendRes.isLoading ? (
        <SectionSkeleton text="Loading trend…" />
      ) : trendRes.error ? (
        <SectionError message={`Trend: ${trendRes.error.message}`} />
      ) : (
        <SectionErrorBoundary title="Accuracy Trend">
          <AccuracyTrend
            data={filteredTrendData}
            hours={trendHours}
            onHoursChange={setTrendHours}
          />
        </SectionErrorBoundary>
      )}

      {/* C: Signal Quality */}
      {qualityRes.isLoading ? (
        <SectionSkeleton text="Loading signal quality…" />
      ) : qualityRes.error ? (
        <SectionError message={`Quality: ${qualityRes.error.message}`} />
      ) : (
        <SectionErrorBoundary title="Signal Quality">
          <SignalQualityTable
            data={qualityData ?? []}
            hours={qualityHours}
            onHoursChange={setQualityHours}
          />
        </SectionErrorBoundary>
      )}

      {/* D: Combiner Weights */}
      <SectionErrorBoundary title="Combiner Weights">
        <CombinerWeights />
      </SectionErrorBoundary>
    </div>
  )
}
