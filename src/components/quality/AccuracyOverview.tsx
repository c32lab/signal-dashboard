import { useState } from 'react'
import type { AccuracyResponse } from '../../types'
import { accuracyColor } from './utils'

type AccuracyWindow = '6h' | '12h' | '24h'

export default function AccuracyOverview({ data }: { data: AccuracyResponse }) {
  const [selectedWindow, setSelectedWindow] = useState<AccuracyWindow>('24h')
  const windowData = data.windows[selectedWindow]
  const acc1h = windowData.accuracy['1h_pct'].toFixed(1)
  const acc4h = windowData.accuracy['4h_pct'].toFixed(1)
  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-200">Accuracy Overview</h2>
        <div className="flex gap-1">
          {(['6h', '12h', '24h'] as AccuracyWindow[]).map((w) => (
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
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">1h Accuracy</p>
          <p
            className="text-2xl sm:text-3xl font-bold font-mono"
            style={{ color: accuracyColor(Number(acc1h)) }}
          >
            {acc1h}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">4h Accuracy</p>
          <p
            className="text-2xl sm:text-3xl font-bold font-mono"
            style={{ color: accuracyColor(Number(acc4h)) }}
          >
            {acc4h}%
          </p>
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-500 border-t border-gray-800 pt-3">
        <span>Window: {selectedWindow}</span>
        <span>Actionable signals: {windowData.total_actionable}</span>
      </div>
      {windowData.dampened_symbols.length > 0 && (
        <p className="mt-2 text-xs text-yellow-500">
          ⚠ Dampened: {windowData.dampened_symbols.join(', ')}
        </p>
      )}
    </section>
  )
}
