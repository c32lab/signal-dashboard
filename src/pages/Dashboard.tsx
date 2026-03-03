import KPIPanel from '../components/KPIPanel'
import SignalCards from '../components/SignalCards'
import DecisionTable from '../components/DecisionTable'

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8 py-6">
      <KPIPanel />
      <SignalCards />
      <DecisionTable />
    </div>
  )
}
