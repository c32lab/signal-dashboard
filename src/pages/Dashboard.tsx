import KPIPanel from '../components/KPIPanel'
import LiveSignalFeed from '../components/LiveSignalFeed'
import SignalCards from '../components/SignalCards'
import CombinerWeights from '../components/CombinerWeights'
import DecisionTable from '../components/DecisionTable'
import LastUpdated from '../components/LastUpdated'
import SectionErrorBoundary from '../components/SectionErrorBoundary'
import TradingStatus from '../components/TradingStatus'
import ForecastPanel from '../components/forecast/ForecastPanel'
import SectionSkeleton from '../components/ui/SectionSkeleton'
import EmptyState from '../components/ui/EmptyState'
import { useOverview, useBias, useHealth, usePerformance, useAccuracy } from '../hooks/useApi'
import { HealthSummary, AlertsPanel, DecisionDistribution, SourceBias, PerformanceOverview, AccuracyKPI, AccuracyMiniTrend, RegimeStatus, StabilityCountdown, AccuracyDailySummary, AccuracyAutoReport, AccuracyAlertIndicator } from '../components/dashboard'

export default function Dashboard() {
  const { data } = useOverview()
  const biasRes = useBias()
  const healthRes = useHealth()
  const perfRes = usePerformance()
  const accuracyRes = useAccuracy()

  const biasData = biasRes.data
  const healthData = healthRes.data
  const perfData = perfRes.data
  const accuracyData = accuracyRes.data

  const anyError = biasRes.error || healthRes.error || perfRes.error || accuracyRes.error

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <LastUpdated dataVersion={data} />
      {anyError && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4 text-sm text-red-300">
          Some dashboard sections failed to load. Showing available data.
        </div>
      )}
      <SectionErrorBoundary title="Stability Countdown">
        <StabilityCountdown />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Market Regime">
        <RegimeStatus />
      </SectionErrorBoundary>
      {healthRes.isLoading && !healthData && (
        <SectionSkeleton label="alerts" />
      )}
      {healthData ? (
        <SectionErrorBoundary title="Alerts">
          <AlertsPanel data={healthData} />
        </SectionErrorBoundary>
      ) : !healthRes.isLoading && (
        <EmptyState message="No alerts data available" />
      )}
      {accuracyRes.isLoading && !accuracyData && (
        <SectionSkeleton label="accuracy" />
      )}
      {accuracyData ? (
        <>
        <SectionErrorBoundary title="Accuracy Alert">
          <AccuracyAlertIndicator />
        </SectionErrorBoundary>
        <SectionErrorBoundary title="Accuracy Auto Report">
          <AccuracyAutoReport />
        </SectionErrorBoundary>
        <SectionErrorBoundary title="Signal Accuracy">
          <AccuracyKPI data={accuracyData} />
        </SectionErrorBoundary>
        </>
      ) : !accuracyRes.isLoading && (
        <EmptyState message="No accuracy data available" />
      )}
      <SectionErrorBoundary title="Daily Accuracy Summary">
        <AccuracyDailySummary />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Accuracy Trend">
        <AccuracyMiniTrend />
      </SectionErrorBoundary>
      {healthRes.isLoading && !healthData && (
        <SectionSkeleton label="health" />
      )}
      {healthData ? (
        <SectionErrorBoundary title="Health Summary">
          <HealthSummary data={healthData} />
        </SectionErrorBoundary>
      ) : !healthRes.isLoading && (
        <EmptyState message="No health data available" />
      )}
      {perfRes.isLoading && !perfData && (
        <SectionSkeleton label="performance" />
      )}
      {perfData ? (
        <SectionErrorBoundary title="Performance Overview">
          <PerformanceOverview data={perfData} />
        </SectionErrorBoundary>
      ) : !perfRes.isLoading && (
        <EmptyState message="No performance data available" />
      )}
      <SectionErrorBoundary title="Live Signal Feed">
        <LiveSignalFeed />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="KPI Panel">
        <KPIPanel />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Trading Status">
        <TradingStatus />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Combiner Weights">
        <CombinerWeights />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Forecast Signal">
        <ForecastPanel />
      </SectionErrorBoundary>
      {biasRes.isLoading && !biasData && (
        <SectionSkeleton label="source bias" />
      )}
      {biasData ? (
        <SectionErrorBoundary title="Source Bias">
          <SourceBias data={biasData} />
        </SectionErrorBoundary>
      ) : !biasRes.isLoading && (
        <EmptyState message="No source bias data available" />
      )}
      <SectionErrorBoundary title="Decision Distribution">
        <DecisionDistribution />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Signal Cards">
        <SignalCards />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Decision History">
        <DecisionTable />
      </SectionErrorBoundary>
    </div>
  )
}
