import type { TradingPosition } from '../../types/trading'
import { formatPrice } from '../../utils/format'

function SideBadge({ side }: { side: string }) {
  const isLong = side === 'LONG'
  return (
    <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${isLong ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
      {side}
    </span>
  )
}

export default function StatusPositionsTable({ positions }: { positions: TradingPosition[] }) {
  if (positions.length === 0) {
    return <p className="text-xs text-gray-500 italic py-2">No open positions</p>
  }
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-gray-500 border-b border-gray-800">
          <th className="text-left py-1.5 pr-3 font-medium">Symbol</th>
          <th className="text-left py-1.5 pr-3 font-medium">Side</th>
          <th className="text-right py-1.5 pr-3 font-medium">Size</th>
          <th className="text-right py-1.5 pr-3 font-medium">Entry Price</th>
          <th className="text-right py-1.5 pr-3 font-medium">Unrealized PnL</th>
          <th className="text-right py-1.5 font-medium">Leverage</th>
        </tr>
      </thead>
      <tbody>
        {positions.map((pos, i) => (
          <tr key={i} className="border-b border-gray-800/50">
            <td className="py-1.5 pr-3 text-gray-200 font-medium">{pos.symbol.replace('/USDT', '')}</td>
            <td className="py-1.5 pr-3"><SideBadge side={pos.side} /></td>
            <td className="py-1.5 pr-3 text-right text-gray-300">{pos.size}</td>
            <td className="py-1.5 pr-3 text-right text-gray-300">{formatPrice(pos.entry_price)}</td>
            <td className={`py-1.5 pr-3 text-right font-medium ${pos.unrealized_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {pos.unrealized_pnl >= 0 ? '+' : ''}{formatPrice(pos.unrealized_pnl)}
            </td>
            <td className="py-1.5 text-right text-gray-300">{pos.leverage}x</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
