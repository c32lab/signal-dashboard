import { useTradingSummary } from '../hooks/useApi'
import { formatPrice } from '../utils/format'
import StatusPositionsTable from './trading/StatusPositionsTable'
import StatusTradesTable from './trading/StatusTradesTable'

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
          <StatusPositionsTable positions={positions} />
        </div>
      </div>

      {/* Recent Trades */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
          Recent Trades
        </p>
        <div className="overflow-x-auto">
          <StatusTradesTable trades={recent_trades} />
        </div>
      </div>
    </div>
  )
}
