import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { Decision } from '../../types'
import { TOOLTIP_STYLE } from './utils'

export function DecisionDistribution({ decisions }: { decisions: Decision[] }) {
  if (!decisions.length) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <h2 className="text-sm font-semibold text-gray-200 mb-3">Decision Distribution (Last 50)</h2>
        <p className="text-sm text-gray-500">No decisions yet</p>
      </div>
    )
  }

  const recent = decisions.slice(0, 50)
  const counts: Record<string, { LONG: number; SHORT: number; HOLD: number }> = {}
  for (const d of recent) {
    if (!counts[d.symbol]) counts[d.symbol] = { LONG: 0, SHORT: 0, HOLD: 0 }
    const action = d.action as 'LONG' | 'SHORT' | 'HOLD'
    if (action in counts[d.symbol]) counts[d.symbol][action]++
  }

  const chartData = Object.entries(counts).map(([symbol, c]) => ({ symbol, ...c }))

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <h2 className="text-sm font-semibold text-gray-200 mb-3">Decision Distribution (Last 50)</h2>
      <ResponsiveContainer width="100%" height={Math.max(160, chartData.length * 40)}>
        <BarChart data={chartData} margin={{ top: 4, right: 12, bottom: 4, left: 8 }}>
          <XAxis
            dataKey="symbol"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip {...TOOLTIP_STYLE} />
          <Bar dataKey="LONG" stackId="a" fill="#34d399" radius={[0, 0, 0, 0]} />
          <Bar dataKey="SHORT" stackId="a" fill="#f87171" radius={[0, 0, 0, 0]} />
          <Bar dataKey="HOLD" stackId="a" fill="#6b7280" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}
