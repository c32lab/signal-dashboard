import useSWR from 'swr'
import { predictApi } from '../api/predict'

const REFRESH_INTERVAL = 30_000

export function usePredictHealth() {
  return useSWR('predict/health', () => predictApi.health(), { refreshInterval: REFRESH_INTERVAL })
}

export function usePrediction() {
  return useSWR('predict/prediction', () => predictApi.prediction(), { refreshInterval: REFRESH_INTERVAL })
}

export function usePredictions(status = 'active', limit = 50) {
  return useSWR(
    ['predict/predictions', status, limit],
    () => predictApi.predictions({ status, limit }),
    { refreshInterval: REFRESH_INTERVAL }
  )
}

export function usePredictAccuracy() {
  return useSWR('predict/accuracy', () => predictApi.predictAccuracy(), {
    refreshInterval: REFRESH_INTERVAL,
  })
}

export function usePredictEvents(limit = 50, pattern?: string) {
  return useSWR(
    ['predict/events', limit, pattern],
    () => predictApi.events({ limit, pattern }),
    { refreshInterval: REFRESH_INTERVAL }
  )
}

export function useMacroHistory(limit = 100) {
  return useSWR(
    ['predict/macro/history', limit],
    () => predictApi.macroHistory(limit),
    { refreshInterval: REFRESH_INTERVAL }
  )
}

export function useTrends(limit = 20, min_events = 2, window_hours = 72) {
  return useSWR(
    ['predict/trends', limit, min_events, window_hours],
    () => predictApi.trends({ limit, min_events, window_hours }),
    { refreshInterval: REFRESH_INTERVAL }
  )
}

export function useIndustryChain() {
  return useSWR('predict/industry-chain', () => predictApi.industryChain(), {
    refreshInterval: REFRESH_INTERVAL,
  })
}

export function useOpenInterest(symbol = 'BTC/USDT', limit = 24) {
  return useSWR(
    ['predict/open-interest', symbol, limit],
    () => predictApi.openInterest(symbol, limit),
    { refreshInterval: REFRESH_INTERVAL }
  )
}

export function useLongShortRatio(symbol = 'BTC/USDT', limit = 24) {
  return useSWR(
    ['predict/long-short-ratio', symbol, limit],
    () => predictApi.longShortRatio(symbol, limit),
    { refreshInterval: REFRESH_INTERVAL }
  )
}

export function useTakerVolume(symbol = 'BTC/USDT', limit = 24) {
  return useSWR(
    ['predict/taker-volume', symbol, limit],
    () => predictApi.takerVolume(symbol, limit),
    { refreshInterval: REFRESH_INTERVAL }
  )
}
