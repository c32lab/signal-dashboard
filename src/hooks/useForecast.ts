import useSWR from 'swr'
import { predictApi } from '../api/predict'
import type { PredictPredictionRaw } from '../api/predict'
import type { ForecastPanelData, ForecastSignal, ForecastPrediction, PredictAccuracy } from '../types'

function transformPredictions(raw: PredictPredictionRaw[]): ForecastSignal[] {
  const bySymbol = new Map<string, PredictPredictionRaw[]>()
  for (const p of raw) {
    const list = bySymbol.get(p.symbol) ?? []
    list.push(p)
    bySymbol.set(p.symbol, list)
  }

  const signals: ForecastSignal[] = []
  for (const [symbol, preds] of bySymbol) {
    // Aggregate direction by confidence-weighted vote
    const directionWeights: Record<string, number> = { LONG: 0, SHORT: 0, NEUTRAL: 0 }
    let maxConfidence = 0
    for (const p of preds) {
      directionWeights[p.direction] = (directionWeights[p.direction] ?? 0) + p.confidence
      if (p.confidence > maxConfidence) maxConfidence = p.confidence
    }

    let direction: 'LONG' | 'SHORT' | 'NEUTRAL' = 'NEUTRAL'
    let maxWeight = 0
    for (const [dir, weight] of Object.entries(directionWeights)) {
      if (weight > maxWeight) {
        maxWeight = weight
        direction = dir as 'LONG' | 'SHORT' | 'NEUTRAL'
      }
    }

    const predictions: ForecastPrediction[] = preds.map(p => ({
      id: p.id,
      symbol: p.symbol,
      direction: p.direction,
      confidence: p.confidence,
      trigger_pattern: p.trigger_pattern,
      trigger_event: p.trigger_event,
      expected_impact: p.expected_impact,
      expected_horizon: p.expected_horizon,
      timestamp: p.timestamp,
    }))

    signals.push({
      symbol,
      direction,
      confidence: maxConfidence,
      prediction_count: preds.length,
      predictions,
    })
  }

  // Sort by confidence descending
  signals.sort((a, b) => b.confidence - a.confidence)
  return signals
}

export function useForecastPanel() {
  const predictions = useSWR('predict/active', () => predictApi.activePredictions(), {
    refreshInterval: 30_000,
    shouldRetryOnError: false,
  })
  const accuracy = useSWR('predict/accuracy', () => predictApi.accuracy(), {
    refreshInterval: 60_000,
    shouldRetryOnError: false,
  })
  const health = useSWR('predict/health', () => predictApi.health(), {
    refreshInterval: 15_000,
    shouldRetryOnError: false,
  })

  const isLoading = predictions.isLoading || accuracy.isLoading || health.isLoading
  const error = predictions.error ?? accuracy.error ?? health.error

  const isConnected = !health.error && !!health.data
  const bridgeStatus: ForecastPanelData['bridge_status'] = health.error
    ? 'disconnected'
    : health.data?.status === 'degraded'
      ? 'degraded'
      : 'connected'

  const signals = predictions.data
    ? transformPredictions(predictions.data.predictions)
    : []

  const acc: PredictAccuracy = accuracy.data
    ? {
        '1d': accuracy.data.overall.accuracy_1d,
        '3d': accuracy.data.overall.accuracy_3d,
        '7d': accuracy.data.overall.accuracy_7d,
      }
    : { '1d': 0, '3d': 0, '7d': 0 }

  const data: ForecastPanelData | undefined = isLoading
    ? undefined
    : {
        signals: isConnected ? signals : [],
        accuracy: acc,
        bridge_status: bridgeStatus,
        last_sync: new Date().toISOString(),
      }

  return { data, error, isLoading }
}
