import { CONFIG_COLORS } from './configColors'

function pct(v: number | undefined | null, decimals = 1): string {
  return `${(v ?? 0).toFixed(decimals)}%`
}

interface SummaryCardProps {
  config: string
  description: string
  win_rate_pct: number
  total_pnl_pct: number
  sharpe: number
  max_drawdown_pct: number
  total_trades: number
  isBest: boolean
}

export default function SummaryCard({ config, description, win_rate_pct, total_pnl_pct, sharpe, max_drawdown_pct, total_trades, isBest }: SummaryCardProps) {
  const color = CONFIG_COLORS[config] ?? '#9ca3af'
  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors rounded-xl p-4 space-y-3 relative">
      {isBest && (
        <span className="absolute top-2 right-2 text-amber-400 text-sm" title="Best PnL">⭐</span>
      )}
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <span className="font-semibold text-sm text-gray-100">{config}</span>
      </div>
      <p className="text-xs text-gray-400">{description}</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-gray-500 mb-0.5">Win Rate</div>
          <div className={`font-mono font-semibold ${win_rate_pct >= 50 ? 'text-green-400' : 'text-red-400'}`}>
            {pct(win_rate_pct)}
          </div>
        </div>
        <div>
          <div className="text-gray-500 mb-0.5">Total PnL</div>
          <div className={`font-mono font-semibold ${total_pnl_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {pct(total_pnl_pct)}
          </div>
        </div>
        <div>
          <div className="text-gray-500 mb-0.5">Sharpe</div>
          <div className="font-mono font-semibold text-gray-200">{(sharpe ?? 0).toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-0.5">Max DD</div>
          <div className="font-mono font-semibold text-red-400">{pct(max_drawdown_pct)}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-0.5">Trades</div>
          <div className="font-mono font-semibold text-gray-200">{total_trades}</div>
        </div>
      </div>
    </div>
  )
}
