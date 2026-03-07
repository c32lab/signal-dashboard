import { useState, useMemo } from 'react'
import { useTradingSummary } from '../hooks/useApi'
import { formatDateTime, formatPrice } from '../utils/format'
import { formatChartTime } from '../utils/format'
import type { TradingPosition, TradingTrade } from '../types/trading'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts'

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

function StatusBadge({ status }: { status: 'open' | 'closed' }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
      status === 'open' ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-400'
    }`}>
      {status === 'open' ? '开仓中' : '已平仓'}
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

const PAGE_SIZE = 15

export default function TradingDashboard() {
  const { data, error, isLoading } = useTradingSummary()

  // Filter state
  const [filterSymbol, setFilterSymbol] = useState('ALL')
  const [filterSide, setFilterSide] = useState<'ALL' | 'LONG' | 'SHORT'>('ALL')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'open' | 'closed'>('ALL')
  const [page, setPage] = useState(0)

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

  // ── PnL curve data ──
  const pnlData = useMemo(() => {
    const closed = trades
      .filter(t => t.status === 'closed' && t.pnl_usdt !== null)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    let cum = 0
    return closed.map(t => {
      cum += t.pnl_usdt ?? 0
      return { time: t.timestamp, cumPnl: cum }
    })
  }, [trades])

  // ── Trade statistics ──
  const stats = useMemo(() => {
    const closedTrades = trades.filter(t => t.status === 'closed')
    const openTrades = trades.filter(t => t.status === 'open')
    const winTrades = closedTrades.filter(t => (t.pnl_usdt ?? 0) > 0)
    const winRate = closedTrades.length === 0 ? 0 : (winTrades.length / closedTrades.length) * 100
    const longCount = trades.filter(t => t.side === 'LONG').length
    const shortCount = trades.filter(t => t.side === 'SHORT').length
    return { closedTrades, openTrades, winTrades, winRate, longCount, shortCount }
  }, [trades])

  // ── Unique symbols for filter ──
  const symbols = useMemo(() => {
    const set = new Set(trades.map(t => t.symbol))
    return Array.from(set).sort()
  }, [trades])

  // ── Filtered + paginated trades ──
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

  const sideDistData = [
    { name: 'LONG', count: stats.longCount },
    { name: 'SHORT', count: stats.shortCount },
  ]

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

      {/* PnL Curve */}
      {pnlData.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">累计 PnL 曲线</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={pnlData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="time"
                tickFormatter={(v: string) => formatChartTime(v)}
                stroke="#6b7280"
                tick={{ fontSize: 11 }}
              />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                labelFormatter={(label: unknown) => formatChartTime(String(label ?? ''))}
                formatter={(value: unknown) => [`$${Number(value ?? 0).toFixed(2)}`, 'Cumulative PnL']}
              />
              <Area
                type="monotone"
                dataKey="cumPnl"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.15}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Trade Statistics */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">交易统计</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-500 text-xs">总交易数</p>
            <p className="text-gray-100 text-xl font-bold">{trades.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-500 text-xs">开仓中</p>
            <p className="text-gray-100 text-xl font-bold">{stats.openTrades.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-500 text-xs">已平仓</p>
            <p className="text-gray-100 text-xl font-bold">{stats.closedTrades.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-500 text-xs">胜率</p>
            <p className={`text-xl font-bold ${stats.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.winRate.toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-500 text-xs">LONG 占比</p>
            <p className="text-green-400 text-xl font-bold">
              {trades.length === 0 ? '0.0' : (stats.longCount / trades.length * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-500 text-xs">SHORT 占比</p>
            <p className="text-red-400 text-xl font-bold">
              {trades.length === 0 ? '0.0' : (stats.shortCount / trades.length * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* LONG/SHORT Distribution Bar Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-500 text-xs mb-2">LONG / SHORT 分布</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={sideDistData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 50 }}>
              <XAxis type="number" stroke="#6b7280" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" stroke="#6b7280" tick={{ fontSize: 11 }} />
              <Bar dataKey="count" barSize={20}>
                {sideDistData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.name === 'LONG' ? '#22c55e' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
          <table className="w-full text-sm">
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
    </div>
  )
}
