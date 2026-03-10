import { useMemo, useState } from 'react'
import { useAccuracyTrendWeekly } from '../../hooks/useApi'
import type { AccuracyTrendItem } from '../../types'

interface WeekStats {
  trades: number
  correct: number
  winRate: number
}

function computeWeekStats(items: AccuracyTrendItem[]): WeekStats {
  const trades = items.reduce((sum, d) => sum + d.total, 0)
  const correct = items.reduce((sum, d) => sum + d.correct, 0)
  return {
    trades,
    correct,
    winRate: trades > 0 ? (correct / trades) * 100 : 0,
  }
}

function changeIndicator(current: number, previous: number): { text: string; color: string } {
  if (previous === 0) return { text: 'N/A', color: 'text-gray-500' }
  const pctChange = ((current - previous) / previous) * 100
  if (Math.abs(pctChange) < 0.5) return { text: '0%', color: 'text-gray-400' }
  return {
    text: `${pctChange > 0 ? '+' : ''}${pctChange.toFixed(1)}%`,
    color: pctChange > 0 ? 'text-green-400' : 'text-red-400',
  }
}

export default function AccuracyWeekComparison() {
  const { data, isLoading, error } = useAccuracyTrendWeekly()

  const [now] = useState(() => Date.now())

  const { thisWeek, lastWeek } = useMemo(() => {
    const items = (data ?? []) as AccuracyTrendItem[]
    const oneWeekMs = 7 * 24 * 3600 * 1000

    const thisWeekItems = items.filter((d) => {
      const t = new Date(d.hour).getTime()
      return t >= now - oneWeekMs
    })
    const lastWeekItems = items.filter((d) => {
      const t = new Date(d.hour).getTime()
      return t >= now - 2 * oneWeekMs && t < now - oneWeekMs
    })

    return {
      thisWeek: computeWeekStats(thisWeekItems),
      lastWeek: computeWeekStats(lastWeekItems),
    }
  }, [data, now])

  if (isLoading) return <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center text-gray-500 text-sm animate-pulse">Loading week comparison…</div>
  if (error) return <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-sm text-red-400">Failed to load weekly data</div>

  const winRateChange = changeIndicator(thisWeek.winRate, lastWeek.winRate)
  const tradeCountChange = changeIndicator(thisWeek.trades, lastWeek.trades)

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
      <h2 className="text-sm font-semibold text-gray-200">Week-over-Week Comparison</h2>
      <div className="grid grid-cols-2 gap-3">
        {/* This Week */}
        <div className="bg-gray-800 rounded-lg p-3 space-y-2">
          <div className="text-xs font-medium text-blue-400">This Week</div>
          <div>
            <div className="text-xs text-gray-500">Win Rate</div>
            <div className="text-lg font-bold text-gray-200">{thisWeek.winRate.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Trades</div>
            <div className="text-lg font-bold text-gray-200">{thisWeek.trades}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Correct</div>
            <div className="text-lg font-bold text-green-400">{thisWeek.correct}</div>
          </div>
        </div>

        {/* Last Week */}
        <div className="bg-gray-800 rounded-lg p-3 space-y-2">
          <div className="text-xs font-medium text-gray-500">Last Week</div>
          <div>
            <div className="text-xs text-gray-500">Win Rate</div>
            <div className="text-lg font-bold text-gray-400">{lastWeek.winRate.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Trades</div>
            <div className="text-lg font-bold text-gray-400">{lastWeek.trades}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Correct</div>
            <div className="text-lg font-bold text-gray-400">{lastWeek.correct}</div>
          </div>
        </div>
      </div>

      {/* Change indicators */}
      <div className="flex items-center gap-4 text-xs">
        <span className="text-gray-500">Changes:</span>
        <span>
          Win Rate <span className={winRateChange.color} data-testid="winrate-change">{winRateChange.text}</span>
        </span>
        <span>
          Trades <span className={tradeCountChange.color} data-testid="trades-change">{tradeCountChange.text}</span>
        </span>
      </div>
    </section>
  )
}
