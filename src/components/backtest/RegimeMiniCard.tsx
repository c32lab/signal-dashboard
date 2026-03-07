import type { BacktestSummary } from '../../types/backtest'

function pct(v: number | undefined | null, decimals = 1): string {
  return `${(v ?? 0).toFixed(decimals)}%`
}

const REGIME_LABEL_COLORS: Record<string, string> = {
  trending: 'text-green-400',
  ranging: 'text-yellow-400',
  volatile: 'text-red-400',
}

interface RegimeMiniCardProps {
  regime: string
  summaries: BacktestSummary[]
}

export default function RegimeMiniCard({ regime, summaries }: RegimeMiniCardProps) {
  const totalTrades = summaries.reduce((sum, s) => sum + s.total_trades, 0)
  const avgWinRate = summaries.length > 0
    ? summaries.reduce((sum, s) => sum + s.win_rate_pct, 0) / summaries.length
    : 0
  const avgPnl = summaries.length > 0
    ? summaries.reduce((sum, s) => sum + s.total_pnl_pct, 0) / summaries.length
    : 0

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 space-y-2">
      <span className={`text-sm font-semibold uppercase ${REGIME_LABEL_COLORS[regime] ?? 'text-gray-300'}`}>
        {regime}
      </span>
      {totalTrades === 0 ? (
        <p className="text-xs text-gray-500">No data</p>
      ) : (
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <div className="text-gray-500 mb-0.5">Trades</div>
            <div className="font-mono font-semibold text-gray-200">{totalTrades}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-0.5">Win Rate</div>
            <div className={`font-mono font-semibold ${avgWinRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
              {pct(avgWinRate)}
            </div>
          </div>
          <div>
            <div className="text-gray-500 mb-0.5">PnL%</div>
            <div className={`font-mono font-semibold ${avgPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {pct(avgPnl)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
