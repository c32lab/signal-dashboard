import type { PerformanceSymbol } from '../../types'
import { accColor, pnlColor, pnlStr, stripUsdt } from './utils'

export default function SymbolSummary({
  symbol,
  bySymbol,
}: {
  symbol: string
  bySymbol: PerformanceSymbol[]
}) {
  const row = bySymbol.find(s => s.symbol === symbol || s.symbol.replace('/', '') === symbol.replace('/', ''))
  if (!row) return null
  return (
    <div className="bg-gray-900 border border-blue-800/50 rounded-xl p-4 flex flex-wrap gap-6 items-center">
      <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">
        {stripUsdt(symbol)} Performance
      </span>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">Total Trades</p>
        <p className="text-lg font-bold text-gray-200">{row.total}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">Correct</p>
        <p className="text-lg font-bold text-gray-200">{row.correct}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">Accuracy</p>
        <p className={`text-lg font-bold ${accColor(row.accuracy_pct)}`}>{row.accuracy_pct.toFixed(1)}%</p>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">Avg PnL</p>
        <p className={`text-lg font-bold font-mono ${pnlColor(row.avg_pnl_pct)}`}>
          {pnlStr(row.avg_pnl_pct)}
        </p>
      </div>
    </div>
  )
}
