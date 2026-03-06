import { useTradingSummary } from '../hooks/useApi'
import { formatDateTime, formatPrice } from '../utils/format'
import type { TradingPosition, TradingTrade } from '../types/trading'

function SideBadge({ side }: { side: 'LONG' | 'SHORT' }) {
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-semibold ${
        side === 'LONG' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
      }`}
    >
      {side}
    </span>
  )
}

function PnlText({ value }: { value: number | null }) {
  if (value === null) return <span className="text-gray-500">—</span>
  const color = value >= 0 ? 'text-green-400' : 'text-red-400'
  const prefix = value >= 0 ? '+' : ''
  return <span className={color}>{prefix}{value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
}

function PositionCard({ pos }: { pos: TradingPosition }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-gray-100 font-semibold">{pos.symbol}</span>
        <SideBadge side={pos.side} />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <span className="text-gray-500">Entry Price</span>
        <span className="text-gray-200 text-right">{formatPrice(pos.entry_price, pos.symbol)}</span>
        <span className="text-gray-500">Size</span>
        <span className="text-gray-200 text-right">{pos.size}</span>
        <span className="text-gray-500">Unrealized PnL</span>
        <span className="text-right"><PnlText value={pos.unrealized_pnl} /></span>
        {pos.leverage != null && (
          <>
            <span className="text-gray-500">Leverage</span>
            <span className="text-gray-200 text-right">{pos.leverage}x</span>
          </>
        )}
      </div>
    </div>
  )
}

export default function TradingDashboard() {
  const { data, error, isLoading } = useTradingSummary()

  if (error) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <h1 className="text-lg font-bold text-gray-100">交易记录</h1>
        <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-red-400 text-sm">
          加载失败: {error instanceof Error ? error.message : '未知错误'}
        </div>
      </div>
    )
  }

  const balance = data?.balance
  const positions = data?.positions ?? []
  const trades = [...(data?.recent_trades ?? [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-lg font-bold text-gray-100">交易记录</h1>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Balance */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-1">
          <p className="text-gray-500 text-xs">总余额 (USDT)</p>
          {isLoading ? (
            <div className="h-7 bg-gray-800 rounded animate-pulse w-32" />
          ) : (
            <p className="text-gray-100 text-xl font-bold">
              ${(balance?.total_usdt ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
        </div>

        {/* Unrealized PnL */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-1">
          <p className="text-gray-500 text-xs">未实现盈亏</p>
          {isLoading ? (
            <div className="h-7 bg-gray-800 rounded animate-pulse w-24" />
          ) : (
            <p className={`text-xl font-bold ${(balance?.unrealized_pnl ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {(balance?.unrealized_pnl ?? 0) >= 0 ? '+' : ''}
              {(balance?.unrealized_pnl ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
        </div>

        {/* Available */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-1">
          <p className="text-gray-500 text-xs">可用余额 (USDT)</p>
          {isLoading ? (
            <div className="h-7 bg-gray-800 rounded animate-pulse w-32" />
          ) : (
            <p className="text-gray-300 text-xl font-bold">
              ${(balance?.available ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
        </div>
      </div>

      {/* Open Positions */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">持仓</h2>
        {isLoading ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="h-4 bg-gray-800 rounded animate-pulse w-48" />
          </div>
        ) : positions.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center text-gray-500 text-sm">
            No open positions
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {positions.map((pos: TradingPosition) => (
              <PositionCard key={pos.symbol} pos={pos} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Trades */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">最近交易</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs">
                <th className="text-left px-4 py-3 font-medium">时间</th>
                <th className="text-left px-4 py-3 font-medium">Symbol</th>
                <th className="text-left px-4 py-3 font-medium">方向</th>
                <th className="text-right px-4 py-3 font-medium">开仓价</th>
                <th className="text-right px-4 py-3 font-medium">平仓价</th>
                <th className="text-right px-4 py-3 font-medium">PnL (USDT)</th>
                <th className="text-right px-4 py-3 font-medium">置信度</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-600 text-xs">
                    加载中…
                  </td>
                </tr>
              ) : trades.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-600 text-xs">
                    暂无交易记录
                  </td>
                </tr>
              ) : (
                trades.map((trade: TradingTrade) => (
                  <tr key={trade.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{formatDateTime(trade.timestamp)}</td>
                    <td className="px-4 py-3 text-gray-200 font-medium">{trade.symbol}</td>
                    <td className="px-4 py-3"><SideBadge side={trade.side} /></td>
                    <td className="px-4 py-3 text-right text-gray-200">{formatPrice(trade.entry_price, trade.symbol)}</td>
                    <td className="px-4 py-3 text-right text-gray-200">
                      {trade.exit_price !== null ? formatPrice(trade.exit_price, trade.symbol) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right"><PnlText value={trade.pnl_usdt} /></td>
                    <td className="px-4 py-3 text-right text-gray-300">{(trade.confidence * 100).toFixed(0)}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
