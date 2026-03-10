import { useForecastPanel } from '../../hooks/useForecast'
import BridgeStatusDot from './BridgeStatusDot'
import ForecastSignalCards from './ForecastSignalCards'
import ActivePredictionsList from './ActivePredictionsList'
import PredictAccuracyBadge from './PredictAccuracyBadge'

export default function ForecastPanel() {
  const { data, isLoading } = useForecastPanel()

  if (isLoading || !data) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center text-gray-500 text-sm animate-pulse">
        Loading forecast data…
      </div>
    )
  }

  const allPredictions = data.signals.flatMap((s) => s.predictions)

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
          Forecast Signal (predict→signal)
        </h2>
        <BridgeStatusDot status={data.bridge_status} lastSync={data.last_sync} />
      </div>

      <ForecastSignalCards signals={data.signals} />

      {data.isHistorical && (
        <p className="text-xs text-blue-400 bg-blue-900/30 border border-blue-800/50 rounded px-3 py-1.5 mb-2">
          No active predictions. Showing recent results:
        </p>
      )}

      <div className={data.isHistorical ? 'opacity-75' : ''}>
        <ActivePredictionsList predictions={allPredictions} isHistorical={data.isHistorical} />
      </div>

      <div className="pt-2 border-t border-gray-800">
        <PredictAccuracyBadge accuracy={data.accuracy} />
      </div>
    </div>
  )
}
