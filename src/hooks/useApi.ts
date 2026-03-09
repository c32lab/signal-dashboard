import useSWR from 'swr'
import { api } from '../api'
import type { DecisionFilters } from '../types'
import type { BacktestResponse } from '../types/backtest'
import type { TradingSummary } from '../types/trading'

const REFRESH_INTERVAL = 30_000

export function useHealth() {
  return useSWR('health', () => api.health(), { refreshInterval: REFRESH_INTERVAL })
}

export function useOverview() {
  return useSWR('overview', () => api.overview(), { refreshInterval: REFRESH_INTERVAL })
}

export function useDecisions(params?: DecisionFilters) {
  const key = ['decisions', JSON.stringify(params ?? {})]
  return useSWR(key, () => api.decisions(params), { refreshInterval: REFRESH_INTERVAL })
}

export function useSignalsLatest() {
  return useSWR('signals/latest', () => api.signalsLatest(), { refreshInterval: REFRESH_INTERVAL })
}

export function usePerformance() {
  return useSWR('performance', () => api.performance(), { refreshInterval: REFRESH_INTERVAL })
}

export function useConfidence() {
  return useSWR('confidence', () => api.confidence(), { refreshInterval: REFRESH_INTERVAL })
}

export function useSignalQuality(hours = 6) {
  return useSWR(['signal_quality', hours], () => api.signalQuality(hours), { refreshInterval: REFRESH_INTERVAL })
}

export function useAccuracyTrend() {
  return useSWR('accuracy/trend', () => api.accuracyTrend(24), { refreshInterval: 60_000 })
}

export function useAccuracyTrendWeekly() {
  return useSWR('accuracy/trend/weekly', () => api.accuracyTrend(336), { refreshInterval: 60_000 })
}

export function useAccuracy() {
  return useSWR('accuracy', () => api.accuracy(), { refreshInterval: REFRESH_INTERVAL })
}

export function useAccuracySummary() {
  return useSWR('accuracy/summary', () => api.accuracySummary(), { refreshInterval: 60_000 })
}

export function useBacktest() {
  return useSWR<BacktestResponse>('backtest', () => api.backtest(), { refreshInterval: 60_000 })
}

export function useCombinerWeights() {
  return useSWR('combiner_weights', () => api.combinerWeights(), { refreshInterval: REFRESH_INTERVAL })
}

export function useBias() {
  return useSWR('bias', () => api.bias(), { refreshInterval: REFRESH_INTERVAL })
}

export function useCollectorHealth() {
  return useSWR('collector-health', () => api.collectorHealth(), { refreshInterval: REFRESH_INTERVAL })
}

export function useTradingSummary() {
  return useSWR<TradingSummary>('trading/summary', () => api.tradingSummary(), { refreshInterval: 10_000 })
}

export function useRecentDecisions(minutes: number) {
  return useSWR(
    ['recent-decisions', minutes],
    () => {
      const from = new Date(Date.now() - minutes * 60_000).toISOString()
      return api.decisions({ limit: 50, from })
    },
    { refreshInterval: 15_000 },
  )
}
