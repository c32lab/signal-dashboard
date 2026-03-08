import { useCollectorHealth, useHealth } from '../hooks/useApi'
import { CollectorStatus, HealthSummary, StabilityCountdown } from '../components/dashboard'
import CombinerWeights from '../components/CombinerWeights'
import SectionErrorBoundary from '../components/SectionErrorBoundary'

export default function SystemHealthPage() {
  const healthRes = useHealth()
  const collectorRes = useCollectorHealth()

  const healthData = healthRes.data
  const collectorData = collectorRes.data
  const isLoading = healthRes.isLoading || collectorRes.isLoading

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-xl font-bold text-gray-100">System Health</h1>
      <SectionErrorBoundary title="Stability Countdown">
        <StabilityCountdown />
      </SectionErrorBoundary>
      {isLoading && !healthData && !collectorData && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center text-gray-500 text-sm animate-pulse">
          Loading health data…
        </div>
      )}
      {healthData && (
        <SectionErrorBoundary title="System Health">
          <HealthSummary data={healthData} />
        </SectionErrorBoundary>
      )}
      {collectorData && (
        <SectionErrorBoundary title="Collector Status">
          <CollectorStatus data={collectorData} />
        </SectionErrorBoundary>
      )}
      <SectionErrorBoundary title="Combiner Weights">
        <CombinerWeights />
      </SectionErrorBoundary>
    </div>
  )
}
