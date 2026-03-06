import type { Pattern } from '../../types/predict'

export function PatternCard({ pattern }: { pattern: Pattern }) {
  const isUp = pattern.direction?.toUpperCase() === 'UP' || pattern.direction?.toUpperCase() === 'LONG'
  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-gray-200 truncate">{pattern.name}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded font-bold ml-2 shrink-0 ${
            isUp ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
          }`}
        >
          {pattern.direction}
        </span>
      </div>
      <div className="flex gap-4 text-xs text-gray-400 mb-2">
        {/* avg_impact is already_pct — direct display, no ×100 */}
        <span>Avg impact: <span className="text-gray-200 font-mono">{pattern.avg_impact != null ? `${pattern.avg_impact.toFixed(1)}%` : '—'}</span></span>
        <span>Base level: <span className="text-gray-200 font-mono">{pattern.base_level}</span></span>
      </div>
      {pattern.example_dates?.length > 0 && (
        <div className="text-xs text-gray-500">
          Examples: {pattern.example_dates.slice(0, 3).join(', ')}
        </div>
      )}
    </div>
  )
}
