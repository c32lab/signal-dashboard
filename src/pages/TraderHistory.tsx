import { useState, useCallback, useMemo } from 'react'
import { useDecisions, usePerformance, useOverview } from '../hooks/useApi'
import SectionErrorBoundary from '../components/SectionErrorBoundary'
import {
  KpiCard,
  FilterBar,
  SymbolSummary,
  DecisionTable,
  Pagination,
  exportCsv,
  PAGE_SIZE,
  TIME_PERIODS,
  accColor,
  pnlColor,
  pnlStr,
} from '../components/history'

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TraderHistory() {
  const [symbolFilter, setSymbolFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [directionFilter, setDirectionFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [timePeriod, setTimePeriod] = useState('')
  const [offset, setOffset] = useState(0)
  const [exporting, setExporting] = useState(false)

  // Round to the nearest minute for SWR key stability
  const fromTs = useMemo(() => {
    if (!timePeriod) return undefined
    const period = TIME_PERIODS.find(p => p.label === timePeriod)
    if (!period) return undefined
    const roundedMs = Math.floor((Date.now() - period.ms) / 60_000) * 60_000
    return new Date(roundedMs).toISOString()
  }, [timePeriod])

  // Server-side filters (symbol, action, type are supported by backend)
  const serverFilters = {
    limit: PAGE_SIZE,
    offset,
    symbol: symbolFilter || undefined,
    action: actionFilter || undefined,
    type: typeFilter || undefined,
    from: fromTs,
    // NOTE: direction is NOT supported server-side, handled client-side below
  }

  const { data: decisionsData, isLoading, error } = useDecisions(serverFilters)
  const { data: perfData } = usePerformance()
  const { data: overviewData } = useOverview()

  // Client-side direction filter (backend ignores direction param)
  const rawDecisions = decisionsData?.decisions ?? []
  const serverTotal = decisionsData?.total ?? 0

  const decisions = directionFilter
    ? rawDecisions.filter(d => d.direction === directionFilter)
    : rawDecisions
  // When direction filter active, total is approximate (server doesn't filter)
  const total = directionFilter ? decisions.length : serverTotal
  const isDirectionFiltered = !!directionFilter

  const overall = perfData?.overall
  const actionDist = overviewData?.action_distribution
  const activeSignals = actionDist
    ? (actionDist['LONG'] ?? 0) + (actionDist['SHORT'] ?? 0)
    : null

  const typeOptions = overviewData?.type_distribution
    ? Object.keys(overviewData.type_distribution).sort()
    : []

  const endRecord = isDirectionFiltered
    ? decisions.length
    : Math.min(offset + PAGE_SIZE, total)
  const startRecord = isDirectionFiltered
    ? (decisions.length > 0 ? 1 : 0)
    : (total === 0 ? 0 : offset + 1)
  const currentPage = isDirectionFiltered ? 1 : Math.floor(offset / PAGE_SIZE) + 1
  const totalPages = isDirectionFiltered ? 1 : Math.max(1, Math.ceil(total / PAGE_SIZE))

  function resetPage() { setOffset(0) }

  function handleSymbol(v: string) { setSymbolFilter(v); resetPage() }
  function handleAction(v: string) { setActionFilter(v); resetPage() }
  function handleDirection(v: string) { setDirectionFilter(v); resetPage() }
  function handleType(v: string) { setTypeFilter(v); resetPage() }

  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      await exportCsv({
        symbol: symbolFilter || undefined,
        action: actionFilter || undefined,
        direction: directionFilter || undefined,
        type: typeFilter || undefined,
        from: fromTs,
      })
    } finally {
      setExporting(false)
    }
  }, [symbolFilter, actionFilter, directionFilter, typeFilter, fromTs])

  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* A. KPI Cards */}
      <SectionErrorBoundary title="KPI Cards">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <KpiCard
            label="Total Trades"
            value={overall ? String(overall.total) : '—'}
          />
          <KpiCard
            label="Win Rate"
            value={overall ? `${overall.accuracy_pct.toFixed(1)}%` : '—'}
            color={accColor(overall?.accuracy_pct)}
          />
          <KpiCard
            label="Avg PnL"
            value={overall ? pnlStr(overall.avg_pnl_pct) : '—'}
            color={pnlColor(overall?.avg_pnl_pct)}
          />
          <KpiCard
            label="Active Signals"
            value={activeSignals != null ? String(activeSignals) : '—'}
            color="text-blue-400"
          />
        </div>
      </SectionErrorBoundary>

      {/* B. Filter Bar */}
      <FilterBar
        symbolFilter={symbolFilter}
        actionFilter={actionFilter}
        typeFilter={typeFilter}
        directionFilter={directionFilter}
        timePeriod={timePeriod}
        typeOptions={typeOptions}
        exporting={exporting}
        total={total}
        onSymbol={handleSymbol}
        onAction={handleAction}
        onType={handleType}
        onDirection={handleDirection}
        onTimePeriod={v => { setTimePeriod(v); setOffset(0) }}
        onExport={handleExport}
      />

      {/* F. Symbol Performance Summary */}
      {symbolFilter && perfData?.by_symbol && (
        <SymbolSummary symbol={symbolFilter} bySymbol={perfData.by_symbol} />
      )}

      {/* C. Decision Table */}
      <DecisionTable
        decisions={decisions}
        isLoading={isLoading}
        error={error}
      />

      {/* D. Pagination */}
      {!isLoading && !error && total > 0 && (
        <Pagination
          offset={offset}
          total={total}
          startRecord={startRecord}
          endRecord={endRecord}
          currentPage={currentPage}
          totalPages={totalPages}
          onPrev={() => setOffset(o => Math.max(0, o - PAGE_SIZE))}
          onNext={() => setOffset(o => o + PAGE_SIZE)}
        />
      )}
    </div>
  )
}
