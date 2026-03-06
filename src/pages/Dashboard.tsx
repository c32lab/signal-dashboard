import KPIPanel from '../components/KPIPanel'
import LiveSignalFeed from '../components/LiveSignalFeed'
import SignalCards from '../components/SignalCards'
import CombinerWeights from '../components/CombinerWeights'
import DecisionTable from '../components/DecisionTable'
import LastUpdated from '../components/LastUpdated'
import SectionErrorBoundary from '../components/SectionErrorBoundary'
import TradingStatus from '../components/TradingStatus'
import { useOverview, useBias, useHealth, usePerformance, useAccuracy } from '../hooks/useApi'
import { HealthSummary, AlertsPanel, DecisionDistribution, SourceBias, PerformanceOverview, AccuracyKPI, AccuracyMiniTrend } from '../components/dashboard'

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

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <LastUpdated dataVersion={data} />
      {healthData && (
        <AlertsPanel data={healthData} />
      )}
      {accuracyData && (
        <SectionErrorBoundary title="Signal Accuracy">
          <AccuracyKPI data={accuracyData} />
        </SectionErrorBoundary>
      )}
      <SectionErrorBoundary title="Accuracy Trend">
        <AccuracyMiniTrend />
      </SectionErrorBoundary>
      {healthData && (
        <HealthSummary data={healthData} />
      )}
      {perfData && (
        <SectionErrorBoundary title="Performance Overview">
          <PerformanceOverview data={perfData} />
        </SectionErrorBoundary>
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
      {biasData && (
        <SectionErrorBoundary title="Source Bias">
          <SourceBias data={biasData} />
        </SectionErrorBoundary>
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
