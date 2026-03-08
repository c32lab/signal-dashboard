import { useMemo } from 'react'
import { useParamMatrix, useWalkForward } from '../../hooks/useParamMatrix'

export default function BacktestSummaryDashboard() {
  const { data: matrixData, isLoading: matrixLoading } = useParamMatrix()
  const { data: wfData, isLoading: wfLoading } = useWalkForward()

  const matrixInsights = useMemo(() => {
    if (!matrixData) return null
    const allResults = Object.values(matrixData.symbols).flatMap(s => s.results)
    if (allResults.length === 0) return null

    const best = allResults.reduce((a, b) => (b.sharpe > a.sharpe ? b : a))
    const avgSharpe = allResults.reduce((s, r) => s + r.sharpe, 0) / allResults.length
    const totalConfigs = allResults.length
    const symbolCount = Object.keys(matrixData.symbols).length

    return { best, avgSharpe, totalConfigs, symbolCount }
  }, [matrixData])

  const wfInsights = useMemo(() => {
    if (!wfData || wfData.symbols.length === 0) return null

    let totalWindows = 0
    let sumOosSharpe = 0
    let sumDegradation = 0
    const oosSharpes: number[] = []

    for (const sym of wfData.symbols) {
      for (const w of sym.windows) {
        const c = w.configs[0]
        if (!c) continue
        totalWindows++
        sumOosSharpe += c.out_of_sample.sharpe
        const degradation = c.in_sample.sharpe !== 0
          ? (c.out_of_sample.sharpe - c.in_sample.sharpe) / Math.abs(c.in_sample.sharpe)
          : 0
        sumDegradation += degradation
        oosSharpes.push(c.out_of_sample.sharpe)
      }
    }

    if (totalWindows === 0) return null

    const avgOosSharpe = sumOosSharpe / totalWindows
    const avgDegradation = sumDegradation / totalWindows
    const variance = oosSharpes.reduce((s, v) => s + (v - avgOosSharpe) ** 2, 0) / totalWindows
    const stability = Math.sqrt(variance)

    return { avgOosSharpe, avgDegradation, stability, totalWindows, symbolCount: wfData.symbols.length }
  }, [wfData])

  if (matrixLoading || wfLoading) {
    return <div className="animate-pulse h-24 bg-gray-800 rounded" />
  }

  if (!matrixInsights && !wfInsights) return null

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4" data-testid="backtest-summary-dashboard">
      <h2 className="text-sm font-semibold text-gray-200 mb-3">Executive Summary</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
        {matrixInsights && (
          <>
            <div>
              <div className="text-gray-500">Best Sharpe</div>
              <div className="text-lg font-mono text-green-400">{matrixInsights.best.sharpe.toFixed(2)}</div>
              <div className="text-[10px] text-gray-500 font-mono">
                {Object.entries(matrixInsights.best.params).map(([k, v]) => `${k}=${v}`).join(', ')}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Avg Sharpe</div>
              <div className="text-lg font-mono text-gray-200">{matrixInsights.avgSharpe.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-500">Configs Tested</div>
              <div className="text-lg font-mono text-gray-200">{matrixInsights.totalConfigs}</div>
              <div className="text-[10px] text-gray-500">{matrixInsights.symbolCount} symbols</div>
            </div>
          </>
        )}
        {wfInsights && (
          <>
            <div>
              <div className="text-gray-500">OOS Sharpe</div>
              <div className={`text-lg font-mono ${wfInsights.avgOosSharpe >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {wfInsights.avgOosSharpe.toFixed(2)}
              </div>
              <div className="text-[10px] text-gray-500">{wfInsights.totalWindows} windows</div>
            </div>
            <div>
              <div className="text-gray-500">Avg Degradation</div>
              <div className={`text-lg font-mono ${wfInsights.avgDegradation < 0 ? 'text-red-400' : 'text-green-400'}`}>
                {(wfInsights.avgDegradation * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-gray-500">Stability</div>
              <div className={`text-lg font-mono ${wfInsights.stability > 1 ? 'text-red-400' : wfInsights.stability > 0.5 ? 'text-yellow-400' : 'text-green-400'}`}>
                {wfInsights.stability.toFixed(2)}
              </div>
              <div className="text-[10px] text-gray-500">OOS Sharpe StdDev</div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
