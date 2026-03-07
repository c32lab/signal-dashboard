import type { TradingBalance } from '../../types/trading'

interface BalanceCardsProps {
  balance: TradingBalance | null | undefined
  isLoading: boolean
}

export default function BalanceCards({ balance, isLoading }: BalanceCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Balance */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-1">
        <p className="text-gray-500 text-xs">Total Balance (USDT)</p>
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
        <p className="text-gray-500 text-xs">Unrealized PnL</p>
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
        <p className="text-gray-500 text-xs">Available (USDT)</p>
        {isLoading ? (
          <div className="h-7 bg-gray-800 rounded animate-pulse w-32" />
        ) : (
          <p className="text-gray-300 text-xl font-bold">
            ${(balance?.available ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        )}
      </div>
    </div>
  )
}
