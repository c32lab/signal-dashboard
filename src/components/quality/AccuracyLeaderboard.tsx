import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { PerformanceSymbol } from '../../types'
import { validatePercent, validatePnL } from '../../utils/dataValidation'
import DataWarning from '../DataWarning'
import { TOOLTIP_STYLE, accuracyColor, pnlColor, pnlStr } from './utils'

export default function AccuracyLeaderboard({ data }: { data: PerformanceSymbol[] }) {
  const sorted = [...data]
    .map((entry) => ({
      ...entry,
      accuracy_pct: entry.accuracy_pct != null && !isNaN(entry.accuracy_pct)
        ? entry.accuracy_pct
        : entry.total > 0 ? (entry.correct / entry.total) * 100 : 0,
    }))
    .sort((a, b) => b.accuracy_pct - a.accuracy_pct)

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <h2 className="text-sm font-semibold text-gray-200 mb-4">Accuracy Leaderboard</h2>
      <ResponsiveContainer width="100%" height={Math.max(180, sorted.length * 44)}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 4, right: 16, bottom: 4, left: 4 }}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="symbol"
            tickFormatter={(v: string) => v.replace('/USDT', '')}
            tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip
            formatter={(value: number | undefined) => [`${Number(value ?? 0).toFixed(1)}%`, 'Accuracy']}
            {...TOOLTIP_STYLE}
          />
          <Bar dataKey="accuracy_pct" name="Accuracy" radius={[0, 4, 4, 0]} fill="#6b7280" isAnimationActive={false}>
            {sorted.map((entry) => (
              <Cell
                key={entry.symbol}
                fill={accuracyColor(entry.accuracy_pct)}
                fillOpacity={entry.total < 5 ? 0.5 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-xs min-w-[600px]">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="text-left py-2 px-3">Symbol</th>
              <th className="text-right py-2 px-3">Accuracy</th>
              <th className="text-right py-2 px-3">Correct / Total</th>
              <th className="text-right py-2 px-3">Avg PnL</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const accVal = validatePercent(row.accuracy_pct, 'Accuracy')
              const pnlVal = row.avg_pnl_pct != null ? validatePnL(row.avg_pnl_pct) : { valid: true }
              const hasAnomaly = !accVal.valid || !pnlVal.valid
              const lowSample = row.total < 5
              return (
                <tr
                  key={row.symbol}
                  className={`border-b border-gray-800/50 ${hasAnomaly ? 'bg-red-900/20' : ''} ${lowSample ? 'text-gray-600' : ''}`}
                >
                  <td className={`py-1.5 px-3 font-semibold ${lowSample ? 'text-gray-600' : 'text-gray-200'}`}>
                    {row.symbol.replace('/USDT', '')}
                  </td>
                  <td
                    className="py-1.5 px-3 text-right font-mono font-bold"
                    style={{ color: lowSample ? '#4b5563' : accuracyColor(row.accuracy_pct) }}
                  >
                    {row.accuracy_pct.toFixed(1)}%
                    {row.total < 10 && (
                      <span className="ml-1 text-gray-500 font-normal text-[10px]">(n={row.total})</span>
                    )}
                    {!accVal.valid && <DataWarning message={accVal.warning!} />}
                  </td>
                  <td className={`py-1.5 px-3 text-right ${lowSample ? 'text-gray-600' : 'text-gray-400'}`}>
                    {row.correct} / {row.total}
                  </td>
                  <td className={`py-1.5 px-3 text-right font-mono ${lowSample ? 'text-gray-600' : pnlColor(row.avg_pnl_pct)}`}>
                    {pnlStr(row.avg_pnl_pct)}
                    {!pnlVal.valid && <DataWarning message={pnlVal.warning!} />}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
