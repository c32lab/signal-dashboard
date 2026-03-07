import { stripUsdt, TIME_RANGES, DIRECTIONS } from './constants'

interface TimelineFilterBarProps {
  symbol: string
  direction: string
  hoursIdx: number
  total: number
  filteredCount: number
  symbols: string[]
  onSymbolChange: (symbol: string) => void
  onDirectionChange: (direction: string) => void
  onHoursChange: (idx: number) => void
}

export default function TimelineFilterBar({
  symbol,
  direction,
  hoursIdx,
  total,
  filteredCount,
  symbols,
  onSymbolChange,
  onDirectionChange,
  onHoursChange,
}: TimelineFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <select
        value={symbol}
        onChange={(e) => onSymbolChange(e.target.value)}
        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
      >
        <option value="">All Symbols</option>
        {symbols.map((s) => (
          <option key={s} value={s}>{stripUsdt(s)}</option>
        ))}
      </select>

      <select
        value={direction}
        onChange={(e) => onDirectionChange(e.target.value)}
        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
      >
        {DIRECTIONS.map((d) => (
          <option key={d} value={d === 'ALL' ? '' : d}>{d}</option>
        ))}
      </select>

      <div className="flex gap-1">
        {TIME_RANGES.map((tr, idx) => (
          <button
            key={tr.label}
            onClick={() => onHoursChange(idx)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              hoursIdx === idx
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {tr.label}
          </button>
        ))}
      </div>

      {total > 0 && (
        <span className="text-xs text-gray-500 ml-auto">
          {direction ? `${filteredCount} / ` : ''}{total} total
        </span>
      )}
    </div>
  )
}
