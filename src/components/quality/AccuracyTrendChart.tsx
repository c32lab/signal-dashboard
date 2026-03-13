import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { useAccuracyTrend } from '../../hooks/useApi'
import type { AccuracyTrendPoint } from '../../types'
import { TREND_COLORS, TOOLTIP_STYLE, formatHour } from './utils'
import SectionSkeleton from './SectionSkeleton'
import SectionError from './SectionError'

export default function AccuracyTrendChart() {
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
                formatter={(value, name) => [
                  `${Number(value ?? 0).toFixed(1)}%`,
                  String(name ?? ''),
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
