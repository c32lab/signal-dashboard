import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { useAccuracyTrend } from '../../hooks/useApi'
import type { AccuracyTrendPoint } from '../../types'
import { TREND_COLORS, TOOLTIP_STYLE, formatHour } from '../quality/utils'
import SectionSkeleton from '../quality/SectionSkeleton'
import SectionError from '../quality/SectionError'

export function AccuracyMiniTrend() {
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
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-2 sm:p-4">
      <h2 className="text-sm font-semibold text-gray-200 mb-3">Accuracy Trend (24h)</h2>
      {pivoted.length === 0 ? (
        <p className="text-center text-gray-600 py-8 text-sm">No trend data</p>
      ) : (
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pivoted} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <XAxis
                dataKey="hour"
                tick={{ fill: '#6b7280', fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fill: '#6b7280', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip
                formatter={(value: number | undefined, name?: string) => [
                  `${Number(value ?? 0).toFixed(1)}%`,
                  name ?? '',
                ]}
                {...TOOLTIP_STYLE}
              />
              <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="4 4" />
              {symbols.map((sym, i) => (
                <Line
                  key={sym}
                  type="monotone"
                  dataKey={sym}
                  stroke={TREND_COLORS[i % TREND_COLORS.length]}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3 }}
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
