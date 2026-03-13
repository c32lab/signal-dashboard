import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { AccuracyTrendItem } from '../../types'
import { SYMBOL_COLORS, TOOLTIP_STYLE, formatHour } from './utils'

export default function AccuracyTrend({
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
                formatter={(value, name) => [`${Number(value ?? 0).toFixed(1)}%`, String(name ?? '')]}
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
