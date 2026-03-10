import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts'
import { useAccuracyTrendWeekly } from '../../hooks/useApi'
import type { AccuracyTrendItem } from '../../types'
import { TOOLTIP_STYLE } from './utils'

interface DailyRow {
  day: string
  thisWeek: number | null
  lastWeek: number | null
}

function aggregateDailyAccuracy(items: AccuracyTrendItem[], rangeStart: number, rangeEnd: number): Map<string, { total: number; correct: number }> {
  const byDay = new Map<string, { total: number; correct: number }>()
  for (const item of items) {
    const ts = new Date(item.hour).getTime()
    if (ts < rangeStart || ts >= rangeEnd) continue
    // Day label: Mon, Tue, etc.
    const d = new Date(item.hour)
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Asia/Shanghai' })
    const dayKey = `${d.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' })}_${dayName}`
    const prev = byDay.get(dayKey) ?? { total: 0, correct: 0 }
    prev.total += item.total
    prev.correct += item.correct
    byDay.set(dayKey, prev)
  }
  return byDay
}

export function AccuracyWeeklyTrend() {
  const { data, isLoading, error } = useAccuracyTrendWeekly()

  const [now] = useState(() => Date.now())

  const chartData = useMemo<DailyRow[]>(() => {
    const items = (data ?? []) as AccuracyTrendItem[]
    if (items.length === 0) return []
    const oneWeekMs = 7 * 24 * 3600 * 1000

    const thisWeekMap = aggregateDailyAccuracy(items, now - oneWeekMs, now)
    const lastWeekMap = aggregateDailyAccuracy(items, now - 2 * oneWeekMs, now - oneWeekMs)

    // Build 7-day rows starting from 6 days ago to today
    const rows: DailyRow[] = []
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86_400_000)
      const utc8 = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }))
      const dayName = dayNames[utc8.getDay()]
      const dateStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' })
      const dayKey = `${dateStr}_${dayName}`

      // Find matching last-week day (same weekday)
      const lastWeekDate = new Date(d.getTime() - oneWeekMs)
      const lwDateStr = lastWeekDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' })
      const lwDayName = dayNames[new Date(lastWeekDate.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })).getDay()]
      const lwKey = `${lwDateStr}_${lwDayName}`

      const tw = thisWeekMap.get(dayKey)
      const lw = lastWeekMap.get(lwKey)

      rows.push({
        day: dayName,
        thisWeek: tw && tw.total > 0 ? (tw.correct / tw.total) * 100 : null,
        lastWeek: lw && lw.total > 0 ? (lw.correct / lw.total) * 100 : null,
      })
    }
    return rows
  }, [data, now])

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center text-gray-500 text-sm animate-pulse">
        Loading weekly trend…
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-xl border border-red-800/50 p-4 text-sm text-red-300">
        Failed to load weekly trend
      </div>
    )
  }

  if (chartData.length === 0) return null

  // Determine overall trend
  const twAvg = chartData.reduce((s, r) => s + (r.thisWeek ?? 0), 0) / chartData.filter((r) => r.thisWeek != null).length || 0
  const lwAvg = chartData.reduce((s, r) => s + (r.lastWeek ?? 0), 0) / chartData.filter((r) => r.lastWeek != null).length || 0
  const trendDelta = twAvg - lwAvg
  const trendLabel = trendDelta > 1 ? 'Improving' : trendDelta < -1 ? 'Declining' : 'Stable'
  const trendColor = trendDelta > 1 ? 'text-green-400' : trendDelta < -1 ? 'text-red-400' : 'text-gray-400'

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-200">Weekly Accuracy Trend</h2>
        <span className={`text-xs font-medium ${trendColor}`}>
          {trendLabel} ({trendDelta > 0 ? '+' : ''}{trendDelta.toFixed(1)}pp)
        </span>
      </div>

      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={2}>
            <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} width={36} tickFormatter={(v: number) => `${v}%`} />
            <Tooltip
              {...TOOLTIP_STYLE}
              formatter={(value: unknown) => [`${Number(value ?? 0).toFixed(1)}%`]}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: '#9ca3af' }}
            />
            <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />
            <Bar dataKey="thisWeek" name="This Week" fill="#60a5fa" radius={[3, 3, 0, 0]} />
            <Bar dataKey="lastWeek" name="Last Week" fill="#4b5563" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
