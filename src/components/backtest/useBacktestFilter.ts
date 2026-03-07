import { useState, useMemo } from 'react'
import type { BacktestResult, SymbolBacktest } from '../../types/backtest'
import type { RegimeFilterValue } from './RegimeFilter'

export function useBacktestFilter(result: BacktestResult) {
  const [selectedRegime, setSelectedRegime] = useState<RegimeFilterValue>('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (selectedRegime === 'all') return result

    const regimeSummary = result.by_regime?.[selectedRegime]
    const summary = regimeSummary ?? result.summary.filter(s => s.regime === selectedRegime)

    const bySymbol: Record<string, SymbolBacktest[]> = {}
    for (const [sym, rows] of Object.entries(result.by_symbol)) {
      const filtered = rows.filter(r => r.regime === selectedRegime)
      if (filtered.length > 0) bySymbol[sym] = filtered
    }

    const pnlCurve: Record<string, typeof result.pnl_curve[string]> = {}
    for (const [config, points] of Object.entries(result.pnl_curve)) {
      const filtered = points.filter(p => p.regime === selectedRegime)
      if (filtered.length > 0) pnlCurve[config] = filtered
    }

    return { ...result, summary, by_symbol: bySymbol, pnl_curve: pnlCurve }
  }, [result, selectedRegime])

  const selectRegime = (r: RegimeFilterValue) => {
    setSelectedRegime(r)
    setPage(1)
  }

  return { filtered, selectedRegime, selectRegime, page, setPage }
}
