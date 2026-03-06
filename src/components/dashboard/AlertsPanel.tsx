import type { BiasAlert, HealthResponse } from '../../types'

export function AlertsPanel({ data }: { data: HealthResponse }) {
  const alerts = data.bias_alerts ?? []
  const dupRatio = data.duplicate_ratio ?? 0
  const disabledSymbols = data.disabled_symbols ?? []

  const hasAlerts = alerts.length > 0 || dupRatio > 0.5 || disabledSymbols.length > 0
  if (!hasAlerts) return null

  return (
    <section className="rounded-lg border border-gray-800 bg-gray-900 p-4 flex flex-col gap-2">
      {alerts.map((alert: BiasAlert, i: number) => {
        const isHigh = alert.bias_score > 0.7
        const isMed = alert.bias_score > 0.5
        const borderColor = isHigh ? 'border-red-500' : isMed ? 'border-yellow-500' : 'border-gray-600'
        const bgColor = isHigh ? 'bg-red-900/20' : isMed ? 'bg-yellow-900/20' : 'bg-gray-800/40'
        const textColor = isHigh ? 'text-red-300' : isMed ? 'text-yellow-300' : 'text-gray-400'
        const barColor = isHigh ? 'bg-red-500' : isMed ? 'bg-yellow-500' : 'bg-gray-500'
        return (
          <div key={i} className={`border-l-4 ${borderColor} ${bgColor} rounded px-3 py-2`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-200">{alert.collector}</span>
              <span className={`text-xs font-mono ${textColor}`}>{alert.bias_score.toFixed(3)}</span>
            </div>
            <p className="text-xs text-gray-400 mb-1.5">{alert.alert}</p>
            <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${barColor} rounded-full`}
                style={{ width: `${Math.min(alert.bias_score * 100, 100)}%` }}
              />
            </div>
          </div>
        )
      })}
      {dupRatio > 0.5 && (
        <div className="border-l-4 border-yellow-500 bg-yellow-900/20 rounded px-3 py-2">
          <p className="text-xs font-semibold text-yellow-300">
            High duplicate ratio: {(dupRatio * 100).toFixed(1)}%
          </p>
        </div>
      )}
      {disabledSymbols.length > 0 && (
        <div className="border-l-4 border-yellow-500 bg-yellow-900/20 rounded px-3 py-2">
          <p className="text-xs font-semibold text-yellow-300">
            Symbols disabled: {disabledSymbols.join(', ')}
          </p>
        </div>
      )}
    </section>
  )
}
