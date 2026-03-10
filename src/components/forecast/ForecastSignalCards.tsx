import type { ForecastSignal } from '../../types'

interface ForecastSignalCardsProps {
  signals: ForecastSignal[]
}

function directionStyle(direction: string): { badge: string; bar: string; border: string } {
  switch (direction) {
    case 'LONG':
      return { badge: 'bg-green-900 text-green-300', bar: 'bg-green-500', border: 'border-green-800' }
    case 'SHORT':
      return { badge: 'bg-red-900 text-red-300', bar: 'bg-red-500', border: 'border-red-800' }
    default:
      return { badge: 'bg-gray-800 text-gray-400', bar: 'bg-gray-600', border: 'border-gray-700' }
  }
}

export default function ForecastSignalCards({ signals }: ForecastSignalCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      {signals.map((signal) => {
        const label = signal.symbol.replace('/USDT', '')
        const pct = Math.round(signal.confidence * 100)
        const style = directionStyle(signal.direction)
        const topPrediction = signal.predictions[0]

        return (
          <div key={signal.symbol} className={`bg-gray-900 rounded-xl p-3 sm:p-5 border ${style.border} flex flex-col gap-2 sm:gap-3`}>
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-white">{label}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
                {signal.direction}
              </span>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-500">Confidence</span>
                <span className="text-xs font-semibold text-gray-300">{pct}%</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {topPrediction && (
              <div className="text-xs text-gray-500">
                <span>Impact: </span>
                <span className={topPrediction.expected_impact >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {topPrediction.expected_impact >= 0 ? '+' : ''}{topPrediction.expected_impact}%
                </span>
              </div>
            )}

            <div className="text-xs text-gray-600">
              {signal.prediction_count} prediction{signal.prediction_count !== 1 ? 's' : ''}
            </div>
          </div>
        )
      })}
    </div>
  )
}
