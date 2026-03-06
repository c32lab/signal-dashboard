import { useMemo } from 'react'
import { useDecisions } from './useApi'
import type { DecisionFilters } from '../types'

interface TimelineParams {
  symbol?: string
  direction?: string
  hours?: number
  limit: number
  offset: number
}

export function useTimelineData(params: TimelineParams) {
  const filters = useMemo<DecisionFilters>(() => {
    const f: DecisionFilters = {
      limit: params.limit,
      offset: params.offset,
    }
    if (params.symbol) f.symbol = params.symbol
    if (params.direction) f.direction = params.direction
    if (params.hours) {
      // Round to the current minute to keep SWR key stable
      const nowMs = Math.floor(Date.now() / 60_000) * 60_000
      f.from = new Date(nowMs - params.hours * 3600_000).toISOString()
    }
    return f
  }, [params.symbol, params.direction, params.hours, params.limit, params.offset])

  return useDecisions(filters)
}
