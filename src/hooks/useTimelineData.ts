import { useMemo, useState, useEffect } from 'react'
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
  // NOTE: direction is NOT sent to the API (backend ignores it).
  // The caller is responsible for client-side filtering by direction.

  // Use state to hold the rounded minute so Date.now() is not called during render.
  // Update it every 60s to keep the SWR key fresh.
  const [nowMinute, setNowMinute] = useState(() =>
    Math.floor(Date.now() / 60_000) * 60_000
  )
  useEffect(() => {
    if (!params.hours) return
    const id = setInterval(() => {
      setNowMinute(Math.floor(Date.now() / 60_000) * 60_000)
    }, 60_000)
    return () => clearInterval(id)
  }, [params.hours])

  const filters = useMemo<DecisionFilters>(() => {
    const f: DecisionFilters = {
      limit: params.limit,
      offset: params.offset,
    }
    if (params.symbol) f.symbol = params.symbol
    if (params.hours) {
      f.from = new Date(nowMinute - params.hours * 3600_000).toISOString()
    }
    return f
  }, [params.symbol, params.hours, params.limit, params.offset, nowMinute])

  return useDecisions(filters)
}
