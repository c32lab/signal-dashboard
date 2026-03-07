import { CONFIG_COLORS } from './configColors'
import type { BacktestSummary } from '../../types/backtest'

interface DirectionBreakdownProps {
  summary: BacktestSummary[]
}

function pct(v: number, decimals = 1): string {
  return `${v.toFixed(decimals)}%`
}

function winRate(wins: number | undefined, count: number | undefined): number | null {
  if (!count || count === 0) return null
  if (wins == null) return null
  return (wins / count) * 100
}

function DirectionBreakdown({ summary }: DirectionBreakdownProps) {
  const items = summary.filter(
    (s) => (s.long_count ?? 0) > 0 || (s.short_count ?? 0) > 0,
  )

  if (items.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-300">LONG / SHORT Breakdown</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((s) => {
          const color = CONFIG_COLORS[s.config] ?? '#9ca3af'
          const longCount = s.long_count ?? 0
          const shortCount = s.short_count ?? 0
          const total = longCount + shortCount
          const longRatio = total > 0 ? (longCount / total) * 100 : 50
          const longWR = winRate(s.long_wins, s.long_count)
          const shortWR = winRate(s.short_wins, s.short_count)
          const longPnl = s.long_pnl_pct ?? 0
          const shortPnl = s.short_pnl_pct ?? 0

          return (
            <div
              key={s.config}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3"
            >
              {/* Header */}
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-medium text-gray-200">{s.config}</span>
              </div>

              {/* LONG row */}
              <div className="rounded-lg bg-green-950/30 border border-green-900/40 px-3 py-2 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-green-400">LONG</span>
                  <span className="text-gray-400">×{longCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  {longWR !== null ? (
                    <span className={longWR >= 50 ? 'text-green-400' : 'text-red-400'}>
                      WR {pct(longWR)}
                    </span>
                  ) : (
                    <span className="text-gray-500">WR —</span>
                  )}
                  <span className={longPnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {longPnl >= 0 ? '+' : ''}{pct(longPnl)}
                  </span>
                </div>
              </div>

              {/* SHORT row */}
              <div className="rounded-lg bg-red-950/30 border border-red-900/40 px-3 py-2 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-red-400">SHORT</span>
                  <span className="text-gray-400">×{shortCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  {shortWR !== null ? (
                    <span className={shortWR >= 50 ? 'text-green-400' : 'text-red-400'}>
                      WR {pct(shortWR)}
                    </span>
                  ) : (
                    <span className="text-gray-500">WR —</span>
                  )}
                  <span className={shortPnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {shortPnl >= 0 ? '+' : ''}{pct(shortPnl)}
                  </span>
                </div>
              </div>

              {/* Ratio bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{pct(longRatio, 0)} Long</span>
                  <span>{pct(100 - longRatio, 0)} Short</span>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden bg-gray-800">
                  <div
                    className="bg-green-500/70 transition-all"
                    style={{ width: `${longRatio}%` }}
                  />
                  <div
                    className="bg-red-500/70 transition-all"
                    style={{ width: `${100 - longRatio}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DirectionBreakdown
