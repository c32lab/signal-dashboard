import type {
  Decision,
  DecisionsResponse,
  DecisionFilters,
  Signal,
  Overview,
  HealthResponse,
  PerformanceResponse,
  ConfidenceData,
  SignalQualityResponse,
  AccuracyTrendItem,
  AccuracyResponse,
  AccuracySummaryResponse,
  CombinerWeightsResponse,
  BiasResponse,
  CollectorHealthResponse,
} from '../types'
import { normalizeBacktestResults } from '../utils/backtestNormalizer'
import type { TradingSummary } from '../types/trading'

const BASE_URL = import.meta.env.VITE_SIGNAL_API_URL || ''

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
    if (params?.direction) qs.set('direction', params.direction)
    if (params?.from) qs.set('from', params.from)
    if (params?.to) qs.set('to', params.to)
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
    fetcher<PerformanceResponse>(`${BASE_URL}/api/performance`),

  confidence: () =>
    fetcher<ConfidenceData>(`${BASE_URL}/api/confidence`),

  signalQuality: (hours = 6) =>
    fetcher<SignalQualityResponse>(`${BASE_URL}/api/signal_quality?hours=${hours}`),

  accuracyTrend: (hours = 24) =>
    fetcher<{ trend: AccuracyTrendItem[] }>(`${BASE_URL}/api/accuracy/trend?hours=${hours}`).then(r => r.trend),

  accuracy: () =>
    fetcher<AccuracyResponse>(`${BASE_URL}/api/accuracy`),

  accuracySummary: () =>
    fetcher<AccuracySummaryResponse>(`${BASE_URL}/api/accuracy/summary`),

  backtest: () =>
    fetcher<{ results: unknown[] }>(`${BASE_URL}/api/backtest`).then(raw => ({
      results: normalizeBacktestResults(raw.results ?? []),
    })),

  combinerWeights: () =>
    fetcher<CombinerWeightsResponse>(`${BASE_URL}/api/combiner_weights`),

  bias: () =>
    fetcher<BiasResponse>(`${BASE_URL}/api/bias`),

  collectorHealth: () =>
    fetcher<CollectorHealthResponse>(`${BASE_URL}/api/collector-health`),

  tradingSummary: () =>
    fetcher<TradingSummary>(`${BASE_URL}/api/trading/summary`),
}
