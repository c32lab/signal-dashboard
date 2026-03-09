import { useCollectorHealth, useHealth } from '../hooks/useApi'
import { CollectorStatus, HealthSummary, StabilityCountdown } from '../components/dashboard'
import CombinerWeights from '../components/CombinerWeights'
import FrontendHealthPanel from '../components/dashboard/FrontendHealthPanel'
import SectionErrorBoundary from '../components/SectionErrorBoundary'

export default function SystemHealthPage() {
  const healthRes = useHealth()
  const collectorRes = useCollectorHealth()

  const healthData = healthRes.data
  const collectorData = collectorRes.data
  const isLoading = healthRes.isLoading || collectorRes.isLoading
  const error = healthRes.error || collectorRes.error

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
      {error && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4 text-sm text-red-300">
          Failed to load health data: {error.message ?? 'Unknown error'}
        </div>
      )}
      {healthData ? (
        <SectionErrorBoundary title="System Health">
          <HealthSummary data={healthData} />
        </SectionErrorBoundary>
      ) : !isLoading && !error && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center text-gray-500 text-sm">
          No health data available
        </div>
      )}
      {collectorData ? (
        <SectionErrorBoundary title="Collector Status">
          <CollectorStatus data={collectorData} />
        </SectionErrorBoundary>
      ) : !isLoading && !error && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center text-gray-500 text-sm">
          No collector data available
        </div>
      )}
      <SectionErrorBoundary title="Combiner Weights">
        <CombinerWeights />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Frontend Health">
        <FrontendHealthPanel />
      </SectionErrorBoundary>
    </div>
  )
}
