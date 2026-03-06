import { useState, useEffect } from 'react'
import KPIPanel from '../components/KPIPanel'
import LiveSignalFeed from '../components/LiveSignalFeed'
import SignalCards from '../components/SignalCards'
import CombinerWeights from '../components/CombinerWeights'
import DecisionTable from '../components/DecisionTable'
import LastUpdated from '../components/LastUpdated'
import SectionErrorBoundary from '../components/SectionErrorBoundary'
import { useOverview, useBias, useCollectorHealth, useStatus, useHealth } from '../hooks/useApi'
import { HealthSummary, AlertsPanel, CollectorStatus, DecisionDistribution, SourceBias } from '../components/dashboard'

export default function Dashboard() {
  const { data } = useOverview()
  const biasRes = useBias()
  const collectorRes = useCollectorHealth()
  const statusRes = useStatus()
  const healthRes = useHealth()
  const [lastUpdated, setLastUpdated] = useState<Date>()

  useEffect(() => {
    if (data) setLastUpdated(new Date())
  }, [data])

  const biasData = biasRes.data
  const collectorData = collectorRes.data
  const statusData = statusRes.data
  const healthData = healthRes.data

  return (
    <div className="flex flex-col gap-4 sm:gap-8 py-2 sm:py-6">
      <div className="px-2 sm:px-6">
        <LastUpdated timestamp={lastUpdated} />
      </div>
      {statusData && (
        <div className="px-2 sm:px-6">
          <AlertsPanel data={statusData} />
        </div>
      )}
      {healthData && (
        <div className="px-2 sm:px-6">
          <HealthSummary data={healthData} />
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
      {collectorData && (
        <div className="px-2 sm:px-6">
          <SectionErrorBoundary title="Collector Status">
            <CollectorStatus data={collectorData} />
          </SectionErrorBoundary>
        </div>
      )}
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
