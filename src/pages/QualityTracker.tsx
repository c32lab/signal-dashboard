import { useState, useMemo, useEffect } from 'react'
import { usePerformance, useAccuracyTrend, useSignalQuality, useAccuracy, useConfidence } from '../hooks/useApi'
import type {
  PerformanceResponse,
  AccuracyTrendItem,
  SignalQualityResponse,
  AccuracyResponse,
} from '../types'
import LastUpdated from '../components/LastUpdated'
import CombinerWeights from '../components/CombinerWeights'
import SectionErrorBoundary from '../components/SectionErrorBoundary'
import {
  OverallSummary,
  AccuracyOverview,
  AccuracyLeaderboard,
  AccuracyTrend,
  SignalQualityTable,
  AccuracyTrendChart,
  SectionSkeleton,
  SectionError,
  ConfidenceDistribution,
} from '../components/quality'

export default function QualityTracker() {
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

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <LastUpdated dataVersion={perfRes.data} />
      {/* Accuracy Trend Chart */}
      <SectionErrorBoundary title="Accuracy Trend Chart">
        <AccuracyTrendChart />
      </SectionErrorBoundary>
      {/* Top row: Overall Summary + Accuracy Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {perfRes.isLoading ? (
          <SectionSkeleton text="Loading overall performance…" />
        ) : perfRes.error ? (
          <SectionError message={`Performance: ${perfRes.error.message}`} />
        ) : perfOverall ? (
          <SectionErrorBoundary title="Overall Performance">
            <OverallSummary overall={perfOverall} />
          </SectionErrorBoundary>
        ) : (
          <SectionSkeleton text="No overall data" />
        )}

        {accuracyRes.isLoading ? (
          <SectionSkeleton text="Loading accuracy overview…" />
        ) : accuracyRes.error ? (
          <SectionError message={`Accuracy: ${accuracyRes.error.message}`} />
        ) : accuracyData ? (
          <SectionErrorBoundary title="Accuracy Overview">
            <AccuracyOverview data={accuracyData} />
          </SectionErrorBoundary>
        ) : (
          <SectionSkeleton text="No accuracy data" />
        )}
      </div>

      {/* A: Leaderboard */}
      {perfRes.isLoading ? (
        <SectionSkeleton text="Loading leaderboard…" />
      ) : perfRes.error ? (
        <SectionError message={`Leaderboard: ${perfRes.error.message}`} />
      ) : perfData?.length ? (
        <SectionErrorBoundary title="Accuracy Leaderboard">
          <AccuracyLeaderboard data={perfData} />
        </SectionErrorBoundary>
      ) : (
        <SectionSkeleton text="No performance data" />
      )}

      {/* B: Trend */}
      {trendRes.isLoading ? (
        <SectionSkeleton text="Loading trend…" />
      ) : trendRes.error ? (
        <SectionError message={`Trend: ${trendRes.error.message}`} />
      ) : (
        <SectionErrorBoundary title="Accuracy Trend">
          <AccuracyTrend
            data={filteredTrendData}
            hours={trendHours}
            onHoursChange={setTrendHours}
          />
        </SectionErrorBoundary>
      )}

      {/* C: Signal Quality */}
      {qualityRes.isLoading ? (
        <SectionSkeleton text="Loading signal quality…" />
      ) : qualityRes.error ? (
        <SectionError message={`Quality: ${qualityRes.error.message}`} />
      ) : (
        <SectionErrorBoundary title="Signal Quality">
          <SignalQualityTable
            data={qualityData ?? []}
            hours={qualityHours}
            onHoursChange={setQualityHours}
          />
        </SectionErrorBoundary>
      )}

      {/* D: Combiner Weights */}
      <SectionErrorBoundary title="Combiner Weights">
        <CombinerWeights />
      </SectionErrorBoundary>

      {/* E: Confidence Distribution */}
      {confidenceRes.data && (
        <SectionErrorBoundary title="Confidence Distribution">
          <ConfidenceDistribution data={confidenceRes.data} />
        </SectionErrorBoundary>
      )}
    </div>
  )
}
