import type {
  Decision,
  DecisionsResponse,
  DecisionFilters,
  Signal,
  Overview,
  HealthResponse,
  Performance,
  ConfidenceData,
  SignalQuality,
  BacktestData,
} from '../types'

const BASE_URL = ''

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export const api = {
  health: () =>
    fetcher<HealthResponse>(`${BASE_URL}/api/health`),

  overview: () =>
    fetcher<Overview>(`${BASE_URL}/api/overview`),

  decisions: (params?: DecisionFilters) => {
    const qs = new URLSearchParams()
    if (params?.limit != null) qs.set('limit', String(params.limit))
    if (params?.offset != null) qs.set('offset', String(params.offset))
    if (params?.symbol) qs.set('symbol', params.symbol)
    if (params?.type) qs.set('type', params.type)
    if (params?.action) qs.set('action', params.action)
    const query = qs.toString()
    return fetcher<DecisionsResponse>(
      `${BASE_URL}/api/decisions${query ? `?${query}` : ''}`
    )
  },

  decision: (id: string | number) =>
    fetcher<Decision>(`${BASE_URL}/api/decisions/${id}`),

  signalsLatest: () =>
    fetcher<{ signals: Signal[] }>(`${BASE_URL}/api/signals/latest`).then(r => r.signals),

  performance: () =>
    fetcher<Performance>(`${BASE_URL}/api/performance`),

  confidence: () =>
    fetcher<ConfidenceData>(`${BASE_URL}/api/confidence`),

  signalQuality: (hours = 6) =>
    fetcher<SignalQuality>(`${BASE_URL}/api/signal_quality?hours=${hours}`),

  backtest: () =>
    fetcher<BacktestData>(`${BASE_URL}/api/backtest`),
}
