import { useState, useMemo, useEffect } from 'react'
import { usePerformance, useAccuracyTrend, useSignalQuality, useAccuracy, useConfidence } from '../../hooks/useApi'
import type {
  PerformanceResponse,
  AccuracyTrendItem,
  SignalQualityResponse,
  AccuracyResponse,
} from '../../types'

export function useQualityPageData() {
  const [trendHours, setTrendHours] = useState(24)
  const [qualityHours, setQualityHours] = useState(6)

  const perfRes = usePerformance()
  const trendRes = useAccuracyTrend()
  const qualityRes = useSignalQuality(qualityHours)
  const accuracyRes = useAccuracy()
  const confidenceRes = useConfidence()

  const perfData = (perfRes.data as PerformanceResponse | undefined)?.by_symbol
  const perfOverall = (perfRes.data as PerformanceResponse | undefined)?.overall
  const trendData = trendRes.data as AccuracyTrendItem[] | undefined

  const [nowMinute, setNowMinute] = useState(() => Math.floor(Date.now() / 60000) * 60000)
  useEffect(() => {
    const id = setInterval(() => setNowMinute(Math.floor(Date.now() / 60000) * 60000), 60_000)
    return () => clearInterval(id)
  }, [])

  const filteredTrendData = useMemo<AccuracyTrendItem[]>(() => {
    if (!trendData) return []
    const cutoff = new Date(nowMinute - trendHours * 3600000)
    return trendData.filter((d) => new Date(d.hour) >= cutoff)
  }, [trendData, trendHours, nowMinute])

  const qualityData = useMemo(() => {
    const bySymbol = (qualityRes.data as SignalQualityResponse | undefined)?.by_symbol
    if (!bySymbol) return []
    return Object.entries(bySymbol).map(([symbol, counts]) => ({
      symbol,
      long: counts.long,
      short: counts.short,
      hold: counts.hold,
    }))
  }, [qualityRes.data])

  const accuracyData = accuracyRes.data as AccuracyResponse | undefined

  return {
    perfRes,
    trendRes,
    qualityRes,
    accuracyRes,
    confidenceRes,
    perfData,
    perfOverall,
    filteredTrendData,
    qualityData,
    accuracyData,
    trendHours,
    setTrendHours,
    qualityHours,
    setQualityHours,
  }
}
