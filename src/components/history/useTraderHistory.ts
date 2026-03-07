import { useState, useCallback, useMemo } from 'react'
import { useDecisions, usePerformance, useOverview } from '../../hooks/useApi'
import { PAGE_SIZE, TIME_PERIODS } from './constants'
import { exportCsv } from './exportCsv'

export function useTraderHistory() {
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

  return {
    // Filter state
    symbolFilter, actionFilter, directionFilter, typeFilter, timePeriod, exporting,
    // Handlers
    handleSymbol, handleAction, handleDirection, handleType, handleExport,
    setTimePeriod: (v: string) => { setTimePeriod(v); setOffset(0) },
    // Data
    decisions, total, isLoading, error,
    overall, activeSignals, perfData, typeOptions,
    // Pagination
    offset, setOffset, startRecord, endRecord, currentPage, totalPages,
    isDirectionFiltered,
  }
}
