import { useState, useMemo } from 'react'
import type { TradingTrade } from '../../types/trading'
import { formatDateTime, formatPrice } from '../../utils/format'
import { SideBadge, StatusBadge, PnlText } from './TradingBadges'

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

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">最近交易</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterSymbol}
          onChange={e => { setFilterSymbol(e.target.value); setPage(0) }}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-gray-500"
        >
          <option value="ALL">全部 Symbol</option>
          {symbols.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filterSide}
          onChange={e => { setFilterSide(e.target.value as 'ALL' | 'LONG' | 'SHORT'); setPage(0) }}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-gray-500"
        >
          <option value="ALL">全部方向</option>
          <option value="LONG">LONG</option>
          <option value="SHORT">SHORT</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value as 'ALL' | 'open' | 'closed'); setPage(0) }}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-gray-500"
        >
          <option value="ALL">全部状态</option>
          <option value="open">开仓中</option>
          <option value="closed">已平仓</option>
        </select>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs">
              <th className="text-left px-4 py-3 font-medium">时间</th>
              <th className="text-left px-4 py-3 font-medium">Symbol</th>
              <th className="text-left px-4 py-3 font-medium">方向</th>
              <th className="text-right px-4 py-3 font-medium">开仓价</th>
              <th className="text-right px-4 py-3 font-medium">平仓价</th>
              <th className="text-right px-4 py-3 font-medium">PnL (USDT)</th>
              <th className="text-center px-4 py-3 font-medium">状态</th>
              <th className="text-right px-4 py-3 font-medium">置信度</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-600 text-xs">
                  加载中…
                </td>
              </tr>
            ) : pagedTrades.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-600 text-xs">
                  暂无交易记录
                </td>
              </tr>
            ) : (
              pagedTrades.map((trade: TradingTrade) => (
                <tr key={trade.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredTrades.length > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{rangeStart}-{rangeEnd} of {filteredTrades.length}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="px-3 py-1 rounded bg-gray-800 border border-gray-700 disabled:opacity-40 hover:bg-gray-700 transition-colors"
            >
              上一页
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={safePage >= totalPages - 1}
              className="px-3 py-1 rounded bg-gray-800 border border-gray-700 disabled:opacity-40 hover:bg-gray-700 transition-colors"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
