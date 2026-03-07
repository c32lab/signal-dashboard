import type { TradingPosition } from '../../types/trading'
import { formatPrice } from '../../utils/format'
import { SideBadge, PnlText } from './TradingBadges'

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

interface PositionsListProps {
  positions: TradingPosition[]
  isLoading: boolean
}

export default function PositionsList({ positions, isLoading }: PositionsListProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Positions</h2>
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
  )
}
