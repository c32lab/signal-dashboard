import useSWR from 'swr'
import type { ParamMatrixResponse, WalkForwardResponse } from '../types/paramMatrix'

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export function useParamMatrix() {
  return useSWR<ParamMatrixResponse>(
    'backtest/parameter-matrix',
    () => fetcher<ParamMatrixResponse>('/api/backtest/parameter-matrix'),
    { refreshInterval: 60_000 },
  )
}

export function useWalkForward() {
  return useSWR<WalkForwardResponse>(
    'backtest/walk-forward',
    () => fetcher<WalkForwardResponse>('/api/backtest/walk-forward'),
    { refreshInterval: 60_000 },
  )
}
