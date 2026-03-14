import TradeFlowChart from './TradeFlowChart'
import LargeOrderAlerts from './LargeOrderAlerts'
import CvdDivergenceChart from './CvdDivergenceChart'

export default function OrderbookPanel() {
  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-4 py-3">
        <span className="text-sm font-semibold text-gray-200">Orderbook Signals</span>
      </div>
      <div className="px-4 pb-4 space-y-6">
        <TradeFlowChart />
        <LargeOrderAlerts />
        <CvdDivergenceChart />
      </div>
    </section>
  )
}
