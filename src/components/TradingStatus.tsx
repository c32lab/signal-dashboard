import { useTradingSummary } from '../hooks/useApi'
import { formatPrice, formatTime } from '../utils/format'
import type { TradingPosition, TradingTrade } from '../types/trading'

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

function PositionsTable({ positions }: { positions: TradingPosition[] }) {
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

function TradesTable({ trades }: { trades: TradingTrade[] }) {
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

export default function TradingStatus() {
  const { data, error, isLoading } = useTradingSummary()

  if (isLoading) {
    return <div className="p-6 text-gray-400 text-sm">Loading trading status…</div>
  }

  if (error || !data) {
    return (
      <div className="p-6 text-red-400 text-sm">
        Failed to load trading status: {error?.message ?? 'No data'}
      </div>
    )
  }

  const { balance, positions, recent_trades } = data

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-gray-100 uppercase tracking-widest">Trading Status</h2>
        <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-900 text-yellow-300">TESTNET</span>
      </div>

      {/* Balance Cards */}
      {balance ? (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-950 rounded-lg p-4 border border-gray-800">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total Balance</p>
            <p className="text-xl font-bold text-white">{formatPrice(balance.total_usdt)}</p>
          </div>
          <div className="bg-gray-950 rounded-lg p-4 border border-gray-800">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Unrealized PnL</p>
            <p className={`text-xl font-bold ${balance.unrealized_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {balance.unrealized_pnl >= 0 ? '+' : ''}{formatPrice(balance.unrealized_pnl)}
            </p>
          </div>
          <div className="bg-gray-950 rounded-lg p-4 border border-gray-800">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Available</p>
            <p className="text-xl font-bold text-white">{formatPrice(balance.available)}</p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500 italic">Balance unavailable (API key not configured)</p>
      )}

      {/* Open Positions */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
          Open Positions ({positions.length})
        </p>
        <div className="overflow-x-auto">
          <PositionsTable positions={positions} />
        </div>
      </div>

      {/* Recent Trades */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
          Recent Trades
        </p>
        <div className="overflow-x-auto">
          <TradesTable trades={recent_trades} />
        </div>
      </div>
    </div>
  )
}
