import type { TradingTrade } from '../../types/trading'
import { formatPrice, formatTime } from '../../utils/format'

function SideBadge({ side }: { side: string }) {
  const isLong = side === 'LONG'
  return (
    <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${isLong ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
      {side}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: 'bg-blue-900 text-blue-300',
    closed: 'bg-gray-800 text-gray-400',
    filled: 'bg-green-900 text-green-300',
  }
  return (
    <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${styles[status] ?? 'bg-gray-800 text-gray-400'}`}>
      {status}
    </span>
  )
}

export default function StatusTradesTable({ trades }: { trades: TradingTrade[] }) {
  const recent = trades.slice(0, 10)
  if (recent.length === 0) {
    return <p className="text-xs text-gray-500 italic py-2">No recent trades</p>
  }
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-gray-500 border-b border-gray-800">
          <th className="text-left py-1.5 pr-3 font-medium">Time</th>
          <th className="text-left py-1.5 pr-3 font-medium">Symbol</th>
          <th className="text-left py-1.5 pr-3 font-medium">Side</th>
          <th className="text-right py-1.5 pr-3 font-medium">Entry</th>
          <th className="text-right py-1.5 pr-3 font-medium">Exit</th>
          <th className="text-right py-1.5 pr-3 font-medium">Size</th>
          <th className="text-right py-1.5 pr-3 font-medium">Conf</th>
          <th className="text-right py-1.5 pr-3 font-medium">PnL</th>
          <th className="text-left py-1.5 font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        {recent.map((trade) => (
          <tr key={trade.id} className="border-b border-gray-800/50">
            <td className="py-1.5 pr-3 text-gray-500">{formatTime(trade.timestamp)}</td>
            <td className="py-1.5 pr-3 text-gray-200 font-medium">{trade.symbol.replace('/USDT', '')}</td>
            <td className="py-1.5 pr-3"><SideBadge side={trade.side} /></td>
            <td className="py-1.5 pr-3 text-right text-gray-300">{formatPrice(trade.entry_price)}</td>
            <td className="py-1.5 pr-3 text-right text-gray-400">
              {trade.exit_price != null ? formatPrice(trade.exit_price) : '—'}
            </td>
            <td className="py-1.5 pr-3 text-right text-gray-300">{trade.size}</td>
            <td className="py-1.5 pr-3 text-right text-gray-300">{(trade.confidence * 100).toFixed(0)}%</td>
            <td className={`py-1.5 pr-3 text-right font-medium ${
              trade.pnl_usdt == null ? 'text-gray-500' : trade.pnl_usdt >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {trade.pnl_usdt == null ? '—' : `${trade.pnl_usdt >= 0 ? '+' : ''}${formatPrice(trade.pnl_usdt)}`}
            </td>
            <td className="py-1.5"><StatusBadge status={trade.status} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
