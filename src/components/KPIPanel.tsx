import { useOverview, useAccuracySummary } from '../hooks/useApi'
import DeltaBadge from './ui/DeltaBadge'
import AnomalyBadge from './ui/AnomalyBadge'

export default function KPIPanel() {
  const { data, error, isLoading } = useOverview()
  const { data: accuracyData } = useAccuracySummary()

  if (isLoading) {
    return (
      <div className="p-6 text-gray-400 text-sm">Loading overview…</div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-6 text-red-400 text-sm">
        Failed to load overview: {error?.message ?? 'No data'}
      </div>
    )
  }

  const directions = ['LONG', 'SHORT', 'HOLD'] as const
  const directionColor: Record<string, string> = {
    LONG: 'text-green-400',
    SHORT: 'text-red-400',
    HOLD: 'text-gray-400',
  }

  const symbolEntries = Object.entries(data.symbol_distribution).sort(([, a], [, b]) => b - a)
  const recent1hTotal = Object.values(data.recent_1h).reduce((a, b) => a + b, 0)

  const accuracy24h = accuracyData?.windows?.['24h']?.accuracy_1h_pct
  const accuracy7d = accuracyData?.windows?.['7d']?.accuracy_1h_pct

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 px-2 sm:px-6 py-2 sm:py-4">
      {/* Total decisions */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total Decisions</p>
        <p className="text-3xl font-bold text-white">{data.total_decisions.toLocaleString('en-US')}</p>
      </div>

      {/* Recent 1h */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Last 1h</p>
        <p className="text-3xl font-bold text-blue-400">{recent1hTotal}</p>
        {recent1hTotal === 0 && (
          <div className="mt-2">
            <AnomalyBadge level="warning" message="No signals in last hour" />
          </div>
        )}
      </div>

      {/* Accuracy 1h */}
      {accuracy24h != null && (
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Accuracy (1h)</p>
          <p className="text-3xl font-bold text-white">{accuracy24h.toFixed(1)}%</p>
          {accuracy7d != null && (
            <div className="mt-1">
              <DeltaBadge current={accuracy24h} previous={accuracy7d} format="percent" />
              <span className="text-xs text-gray-600 ml-1">vs 7d</span>
            </div>
          )}
          {accuracy24h < 50 && (
            <div className="mt-2">
              <AnomalyBadge level="critical" message="Accuracy below 50%" />
            </div>
          )}
        </div>
      )}

      {/* By direction */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">By Direction</p>
        <div className="space-y-1">
          {directions.map((dir) => {
            const count = data.action_distribution[dir] ?? 0
            const total = data.total_decisions || 1
            const pct = Math.round((count / total) * 100)
            return (
              <div key={dir} className="flex items-center gap-2">
                <span className={`w-12 text-xs font-semibold ${directionColor[dir]}`}>{dir}</span>
                <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      dir === 'LONG' ? 'bg-green-500' : dir === 'SHORT' ? 'bg-red-500' : 'bg-gray-600'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* By symbol */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">By Symbol</p>
        <div className="space-y-1">
          {symbolEntries.map(([sym, count]) => (
            <div key={sym} className="flex items-center justify-between">
              <span className="text-xs text-gray-300">{sym.replace('/USDT', '')}</span>
              <span className="text-xs font-semibold text-gray-200">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
