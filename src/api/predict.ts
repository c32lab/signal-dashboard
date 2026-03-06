import type {
  PredictionOverview,
  Prediction,
  PredictionDetail,
  Event,
  Trend,
  IndustryChain,
  MacroSnapshot,
  OpenInterestPoint,
  LongShortRatioPoint,
  TakerVolumePoint,
  PredictAccuracyResponse,
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

  predictions: (params?: { status?: string; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    if (params?.limit != null) qs.set('limit', String(params.limit))
    if (params?.offset != null) qs.set('offset', String(params.offset))
    return fetcher<{ predictions: Prediction[]; total: number }>(`${BASE}/api/predictions?${qs}`)
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

  predictAccuracy: () =>
    fetcher<PredictAccuracyResponse>(`${BASE}/api/predict-accuracy`),

  predictionDetail: (id: number) =>
    fetcher<PredictionDetail>(`${BASE}/api/predictions/${id}`),

  // Derivatives data from data-eng API (via /data-api proxy → localhost:8081)
  openInterest: (symbol = 'BTC/USDT', limit = 24) =>
    fetcher<OpenInterestPoint[]>(`/data-api/api/open-interest?symbol=${encodeURIComponent(symbol)}&limit=${limit}`),

  longShortRatio: (symbol = 'BTC/USDT', limit = 24) =>
    fetcher<LongShortRatioPoint[]>(`/data-api/api/long-short-ratio?symbol=${encodeURIComponent(symbol)}&limit=${limit}`),

  takerVolume: (symbol = 'BTC/USDT', limit = 24) =>
    fetcher<TakerVolumePoint[]>(`/data-api/api/taker-volume?symbol=${encodeURIComponent(symbol)}&limit=${limit}`),
}
