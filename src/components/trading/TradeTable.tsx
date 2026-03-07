import { useState, useMemo } from 'react'
import type { TradingTrade } from '../../types/trading'
import TradeFilters from './TradeFilters'
import TradeRow from './TradeRow'
import TradePagination from './TradePagination'

const PAGE_SIZE = 15

interface TradeTableProps {
  trades: TradingTrade[]
  isLoading: boolean
}

export default function TradeTable({ trades, isLoading }: TradeTableProps) {
  const [filterSymbol, setFilterSymbol] = useState('ALL')
  const [filterSide, setFilterSide] = useState<'ALL' | 'LONG' | 'SHORT'>('ALL')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'open' | 'closed'>('ALL')
  const [page, setPage] = useState(0)

  const symbols = useMemo(() => {
    const set = new Set(trades.map(t => t.symbol))
    return Array.from(set).sort()
  }, [trades])

  const filteredTrades = useMemo(() => {
    let result = trades
    if (filterSymbol !== 'ALL') result = result.filter(t => t.symbol === filterSymbol)
    if (filterSide !== 'ALL') result = result.filter(t => t.side === filterSide)
    if (filterStatus !== 'ALL') result = result.filter(t => t.status === filterStatus)
    return result
  }, [trades, filterSymbol, filterSide, filterStatus])

  const totalPages = Math.max(1, Math.ceil(filteredTrades.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pagedTrades = filteredTrades.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)
  const rangeStart = filteredTrades.length === 0 ? 0 : safePage * PAGE_SIZE + 1
  const rangeEnd = Math.min((safePage + 1) * PAGE_SIZE, filteredTrades.length)

  const resetPage = () => setPage(0)

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Recent Trades</h2>

      <TradeFilters
        symbols={symbols}
        filterSymbol={filterSymbol}
        onFilterSymbol={(v) => { setFilterSymbol(v); resetPage() }}
        filterSide={filterSide}
        onFilterSide={(v) => { setFilterSide(v); resetPage() }}
        filterStatus={filterStatus}
        onFilterStatus={(v) => { setFilterStatus(v); resetPage() }}
      />

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs">
              <th className="text-left px-4 py-3 font-medium">Time</th>
              <th className="text-left px-4 py-3 font-medium">Symbol</th>
              <th className="text-left px-4 py-3 font-medium">Side</th>
              <th className="text-right px-4 py-3 font-medium">Entry Price</th>
              <th className="text-right px-4 py-3 font-medium">Close Price</th>
              <th className="text-right px-4 py-3 font-medium">PnL (USDT)</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-600 text-xs">
                  Loading…
                </td>
              </tr>
            ) : pagedTrades.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-600 text-xs">
                  No trades
                </td>
              </tr>
            ) : (
              pagedTrades.map((trade: TradingTrade) => (
                <TradeRow key={trade.id} trade={trade} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredTrades.length > PAGE_SIZE && (
        <TradePagination
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          total={filteredTrades.length}
          canPrev={safePage > 0}
          canNext={safePage < totalPages - 1}
          onPrev={() => setPage(p => Math.max(0, p - 1))}
          onNext={() => setPage(p => Math.min(totalPages - 1, p + 1))}
        />
      )}
    </div>
  )
}
