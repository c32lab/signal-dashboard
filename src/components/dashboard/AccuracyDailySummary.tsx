import useSWR from 'swr'
import { api } from '../../api'
import type { AccuracyTrendItem } from '../../types'

/**
 * Aggregates hourly accuracy trend data into daily buckets.
 * Returns { today, yesterday, avg7d } accuracy percentages.
 */
function computeDailyStats(trend: AccuracyTrendItem[]) {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterdayStart = todayStart - 86_400_000
  const week7dStart = todayStart - 7 * 86_400_000

  let todayTotal = 0, todayCorrect = 0
  let yesterdayTotal = 0, yesterdayCorrect = 0
  let weekTotal = 0, weekCorrect = 0

  for (const pt of trend) {
    const ts = new Date(pt.hour).getTime()
    if (ts >= todayStart) {
      todayTotal += pt.total
      todayCorrect += pt.correct
    } else if (ts >= yesterdayStart) {
      yesterdayTotal += pt.total
      yesterdayCorrect += pt.correct
    }
    if (ts >= week7dStart) {
      weekTotal += pt.total
      weekCorrect += pt.correct
    }
  }

  const pct = (c: number, t: number) => (t > 0 ? (c / t) * 100 : null)

  return {
    today: { pct: pct(todayCorrect, todayTotal), total: todayTotal },
    yesterday: { pct: pct(yesterdayCorrect, yesterdayTotal), total: yesterdayTotal },
    avg7d: { pct: pct(weekCorrect, weekTotal), total: weekTotal },
  }
}

function accuracyColor(pct: number | null): string {
  if (pct == null) return 'text-gray-500'
  if (pct >= 60) return 'text-green-400'
  if (pct >= 45) return 'text-yellow-400'
  return 'text-red-400'
}

function DeltaBadge({ current, baseline }: { current: number | null; baseline: number | null }) {
  if (current == null || baseline == null) return null
  const delta = current - baseline
  if (Math.abs(delta) < 0.5) return <span className="text-xs text-gray-500 ml-1">—</span>
  const up = delta > 0
  return (
    <span className={`text-xs ml-1 ${up ? 'text-green-400' : 'text-red-400'}`}>
      {up ? '▲' : '▼'}{Math.abs(delta).toFixed(1)}
    </span>
  )
}

export function AccuracyDailySummary() {
  const { data: trend, isLoading, error } = useSWR(
    'accuracy/trend/7d',
    () => api.accuracyTrend(168),
    { refreshInterval: 60_000 },
  )

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center text-gray-500 text-sm animate-pulse">
        Loading daily accuracy…
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-xl border border-red-800/50 p-4 text-sm text-red-300">
        Failed to load daily accuracy: {error.message ?? 'Unknown error'}
      </div>
    )
  }

  if (!trend || trend.length === 0) return null

  const stats = computeDailyStats(trend)

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <h2 className="text-sm font-semibold text-gray-200 mb-3">Daily Accuracy Summary</h2>
      <div className="grid grid-cols-3 gap-3">
        {/* Today */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Today</p>
          <p className={`text-2xl font-bold font-mono ${accuracyColor(stats.today.pct)}`}>
            {stats.today.pct != null ? `${stats.today.pct.toFixed(1)}%` : '—'}
          </p>
          <DeltaBadge current={stats.today.pct} baseline={stats.yesterday.pct} />
          <p className="text-xs text-gray-600 mt-0.5">{stats.today.total} signals</p>
        </div>

        {/* Yesterday */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Yesterday</p>
          <p className={`text-2xl font-bold font-mono ${accuracyColor(stats.yesterday.pct)}`}>
            {stats.yesterday.pct != null ? `${stats.yesterday.pct.toFixed(1)}%` : '—'}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">{stats.yesterday.total} signals</p>
        </div>

        {/* 7d Average */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">7d Avg</p>
          <p className={`text-2xl font-bold font-mono ${accuracyColor(stats.avg7d.pct)}`}>
            {stats.avg7d.pct != null ? `${stats.avg7d.pct.toFixed(1)}%` : '—'}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">{stats.avg7d.total} signals</p>
        </div>
      </div>
    </section>
  )
}
