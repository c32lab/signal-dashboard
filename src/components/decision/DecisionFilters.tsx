import { TIME_PRESETS, DIRECTIONS } from './decisionHelpers'
import type { TimePreset } from './decisionHelpers'

interface DecisionFiltersProps {
  timePreset: TimePreset
  onTimePreset: (v: TimePreset) => void
  symbolFilter: string
  onSymbol: (v: string) => void
  directionFilter: string
  onDirection: (v: string) => void
  symbols: string[]
}

export default function DecisionFilters({
  timePreset,
  onTimePreset,
  symbolFilter,
  onSymbol,
  directionFilter,
  onDirection,
  symbols,
}: DecisionFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
        Decision History
      </h2>
      <div className="ml-auto flex flex-wrap gap-2 items-center">
        {/* Time preset buttons */}
        <div className="flex gap-1">
          {TIME_PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => onTimePreset(p.value)}
              className={`px-2 sm:px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                timePreset === p.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <select
          value={symbolFilter}
          onChange={(e) => onSymbol(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded-lg px-2 sm:px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All symbols</option>
          {symbols.map((s) => (
            <option key={s} value={s}>
              {s.replace('/USDT', '')}
            </option>
          ))}
        </select>
        <select
          value={directionFilter}
          onChange={(e) => onDirection(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded-lg px-2 sm:px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All directions</option>
          {DIRECTIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
