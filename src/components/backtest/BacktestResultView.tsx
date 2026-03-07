import { useState, useMemo } from 'react'
import type { BacktestResult, SymbolBacktest } from '../../types/backtest'
import { formatDateTime, formatDate } from '../../utils/format'
import SectionErrorBoundary from '../SectionErrorBoundary'
import { ConfigWeightsDetail, ParamCompareTable, RegimeFilter, RegimeMiniCard, SummaryCard, PnlCompareChart, WinRateCompareChart } from './'
import type { RegimeFilterValue } from './'
import TradeDistributionChart from './TradeDistributionChart'
import SymbolRow from './SymbolRow'
import { bestConfigName, daysBetween } from './backtestUtils'

const PAGE_SIZE = 20

interface BacktestResultViewProps {
  result: BacktestResult
}

export default function BacktestResultView({ result }: BacktestResultViewProps) {
  const [selectedRegime, setSelectedRegime] = useState<RegimeFilterValue>('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (selectedRegime === 'all') return result

    // If by_regime exists and has data for this regime, use it for summary
    const regimeSummary = result.by_regime?.[selectedRegime]
    const summary = regimeSummary ?? result.summary.filter(s => s.regime === selectedRegime)

    // Filter by_symbol rows
    const bySymbol: Record<string, SymbolBacktest[]> = {}
    for (const [sym, rows] of Object.entries(result.by_symbol)) {
      const filtered = rows.filter(r => r.regime === selectedRegime)
      if (filtered.length > 0) bySymbol[sym] = filtered
    }

    // Filter pnl_curve
    const pnlCurve: Record<string, typeof result.pnl_curve[string]> = {}
    for (const [config, points] of Object.entries(result.pnl_curve)) {
      const filtered = points.filter(p => p.regime === selectedRegime)
      if (filtered.length > 0) pnlCurve[config] = filtered
    }

    return { ...result, summary, by_symbol: bySymbol, pnl_curve: pnlCurve }
  }, [result, selectedRegime])

  const symbols = Object.keys(filtered.by_symbol).sort()
  const totalPages = Math.max(1, Math.ceil(symbols.length / PAGE_SIZE))
  const pageSymbols = symbols.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const best = bestConfigName(filtered.summary)
  const totalTrades = filtered.summary.reduce((sum, s) => sum + s.total_trades, 0)
  const days = result.data_range
    ? daysBetween(result.data_range.start, result.data_range.end)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-100">Backtest A/B Test</h1>
        <div className="mt-1 text-xs text-gray-500 space-x-3 flex flex-wrap gap-y-1">
          <span>Generated: {formatDateTime(result.generated_at)}</span>
          {result.data_range && (
            <>
              <span>·</span>
              <span>
                Data: {formatDate(result.data_range.start)} – {formatDate(result.data_range.end)}
              </span>
              <span>·</span>
              <span>{days} 天</span>
            </>
          )}
          <span>·</span>
          <span>{totalTrades} 笔交易</span>
        </div>
      </div>

      {/* Regime filter pills */}
      <RegimeFilter
        selectedRegime={selectedRegime}
        onSelect={(r) => { setSelectedRegime(r); setPage(1) }}
      />

      {/* Summary cards */}
      <SectionErrorBoundary title="Summary Cards">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.summary.map((s) => (
            <SummaryCard
              key={s.config}
              config={s.config}
              description={result.configs[s.config]?.description ?? ''}
              win_rate_pct={s.win_rate_pct}
              total_pnl_pct={s.total_pnl_pct}
              sharpe={s.sharpe}
              max_drawdown_pct={s.max_drawdown_pct}
              total_trades={s.total_trades}
              isBest={s.config === best}
            />
          ))}
        </div>
      </SectionErrorBoundary>

      {/* Parameter Comparison */}
      <SectionErrorBoundary title="Parameter Comparison">
        <div>
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Parameter Comparison</h2>
          <ParamCompareTable configs={result.configs} summary={filtered.summary} />
          <div className="mt-4">
            <ConfigWeightsDetail configs={result.configs} />
          </div>
        </div>
      </SectionErrorBoundary>

      {/* Performance by Regime */}
      {result.by_regime && Object.keys(result.by_regime).length > 0 && (
        <SectionErrorBoundary title="Performance by Regime">
          <div>
            <h2 className="text-sm font-semibold text-gray-300 mb-3">Performance by Regime</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {['trending', 'ranging', 'volatile'].map(regime => (
                <RegimeMiniCard
                  key={regime}
                  regime={regime}
                  summaries={result.by_regime![regime] ?? []}
                />
              ))}
            </div>
          </div>
        </SectionErrorBoundary>
      )}

      {/* PnL curve */}
      {filtered.pnl_curve && Object.keys(filtered.pnl_curve).length > 0 && (
        <SectionErrorBoundary title="PnL Chart">
          <PnlCompareChart pnlCurve={filtered.pnl_curve} configs={result.configs} />
        </SectionErrorBoundary>
      )}

      {/* Trade Distribution chart */}
      {filtered.summary.length > 1 && (
        <SectionErrorBoundary title="Trade Distribution">
          <TradeDistributionChart summary={filtered.summary} />
        </SectionErrorBoundary>
      )}

      {/* Win Rate by Symbol */}
      {Object.keys(filtered.by_symbol).length > 0 && (
        <SectionErrorBoundary title="Win Rate Compare">
          <WinRateCompareChart bySymbol={filtered.by_symbol} configs={result.configs} />
        </SectionErrorBoundary>
      )}

      {/* By-symbol table */}
      {symbols.length > 0 && (
        <SectionErrorBoundary title="By Symbol">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-300">
              By Symbol
              <span className="ml-2 text-xs text-gray-500 font-normal">
                ({symbols.length} symbols)
              </span>
            </h2>
            {pageSymbols.map((sym) => (
              <SymbolRow key={sym} symbol={sym} rows={filtered.by_symbol[sym]} />
            ))}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-gray-500">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, symbols.length)} of {symbols.length}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>
                  <span className="text-xs text-gray-400 leading-7">
                    {page} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </SectionErrorBoundary>
      )}
    </div>
  )
}
