import { useState, useEffect } from 'react'
import { useAccuracy, usePerformance, useAccuracySummary } from '../../hooks/useApi'
import { formatDateTime } from '../../utils/format'

function accuracyColor(pct: number): string {
  if (pct >= 50) return 'text-green-400'
  if (pct >= 45) return 'text-yellow-400'
  return 'text-red-400'
}

export function AccuracyAutoReport() {
  const { data: accuracyData, isLoading: accLoading } = useAccuracy()
  const { data: perfData } = usePerformance()
  const { data: summaryData } = useAccuracySummary()
  const [secondsAgo, setSecondsAgo] = useState(0)

  // Live "last updated" timer
  useEffect(() => {
    if (!accuracyData?.timestamp) return
    const updateAgo = () => {
      const diff = Math.floor((Date.now() - new Date(accuracyData.timestamp).getTime()) / 1000)
      setSecondsAgo(Math.max(0, diff))
    }
    updateAgo()
    const id = setInterval(updateAgo, 1000)
    return () => clearInterval(id)
  }, [accuracyData?.timestamp])

  if (accLoading) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center text-gray-500 text-sm animate-pulse">
        Loading accuracy report…
      </div>
    )
  }

  if (!accuracyData) return null

  const win24h = accuracyData.windows['24h']
  const win12h = accuracyData.windows['12h']
  const todayAccuracy = win24h.accuracy['4h_pct']
  const delta = todayAccuracy - win12h.accuracy['4h_pct']

  // Per-symbol breakdown from performance API
  const symbols = perfData?.by_symbol ?? []

  // Per-direction breakdown from accuracy summary
  const directionData = summaryData?.windows?.['24h']?.by_direction

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-2 sm:p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-200">Accuracy Auto Report</h2>
        <span className="text-xs text-gray-600">
          Last updated: {secondsAgo < 60 ? `${secondsAgo}s ago` : `${Math.floor(secondsAgo / 60)}m ago`}
        </span>
      </div>

      {/* Today's accuracy + week comparison */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Today Win Rate</div>
          <div className={`text-2xl font-bold font-mono ${accuracyColor(todayAccuracy)}`}>
            {todayAccuracy.toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">vs 12h</div>
          <div className={`text-2xl font-bold font-mono ${delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {delta > 0 ? '+' : ''}{delta.toFixed(1)}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">1h Accuracy</div>
          <div className={`text-2xl font-bold font-mono ${accuracyColor(win24h.accuracy['1h_pct'])}`}>
            {win24h.accuracy['1h_pct'].toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Signals</div>
          <div className="text-2xl font-bold font-mono text-gray-200">{win24h.total_actionable}</div>
        </div>
      </div>

      {/* Per-symbol breakdown */}
      {symbols.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-gray-400 mb-2">Per-Symbol Accuracy</h3>
          <div className="space-y-1.5">
            {symbols.map((s) => (
              <div key={s.symbol} className="flex items-center justify-between bg-gray-800/50 rounded px-3 py-2 text-sm">
                <span className="text-gray-300 font-medium">{s.symbol}</span>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-gray-500">{s.total} trades</span>
                  <span className={accuracyColor(s.accuracy_pct)}>
                    {s.accuracy_pct.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-direction breakdown */}
      {directionData && (
        <div>
          <h3 className="text-xs font-medium text-gray-400 mb-2">Per-Direction (24h)</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(directionData).map(([dir, stats]) => (
              <div key={dir} className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className={`text-xs font-semibold mb-1 ${dir === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                  {dir}
                </div>
                <div className={`text-xl font-bold font-mono ${accuracyColor(stats.accuracy_4h_pct ?? stats.accuracy_1h_pct ?? 0)}`}>
                  {(stats.accuracy_4h_pct ?? stats.accuracy_1h_pct ?? 0).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {stats.correct}/{stats.total} correct
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-600 text-right">
        Snapshot: {formatDateTime(accuracyData.timestamp)}
      </div>
    </section>
  )
}
