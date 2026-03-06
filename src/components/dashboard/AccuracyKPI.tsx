import type { AccuracyResponse } from '../../types'

function accuracyColor(pct: number): string {
  if (pct >= 55) return 'text-green-400'
  if (pct >= 45) return 'text-yellow-400'
  return 'text-red-400'
}

const WINDOWS = ['6h', '12h', '24h'] as const

export function AccuracyKPI({ data }: { data: AccuracyResponse }) {
  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-gray-200">Signal Accuracy</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {WINDOWS.map((w) => {
          const win = data.windows[w]
          const acc1h = win.accuracy['1h_pct']
          const acc4h = win.accuracy['4h_pct']
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
            </div>
          )
        })}
      </div>
    </section>
  )
}
