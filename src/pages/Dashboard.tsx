import { useState, useEffect } from 'react'
import KPIPanel from '../components/KPIPanel'
import SignalCards from '../components/SignalCards'
import CombinerWeights from '../components/CombinerWeights'
import DecisionTable from '../components/DecisionTable'
import LastUpdated from '../components/LastUpdated'
import { useOverview } from '../hooks/useApi'

export default function Dashboard() {
  const { data } = useOverview()
  const [lastUpdated, setLastUpdated] = useState<Date>()

  useEffect(() => {
    if (data) setLastUpdated(new Date())
  }, [data])

  return (
    <div className="flex flex-col gap-8 py-6">
      <div className="px-6">
        <LastUpdated timestamp={lastUpdated} />
      </div>
      <KPIPanel />
      <div className="px-6">
        <CombinerWeights />
      </div>
      <SignalCards />
      <DecisionTable />
    </div>
  )
}
