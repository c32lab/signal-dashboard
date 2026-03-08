import { useMemo } from 'react'
import { useTradingSummary } from '../hooks/useApi'
import { BalanceCards, PnlCurve, TradeStats, PositionsList, TradeTable } from '../components/trading'
import SectionErrorBoundary from '../components/SectionErrorBoundary'

export default function TradingDashboard() {
  const { data, error, isLoading } = useTradingSummary()

  const balance = data?.balance
  const positions = data?.positions ?? []
  const trades = useMemo(() =>
    [...(data?.recent_trades ?? [])].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ), [data?.recent_trades])

  // ── PnL curve data ──
  const pnlData = useMemo(() => {
    const closed = trades
      .filter(t => t.status === 'closed' && t.pnl_usdt !== null)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    return closed.reduce<Array<{ time: string; cumPnl: number }>>((acc, t) => {
      const prev = acc.length > 0 ? acc[acc.length - 1].cumPnl : 0
      acc.push({ time: t.timestamp, cumPnl: prev + (t.pnl_usdt ?? 0) })
      return acc
    }, [])
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

  if (error) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <h1 className="text-lg font-bold text-gray-100">Trading</h1>
        <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-red-400 text-sm">
          Failed to load: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-lg font-bold text-gray-100">Trading</h1>

      <SectionErrorBoundary title="Balance Cards">
        <BalanceCards balance={balance} isLoading={isLoading} />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="PnL Curve">
        {isLoading ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2 animate-pulse">
            <div className="h-4 bg-gray-800 rounded w-40" />
            <div className="h-48 bg-gray-800 rounded" />
          </div>
        ) : (
          <PnlCurve data={pnlData} />
        )}
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Trade Stats">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-gray-800 rounded w-32" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
                  <div className="h-3 bg-gray-800 rounded w-16" />
                  <div className="h-6 bg-gray-800 rounded w-12" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <TradeStats
            totalCount={trades.length}
            openCount={stats.openTrades.length}
            closedCount={stats.closedTrades.length}
            winRate={stats.winRate}
            longCount={stats.longCount}
            shortCount={stats.shortCount}
          />
        )}
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Open Positions">
        <PositionsList positions={positions} isLoading={isLoading} />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Trade Table">
        <TradeTable trades={trades} isLoading={isLoading} />
      </SectionErrorBoundary>
    </div>
  )
}
