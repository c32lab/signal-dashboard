import type { TradingTrade } from '../../types/trading'
import { formatDateTime, formatPrice } from '../../utils/format'
import { SideBadge, StatusBadge, PnlText } from './TradingBadges'

interface TradeRowProps {
  trade: TradingTrade
}

export default function TradeRow({ trade }: TradeRowProps) {
  return (
    <tr className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{formatDateTime(trade.timestamp)}</td>
      <td className="px-4 py-3 text-gray-200 font-medium">{trade.symbol}</td>
      <td className="px-4 py-3"><SideBadge side={trade.side} /></td>
      <td className="px-4 py-3 text-right text-gray-200">{formatPrice(trade.entry_price, trade.symbol)}</td>
      <td className="px-4 py-3 text-right text-gray-200">
        {trade.exit_price !== null ? formatPrice(trade.exit_price, trade.symbol) : '—'}
      </td>
      <td className="px-4 py-3 text-right"><PnlText value={trade.pnl_usdt} /></td>
      <td className="px-4 py-3 text-center"><StatusBadge status={trade.status} /></td>
      <td className="px-4 py-3 text-right text-gray-300">{(trade.confidence * 100).toFixed(0)}%</td>
    </tr>
  )
}
