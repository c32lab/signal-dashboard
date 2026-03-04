import type {
  PredictionOverview,
  Prediction,
  Event,
  Trend,
  IndustryChain,
  MacroSnapshot,
} from '../types/predict'

const BASE = '/predict-api'

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export const predictApi = {
  health: () =>
    fetcher<{ status: string }>(`${BASE}/api/health`),

  prediction: () =>
    fetcher<PredictionOverview>(`${BASE}/api/prediction`),

  predictions: (params?: { status?: string; limit?: number }) => {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    if (params?.limit != null) qs.set('limit', String(params.limit))
    return fetcher<Prediction[]>(`${BASE}/api/predictions?${qs}`)
  },

  events: (params?: { limit?: number; pattern?: string }) => {
    const qs = new URLSearchParams()
    if (params?.limit != null) qs.set('limit', String(params.limit))
    if (params?.pattern) qs.set('pattern', params.pattern)
    return fetcher<Event[]>(`${BASE}/api/events?${qs}`)
  },

  macroHistory: (limit = 100) =>
    fetcher<MacroSnapshot[]>(`${BASE}/api/macro/history?limit=${limit}`),

  trends: (params?: { limit?: number; min_events?: number; window_hours?: number }) => {
    const qs = new URLSearchParams()
    if (params?.limit != null) qs.set('limit', String(params.limit))
    if (params?.min_events != null) qs.set('min_events', String(params.min_events))
    if (params?.window_hours != null) qs.set('window_hours', String(params.window_hours))
    return fetcher<Trend[]>(`${BASE}/api/trends?${qs}`)
  },

  industryChain: () =>
    fetcher<IndustryChain>(`${BASE}/api/industry-chain`),

  eventMatch: (text: string, top_k = 3, threshold = 0.2) =>
    fetcher<Event[]>(
      `${BASE}/api/event-match?text=${encodeURIComponent(text)}&top_k=${top_k}&threshold=${threshold}`
    ),

  eventChainLinks: (event_id: number) =>
    fetcher<unknown>(`${BASE}/api/event-chain-links?event_id=${event_id}`),
}
