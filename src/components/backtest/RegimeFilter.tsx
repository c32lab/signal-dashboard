const REGIME_OPTIONS = ['all', 'trending', 'ranging', 'volatile'] as const
export type RegimeFilterValue = typeof REGIME_OPTIONS[number]

const REGIME_ACTIVE_STYLES: Record<RegimeFilterValue, string> = {
  all: 'bg-blue-600 text-white',
  trending: 'bg-green-600 text-white',
  ranging: 'bg-yellow-600 text-white',
  volatile: 'bg-red-600 text-white',
}

interface RegimeFilterProps {
  selectedRegime: RegimeFilterValue
  onSelect: (regime: RegimeFilterValue) => void
}

export default function RegimeFilter({ selectedRegime, onSelect }: RegimeFilterProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {REGIME_OPTIONS.map(r => (
        <button
          key={r}
          onClick={() => onSelect(r)}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            selectedRegime === r
              ? REGIME_ACTIVE_STYLES[r]
              : 'bg-gray-800 text-gray-400 hover:text-gray-200'
          }`}
        >
          {r.charAt(0).toUpperCase() + r.slice(1)}
        </button>
      ))}
    </div>
  )
}
