import { mockLargeOrders } from './mockData'
import { useOrderbookLargeOrders } from '../../hooks/useApi'
import { apiLargeOrderToDisplay } from './types'
import type { LargeOrder } from './types'

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value}`
}

function formatPrice(value: number): string {
  return value >= 1000
    ? `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    : `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
}

function rowClass(sigma: number): string {
  if (sigma >= 4) return 'bg-red-900/20 border-l-2 border-red-800'
  if (sigma >= 2) return 'bg-yellow-900/20 border-l-2 border-yellow-800'
  return ''
}

function SideBadge({ side }: { side: LargeOrder['side'] }) {
  const cls = side === 'buy'
    ? 'bg-green-900/40 text-green-400 border-green-800/50'
    : 'bg-red-900/40 text-red-400 border-red-800/50'
  return (
    <span className={`inline-block px-1.5 py-0.5 text-xs font-medium rounded border ${cls}`}>
      {side.toUpperCase()}
    </span>
  )
}

export default function LargeOrderAlerts() {
  const { data: apiData, error } = useOrderbookLargeOrders('BTCUSDT')
  const isLive = apiData && !error && Array.isArray(apiData.large_orders)

  let orders: LargeOrder[]
  if (isLive) {
    orders = apiData.large_orders
      .map((item) => apiLargeOrderToDisplay(item, apiData.symbol))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
  } else {
    orders = [...mockLargeOrders]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-gray-200">Large Order Alerts</h3>
        {isLive ? (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-900/40 text-green-400 border border-green-800/50">
            LIVE
          </span>
        ) : (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-900/40 text-yellow-500 border border-yellow-800/50">
            MOCK
          </span>
        )}
      </div>
      {orders.length === 0 ? (
        <p className="text-gray-600 text-xs py-4">No large orders detected</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-gray-700/50">
                <th className="text-left py-2 pr-3 font-medium">Time</th>
                <th className="text-left py-2 pr-3 font-medium">Symbol</th>
                <th className="text-left py-2 pr-3 font-medium">Side</th>
                <th className="text-right py-2 pr-3 font-medium">Size</th>
                <th className="text-right py-2 pr-3 font-medium">σ Level</th>
                <th className="text-right py-2 font-medium">Price</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className={`${rowClass(o.sigma)} border-b border-gray-800/50`}>
                  <td className="py-2 pr-3 text-gray-400 font-mono">{formatTime(o.timestamp)}</td>
                  <td className="py-2 pr-3 text-gray-200 font-medium">{o.symbol}</td>
                  <td className="py-2 pr-3"><SideBadge side={o.side} /></td>
                  <td className="py-2 pr-3 text-right text-gray-200 font-mono">{formatUsd(o.size_usd)}</td>
                  <td className="py-2 pr-3 text-right text-gray-200 font-mono">{o.sigma.toFixed(1)}σ</td>
                  <td className="py-2 text-right text-gray-300 font-mono">{formatPrice(o.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
