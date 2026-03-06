import type { PerformanceResponse } from '../../types'
import { accuracyColor, pnlColor, pnlStr } from './utils'

export default function OverallSummary({ overall }: { overall: PerformanceResponse['overall'] }) {
  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <h2 className="text-sm font-semibold text-gray-200 mb-4">Overall Performance</h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Overall Accuracy</p>
          <p
            className="text-2xl sm:text-3xl font-bold font-mono"
            style={{ color: accuracyColor(overall.accuracy_pct) }}
          >
            {overall.accuracy_pct.toFixed(2)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Avg PnL</p>
          <p className={`text-2xl sm:text-3xl font-bold font-mono ${pnlColor(overall.avg_pnl_pct)}`}>
            {pnlStr(overall.avg_pnl_pct)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Total Trades</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-200">{overall.total}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Correct</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-200">{overall.correct}</p>
        </div>
      </div>
    </section>
  )
}
