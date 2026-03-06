import FilterSelect from './FilterSelect'
import { ACTIONS, DIRECTIONS, TIME_PERIODS } from './constants'
import { stripUsdt } from './utils'
import { useSymbols } from '../../hooks/useSymbols'

interface FilterBarProps {
  symbolFilter: string
  actionFilter: string
  typeFilter: string
  directionFilter: string
  timePeriod: string
  typeOptions: string[]
  exporting: boolean
  total: number
  onSymbol: (v: string) => void
  onAction: (v: string) => void
  onType: (v: string) => void
  onDirection: (v: string) => void
  onTimePeriod: (v: string) => void
  onExport: () => void
}

export default function FilterBar({
  symbolFilter,
  actionFilter,
  typeFilter,
  directionFilter,
  timePeriod,
  typeOptions,
  exporting,
  total,
  onSymbol,
  onAction,
  onType,
  onDirection,
  onTimePeriod,
  onExport,
}: FilterBarProps) {
  const symbols = useSymbols()
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Filters</span>

        <FilterSelect value={symbolFilter} onChange={onSymbol}>
          <option value="">All Symbols</option>
          {symbols.map(s => (
            <option key={s} value={s}>{stripUsdt(s)}</option>
          ))}
        </FilterSelect>

        <FilterSelect value={actionFilter} onChange={onAction}>
          <option value="">All Actions</option>
          {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
        </FilterSelect>

        <FilterSelect value={typeFilter} onChange={onType}>
          <option value="">All Types</option>
          {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
        </FilterSelect>

        <FilterSelect value={directionFilter} onChange={onDirection}>
          <option value="">All Directions</option>
          {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
        </FilterSelect>

        <FilterSelect value={timePeriod} onChange={onTimePeriod}>
          <option value="">All Time</option>
          {TIME_PERIODS.map(p => (
            <option key={p.label} value={p.label}>{p.label}</option>
          ))}
        </FilterSelect>

        <div className="ml-auto">
          <button
            onClick={onExport}
            disabled={exporting || total === 0}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
      </div>
    </div>
  )
}
