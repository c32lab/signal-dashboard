import type { Trend } from '../../types/predict'

export function TrendsSection({ trends }: { trends: Trend[] }) {
  if (trends.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-sm font-medium mb-2">No trends discovered yet</p>
        <p className="text-gray-600 text-xs max-w-md mx-auto leading-relaxed">
          Trends are identified when the same event pattern triggers multiple occurrences within a
          rolling time window. Check back as more prediction data accumulates.
        </p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {trends.map((t, i) => (
        <div key={i} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="font-semibold text-gray-200 mb-2 truncate" title={t.pattern_name}>
            {t.pattern_name}
          </div>
          <div className="flex gap-4 text-xs text-gray-400 mb-3">
            <span>
              Events: <span className="text-gray-200 font-mono">{t.event_count}</span>
            </span>
            {/* avg_impact is already_pct — direct display */}
            <span>
              Avg impact:{' '}
              <span className="text-gray-200 font-mono">
                {t.avg_impact != null ? `${t.avg_impact.toFixed(1)}%` : '—'}
              </span>
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {t.symbols.map((s) => (
              <span
                key={s}
                className="px-1.5 py-0.5 bg-blue-900/50 text-blue-300 rounded text-xs font-mono"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="text-xs text-gray-500">Latest: {t.latest_date}</div>
        </div>
      ))}
    </div>
  )
}
