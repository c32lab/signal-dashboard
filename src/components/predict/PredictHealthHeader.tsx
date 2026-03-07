import type { PredictAccuracyResponse } from '../../types/predict'

interface Props {
  serviceOk: boolean
  activeCount: number
  eventCount: number
  macroScore: number | null
  accuracy: PredictAccuracyResponse | undefined
}

function accColor(pct: number): string {
  if (pct >= 60) return 'text-green-400'
  if (pct >= 50) return 'text-yellow-400'
  return 'text-red-400'
}

export function PredictHealthHeader({ serviceOk, activeCount, eventCount, macroScore, accuracy }: Props) {
  const acc1d = accuracy?.accuracy?.['1d']
  const acc3d = accuracy?.accuracy?.['3d']

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Service Status */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 flex items-center gap-2">
        <span className={`inline-block w-2 h-2 rounded-full ${serviceOk ? 'bg-green-400' : 'bg-red-400'}`} />
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Service</span>
          <span className={`text-sm font-semibold ${serviceOk ? 'text-green-400' : 'text-red-400'}`}>
            {serviceOk ? 'Online' : 'Down'}
          </span>
        </div>
      </div>

      {/* Active Predictions */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 flex flex-col gap-0.5">
        <span className="text-xs text-gray-500 uppercase tracking-wide">Active Predictions</span>
        <span className="text-lg font-mono font-semibold text-blue-400">{activeCount}</span>
      </div>

      {/* Event Count */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 flex flex-col gap-0.5">
        <span className="text-xs text-gray-500 uppercase tracking-wide">Events</span>
        <span className="text-lg font-mono font-semibold text-gray-200">{eventCount}</span>
      </div>

      {/* Macro Score */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 flex flex-col gap-0.5">
        <span className="text-xs text-gray-500 uppercase tracking-wide">Macro Score</span>
        <span className="text-lg font-mono font-semibold text-gray-200">
          {macroScore != null ? macroScore.toFixed(1) : '—'}
        </span>
      </div>

      {/* 1d Accuracy */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 flex flex-col gap-0.5">
        <span className="text-xs text-gray-500 uppercase tracking-wide">1d Accuracy</span>
        {acc1d ? (
          <span className={`text-lg font-mono font-semibold ${accColor(acc1d.accuracy)}`}>
            {acc1d.accuracy.toFixed(1)}%
          </span>
        ) : (
          <span className="text-lg font-mono text-gray-600">—</span>
        )}
        {acc1d && (
          <span className="text-xs text-gray-500">{acc1d.correct}/{acc1d.total}</span>
        )}
        {acc1d && acc1d.total < 10 && (
          <span className="text-xs text-yellow-500 font-medium">⚠ Low sample</span>
        )}
      </div>

      {/* 3d Accuracy */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 flex flex-col gap-0.5">
        <span className="text-xs text-gray-500 uppercase tracking-wide">3d Accuracy</span>
        {acc3d ? (
          <span className={`text-lg font-mono font-semibold ${accColor(acc3d.accuracy)}`}>
            {acc3d.accuracy.toFixed(1)}%
          </span>
        ) : (
          <span className="text-lg font-mono text-gray-600">—</span>
        )}
        {acc3d && (
          <span className="text-xs text-gray-500">{acc3d.correct}/{acc3d.total}</span>
        )}
        {acc3d && acc3d.total < 10 && (
          <span className="text-xs text-yellow-500 font-medium">⚠ Low sample</span>
        )}
      </div>
    </div>
  )
}
