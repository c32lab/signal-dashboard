import type { HealthResponse } from '../../types'

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

export function HealthSummary({ data }: { data: HealthResponse }) {
  const uptime = data.uptime_seconds ?? 0
  const rate = data.decision_rate_per_hour ?? 0
  const dupRatio = data.duplicate_ratio ?? 0 // decimal 0-1
  const activeCount = (data.active_symbols ?? []).length
  const disabledCount = (data.disabled_symbols ?? []).length
  const biasAlerts = data.bias_alerts ?? []

  const rateColor = rate < 0.1 ? 'text-red-400' : rate < 0.5 ? 'text-yellow-400' : 'text-green-400'
  const dupPct = dupRatio * 100 // decimal_0_1 → display %
  const dupColor = dupPct > 60 ? 'text-red-400' : dupPct > 40 ? 'text-yellow-400' : 'text-green-400'
  const symbolColor = disabledCount > 0 ? 'text-red-400' : 'text-green-400'

  return (
    <section className="flex flex-col gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Uptime */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 flex flex-col gap-1">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Uptime</span>
          <span className="text-lg font-mono font-semibold text-green-400">{formatUptime(uptime)}</span>
        </div>

        {/* Decision Rate */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 flex flex-col gap-1">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Decision Rate</span>
          <span className={`text-lg font-mono font-semibold ${rateColor}`}>{rate.toFixed(2)}/hr</span>
        </div>

        {/* Duplicate Ratio */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 flex flex-col gap-1">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Duplicate Ratio</span>
          <span className={`text-lg font-mono font-semibold ${dupColor}`}>{dupPct.toFixed(1)}%</span>
        </div>

        {/* Active Symbols */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 flex flex-col gap-1">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Active Symbols</span>
          <span className={`text-lg font-mono font-semibold ${symbolColor}`}>
            {activeCount} / {disabledCount} disabled
          </span>
        </div>
      </div>

      {/* Bias alerts banner */}
      {biasAlerts.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {biasAlerts.map((a, i) => (
            <div key={i} className="rounded-lg border border-yellow-700 bg-yellow-900/20 px-3 py-2 text-xs text-yellow-300">
              ⚠ {a.collector}: {a.alert} ({a.bias_score.toFixed(3)})
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
