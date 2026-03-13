import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import type { PerformanceResponse } from '../../types'
import { TOOLTIP_STYLE } from './utils'

function accuracyColor(pct: number): string {
  if (pct > 50) return '#34d399'  // green-400
  if (pct >= 40) return '#fbbf24' // yellow-400
  return '#f87171'                // red-400
}

function pnlColor(pct: number): string {
  return pct >= 0 ? '#34d399' : '#f87171'
}

export function PerformanceOverview({ data }: { data: PerformanceResponse }) {
  const { overall, by_symbol } = data
  const sorted = [...by_symbol].sort((a, b) => b.accuracy_pct - a.accuracy_pct)

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-2 sm:p-4 flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-gray-200">Performance Overview</h2>

      {/* Overall stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gray-800 rounded-lg p-3 flex flex-col gap-1">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Total Decisions</span>
          <span className="text-lg font-mono font-semibold text-gray-200">{overall.total}</span>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 flex flex-col gap-1">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Overall Accuracy</span>
          <span
            className="text-lg font-mono font-semibold"
            style={{ color: accuracyColor(overall.accuracy_pct) }}
          >
            {overall.accuracy_pct.toFixed(1)}%
          </span>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 flex flex-col gap-1">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Avg PnL</span>
          <span
            className="text-lg font-mono font-semibold"
            style={{ color: pnlColor(overall.avg_pnl_pct) }}
          >
            {overall.avg_pnl_pct >= 0 ? '+' : ''}{overall.avg_pnl_pct.toFixed(3)}%
          </span>
        </div>
      </div>

      {/* Accuracy bar chart */}
      <ResponsiveContainer width="100%" height={Math.max(120, sorted.length * 32)}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 4, right: 12, bottom: 4, left: 4 }}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v: number) => `${v}%`}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="symbol"
            tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            width={72}
          />
          <Tooltip
            formatter={(value) => [`${Number(value ?? 0).toFixed(1)}%`, 'Accuracy']}
            {...TOOLTIP_STYLE}
          />
          <ReferenceLine x={50} stroke="#374151" strokeWidth={1} strokeDasharray="4 2" />
          <Bar dataKey="accuracy_pct" name="Accuracy" radius={[0, 4, 4, 0]}>
            {sorted.map((entry) => (
              <Cell key={entry.symbol} fill={accuracyColor(entry.accuracy_pct)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Per-symbol table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 uppercase tracking-wide border-b border-gray-800">
              <th className="text-left py-1.5 pr-3 font-medium">Symbol</th>
              <th className="text-right py-1.5 pr-3 font-medium">Total</th>
              <th className="text-right py-1.5 pr-3 font-medium">Correct</th>
              <th className="text-right py-1.5 pr-3 font-medium">Accuracy</th>
              <th className="text-right py-1.5 font-medium">Avg PnL</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.symbol} className="border-b border-gray-800/50 last:border-0">
                <td className="py-1.5 pr-3 font-mono text-gray-300">{row.symbol}</td>
                <td className="py-1.5 pr-3 text-right font-mono text-gray-400">{row.total}</td>
                <td className="py-1.5 pr-3 text-right font-mono text-gray-400">{row.correct}</td>
                <td
                  className="py-1.5 pr-3 text-right font-mono font-semibold"
                  style={{ color: accuracyColor(row.accuracy_pct) }}
                >
                  {row.accuracy_pct.toFixed(1)}%
                </td>
                <td
                  className="py-1.5 text-right font-mono font-semibold"
                  style={{ color: pnlColor(row.avg_pnl_pct) }}
                >
                  {row.avg_pnl_pct >= 0 ? '+' : ''}{row.avg_pnl_pct.toFixed(3)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
