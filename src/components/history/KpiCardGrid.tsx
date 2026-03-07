import KpiCard from './KpiCard'
import { accColor, pnlColor, pnlStr } from './utils'

interface OverallPerf {
  total: number
  accuracy_pct: number
  avg_pnl_pct: number
}

export default function KpiCardGrid({
  overall,
  activeSignals,
}: {
  overall: OverallPerf | undefined
  activeSignals: number | null
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
      <KpiCard
        label="Total Trades"
        value={overall ? String(overall.total) : '—'}
      />
      <KpiCard
        label="Win Rate"
        value={overall ? `${overall.accuracy_pct.toFixed(1)}%` : '—'}
        color={accColor(overall?.accuracy_pct)}
      />
      <KpiCard
        label="Avg PnL"
        value={overall ? pnlStr(overall.avg_pnl_pct) : '—'}
        color={pnlColor(overall?.avg_pnl_pct)}
      />
      <KpiCard
        label="Active Signals"
        value={activeSignals != null ? String(activeSignals) : '—'}
        color="text-blue-400"
      />
    </div>
  )
}
