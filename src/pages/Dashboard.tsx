import KPIPanel from '../components/KPIPanel'
import LiveSignalFeed from '../components/LiveSignalFeed'
import SignalCards from '../components/SignalCards'
import CombinerWeights from '../components/CombinerWeights'
import DecisionTable from '../components/DecisionTable'
import LastUpdated from '../components/LastUpdated'
import SectionErrorBoundary from '../components/SectionErrorBoundary'
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
    <div className="flex flex-col gap-4 sm:gap-8 py-2 sm:py-6">
      <div className="px-2 sm:px-6">
        <LastUpdated dataVersion={data} />
      </div>
      {healthData && (
        <div className="px-2 sm:px-6">
          <AlertsPanel data={healthData} />
        </div>
      )}
      {accuracyData && (
        <div className="px-2 sm:px-6">
          <SectionErrorBoundary title="Signal Accuracy">
            <AccuracyKPI data={accuracyData} />
          </SectionErrorBoundary>
        </div>
      )}
      <div className="px-2 sm:px-6">
        <SectionErrorBoundary title="Accuracy Trend">
          <AccuracyMiniTrend />
        </SectionErrorBoundary>
      </div>
      {healthData && (
        <div className="px-2 sm:px-6">
          <HealthSummary data={healthData} />
        </div>
      )}
      {perfData && (
        <div className="px-2 sm:px-6">
          <SectionErrorBoundary title="Performance Overview">
            <PerformanceOverview data={perfData} />
          </SectionErrorBoundary>
        </div>
      )}
      <div className="px-2 sm:px-6">
        <SectionErrorBoundary title="Live Signal Feed">
          <LiveSignalFeed />
        </SectionErrorBoundary>
      </div>
      <SectionErrorBoundary title="KPI Panel">
        <KPIPanel />
      </SectionErrorBoundary>
      <div className="px-2 sm:px-6">
        <SectionErrorBoundary title="Combiner Weights">
          <CombinerWeights />
        </SectionErrorBoundary>
      </div>
      {biasData && (
        <div className="px-2 sm:px-6">
          <SectionErrorBoundary title="Source Bias">
            <SourceBias data={biasData} />
          </SectionErrorBoundary>
        </div>
      )}
      <div className="px-2 sm:px-6">
        <SectionErrorBoundary title="Decision Distribution">
          <DecisionDistribution />
        </SectionErrorBoundary>
      </div>
      <SectionErrorBoundary title="Signal Cards">
        <SignalCards />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Decision History">
        <DecisionTable />
      </SectionErrorBoundary>
    </div>
  )
}
