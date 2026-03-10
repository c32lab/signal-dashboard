import { useState, useMemo } from 'react'
import { useDecisions } from '../hooks/useApi'
import { useSymbols } from '../hooks/useSymbols'
import { DecisionRow, DecisionCard, DecisionFilters, DecisionPagination, PAGE_SIZE, fromIso, TIME_PRESETS } from './decision'
import type { TimePreset } from './decision'

const TABLE_HEADERS = ['ID', 'Time', 'Symbol', 'Direction', 'Type', 'Action', 'Price', 'Conf', 'Score', 'Reasoning']

export default function DecisionTable() {
  const symbols = useSymbols()
  const [symbolFilter, setSymbolFilter] = useState('')
  const [directionFilter, setDirectionFilter] = useState('')
  const [timePreset, setTimePreset] = useState<TimePreset>('24h')
  const [page, setPage] = useState(1)

  // Memoize fromTime with minute-level granularity to prevent SWR key churn (P0 fix)
  const minuteTick = Math.floor(Date.now() / 60_000)
  const fromTime = useMemo(() => {
    const preset = TIME_PRESETS.find((p) => p.value === timePreset)
    if (!preset?.hours) return undefined
    return fromIso(preset.hours)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timePreset, minuteTick])

  const offset = (page - 1) * PAGE_SIZE
  const { data, error, isLoading } = useDecisions({
    limit: PAGE_SIZE,
    offset,
    symbol: symbolFilter || undefined,
    direction: directionFilter || undefined,
    from: fromTime,
  })

  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = data?.decisions ?? []

  function resetPage() { setPage(1) }
  function handleSymbol(v: string) { setSymbolFilter(v); resetPage() }
  function handleDirection(v: string) { setDirectionFilter(v); resetPage() }
  function handleTimePreset(v: TimePreset) { setTimePreset(v); resetPage() }

  return (
    <div className="px-2 sm:px-6">
      <DecisionFilters
        timePreset={timePreset}
        onTimePreset={handleTimePreset}
        symbolFilter={symbolFilter}
        onSymbol={handleSymbol}
        directionFilter={directionFilter}
        onDirection={handleDirection}
        symbols={symbols}
      />

      {isLoading && (
        <p className="text-gray-400 text-sm py-4">Loading decisions…</p>
      )}
      {error && (
        <p className="text-red-400 text-sm py-4">
          Failed to load decisions: {error?.message}
        </p>
      )}

      {!isLoading && !error && (
        <>
          {/* Mobile: stacked cards */}
          <div className="md:hidden space-y-2">
            {pageRows.length === 0 ? (
              <p className="py-8 text-center text-gray-600 text-sm">No decisions found</p>
            ) : (
              pageRows.map((d) => <DecisionCard key={String(d.id)} d={d} />)
            )}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-gray-900">
                <tr>
                  {TABLE_HEADERS.map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-3 py-8 text-center text-gray-600 text-sm">
                      No decisions found
                    </td>
                  </tr>
                ) : (
                  pageRows.map((d) => <DecisionRow key={String(d.id)} d={d} />)
                )}
              </tbody>
            </table>
          </div>

          <DecisionPagination
            total={total}
            safePage={safePage}
            totalPages={totalPages}
            isFiltered={!!(symbolFilter || directionFilter || timePreset !== 'all')}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </>
      )}
    </div>
  )
}
