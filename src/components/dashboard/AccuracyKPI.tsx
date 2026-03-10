import { useState } from 'react'
import type { AccuracyResponse } from '../../types'
import { formatDateTime } from '../../utils/format'

function accuracyColor(pct: number): string {
  if (pct >= 55) return 'text-green-400'
  if (pct >= 45) return 'text-yellow-400'
  return 'text-red-400'
}

const ACCURACY_THRESHOLD = 45
const WINDOWS = ['6h', '12h', '24h'] as const

export function AccuracyKPI({ data }: { data: AccuracyResponse }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggle = (w: string) => setExpanded((prev) => ({ ...prev, [w]: !prev[w] }))

  const belowThreshold = (['6h', '24h'] as const).some(
    (w) => data.windows[w].accuracy['4h_pct'] < ACCURACY_THRESHOLD
  )

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-2 sm:p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-200">Signal Accuracy</h2>
          {belowThreshold && (
            <span
              className="relative flex h-2.5 w-2.5"
              title="Accuracy below threshold"
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
          )}
        </div>
        {data.timestamp && (
          <span className="text-xs text-gray-500">
            Updated {formatDateTime(data.timestamp)}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {WINDOWS.map((w) => {
          const win = data.windows[w]
          const acc1h = win.accuracy['1h_pct']
          const acc4h = win.accuracy['4h_pct']
          const isExpanded = !!expanded[w]

          const symbols = Object.entries(win.by_symbol ?? {})
            .filter(([, v]) => v.total > 0)
            .sort(([, a], [, b]) => b.total - a.total)

          return (
            <div key={w} className="bg-gray-800 rounded-lg p-3 flex flex-col gap-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">{w} window</span>
              {/* 4h accuracy — primary metric */}
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-gray-400">4h Accuracy</span>
                <span className={`text-2xl font-mono font-bold ${accuracyColor(acc4h)}`}>
                  {acc4h.toFixed(1)}%
                </span>
              </div>
              {/* 1h accuracy */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">1h Accuracy</span>
                <span className={`text-sm font-mono font-semibold ${accuracyColor(acc1h)}`}>
                  {acc1h.toFixed(1)}%
                </span>
              </div>
              {/* Actionable count */}
              <div className="flex items-center justify-between border-t border-gray-700 pt-2">
                <span className="text-xs text-gray-500">Actionable</span>
                <span className="text-sm font-mono text-gray-300">{win.total_actionable}</span>
              </div>
              {/* Toggle button */}
              {symbols.length > 0 && (
                <button
                  onClick={() => toggle(w)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors mt-1 self-start"
                >
                  <svg
                    className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="currentColor"
                    viewBox="0 0 6 10"
                  >
                    <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  By symbol
                </button>
              )}
              {/* Symbol breakdown */}
              {isExpanded && symbols.length > 0 && (
                <div className="bg-gray-900 rounded-md p-2 flex flex-col gap-1 mt-1">
                  <div className="grid grid-cols-4 gap-1 text-xs text-gray-600 font-medium mb-1">
                    <span>Symbol</span>
                    <span className="text-right">4h</span>
                    <span className="text-right">1h</span>
                    <span className="text-right">N</span>
                  </div>
                  {symbols.map(([sym, v]) => (
                    <div key={sym} className="grid grid-cols-4 gap-1 text-xs">
                      <span className="text-gray-300 font-medium truncate">{sym.split('/')[0]}</span>
                      <span className={`text-right font-mono ${accuracyColor(v.accuracy_4h_pct)}`}>
                        {v.accuracy_4h_pct.toFixed(0)}%
                      </span>
                      <span className={`text-right font-mono ${accuracyColor(v.accuracy_1h_pct)}`}>
                        {v.accuracy_1h_pct.toFixed(0)}%
                      </span>
                      <span className="text-right font-mono text-gray-500">{v.total}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
