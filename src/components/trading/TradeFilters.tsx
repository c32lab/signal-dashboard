interface TradeFiltersProps {
  symbols: string[]
  filterSymbol: string
  onFilterSymbol: (v: string) => void
  filterSide: 'ALL' | 'LONG' | 'SHORT'
  onFilterSide: (v: 'ALL' | 'LONG' | 'SHORT') => void
  filterStatus: 'ALL' | 'open' | 'closed'
  onFilterStatus: (v: 'ALL' | 'open' | 'closed') => void
}

export default function TradeFilters({
  symbols,
  filterSymbol,
  onFilterSymbol,
  filterSide,
  onFilterSide,
  filterStatus,
  onFilterStatus,
}: TradeFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={filterSymbol}
        onChange={e => onFilterSymbol(e.target.value)}
        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-gray-500"
      >
        <option value="ALL">All Symbols</option>
        {symbols.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <select
        value={filterSide}
        onChange={e => onFilterSide(e.target.value as 'ALL' | 'LONG' | 'SHORT')}
        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-gray-500"
      >
        <option value="ALL">All Sides</option>
        <option value="LONG">LONG</option>
        <option value="SHORT">SHORT</option>
      </select>
      <select
        value={filterStatus}
        onChange={e => onFilterStatus(e.target.value as 'ALL' | 'open' | 'closed')}
        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-gray-500"
      >
        <option value="ALL">All Statuses</option>
        <option value="open">Open</option>
        <option value="closed">Closed</option>
      </select>
    </div>
  )
}
