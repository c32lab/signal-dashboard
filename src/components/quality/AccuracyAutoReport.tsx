import { useState } from 'react'
import { useAccuracy } from '../../hooks/useApi'
import { formatDateTime } from '../../utils/format'

type WindowKey = '6h' | '12h' | '24h'
const WINDOWS: WindowKey[] = ['6h', '12h', '24h']

function accuracyColor(pct: number): string {
  if (pct >= 55) return 'text-green-400'
  if (pct >= 45) return 'text-yellow-400'
  return 'text-red-400'
}

export default function AccuracyAutoReport() {
  const { data, isLoading, error } = useAccuracy()
  const [selectedWindow, setSelectedWindow] = useState<WindowKey>('24h')

  if (isLoading) return <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center text-gray-500 text-sm animate-pulse">Loading accuracy report…</div>
  if (error || !data) return <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-sm text-red-400">Failed to load accuracy data</div>

  const windowData = data.windows[selectedWindow]
  const symbolEntries = Object.entries(windowData.by_symbol)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-200">Accuracy Auto Report</h2>
        <div className="flex gap-1">
          {WINDOWS.map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWindow(w)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                selectedWindow === w
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Overall accuracy */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">4h Accuracy</div>
          <div className={`text-xl font-bold ${accuracyColor(windowData.accuracy['4h_pct'])}`}>
            {windowData.accuracy['4h_pct'].toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">1h Accuracy</div>
          <div className={`text-xl font-bold ${accuracyColor(windowData.accuracy['1h_pct'])}`}>
            {windowData.accuracy['1h_pct'].toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Actionable Signals</div>
          <div className="text-xl font-bold text-gray-200">{windowData.total_actionable}</div>
        </div>
      </div>

      {/* By Symbol (top 5) */}
      <div>
        <h3 className="text-xs font-medium text-gray-400 mb-2">Top Symbols by Trade Count</h3>
        <div className="space-y-1.5">
          {symbolEntries.map(([symbol, stats]) => (
            <div key={symbol} className="flex items-center justify-between bg-gray-800/50 rounded px-3 py-2 text-sm">
              <span className="text-gray-300 font-medium">{symbol}</span>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-gray-500">{stats.total} trades</span>
                <span className={accuracyColor(stats.accuracy_4h_pct)}>
                  4h: {stats.accuracy_4h_pct.toFixed(1)}%
                </span>
                <span className={accuracyColor(stats.accuracy_1h_pct)}>
                  1h: {stats.accuracy_1h_pct.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
          {symbolEntries.length === 0 && (
            <div className="text-xs text-gray-600 text-center py-2">No symbol data</div>
          )}
        </div>
      </div>

      {/* Last updated */}
      <div className="text-xs text-gray-600 text-right" data-testid="last-updated">
        Last updated: {formatDateTime(data.timestamp)}
      </div>
    </section>
  )
}
