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
  AccuracyAutoReport,
  AccuracyWeekComparison,
} from '../components/quality'
import { AccuracyWeeklyTrend } from '../components/dashboard'
import { useQualityPageData } from '../components/quality/useQualityPageData'

export default function QualityTracker() {
  const {
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
  } = useQualityPageData()

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <LastUpdated dataVersion={perfRes.data} />
      <SectionErrorBoundary title="Accuracy Auto Report">
        <AccuracyAutoReport />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Week-over-Week Comparison">
        <AccuracyWeekComparison />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Weekly Accuracy Trend">
        <AccuracyWeeklyTrend />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Accuracy Trend Chart">
        <AccuracyTrendChart />
      </SectionErrorBoundary>
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

      <SectionErrorBoundary title="Combiner Weights">
        <CombinerWeights />
      </SectionErrorBoundary>

      {confidenceRes.isLoading ? (
        <SectionSkeleton text="Loading confidence distribution…" />
      ) : confidenceRes.error ? (
        <SectionError message={`Confidence: ${confidenceRes.error.message}`} />
      ) : confidenceRes.data ? (
        <SectionErrorBoundary title="Confidence Distribution">
          <ConfidenceDistribution data={confidenceRes.data} />
        </SectionErrorBoundary>
      ) : (
        <SectionSkeleton text="No confidence data available" />
      )}
    </div>
  )
}
