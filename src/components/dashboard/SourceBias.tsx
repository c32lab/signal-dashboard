import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import type { BiasResponse } from '../../types'
import { TOOLTIP_STYLE } from './utils'

function biasColor(score: number): string {
  if (score > 0.05) return '#34d399'  // green-400 = long bias
  if (score < -0.05) return '#f87171' // red-400 = short bias
  return '#6b7280'                    // gray-500 = neutral
}

export function SourceBias({ data }: { data: BiasResponse }) {
  const entries = Object.entries(data.collectors ?? {}).map(([name, c]) => ({
    name,
    bias_score: c.bias_score,
  })).sort((a, b) => b.bias_score - a.bias_score)

  const overall = data.overall ?? (() => {
    const cols = Object.values(data.collectors ?? {})
    const total = cols.reduce((s, c) => s + c.total_signals, 0)
    const long_count = cols.reduce((s, c) => s + c.long_count, 0)
    const short_count = cols.reduce((s, c) => s + c.short_count, 0)
    const neutral_count = cols.reduce((s, c) => s + c.neutral_count, 0)
    return {
      long_pct: total ? (long_count / total) * 100 : 0,
      short_pct: total ? (short_count / total) * 100 : 0,
      neutral_pct: total ? (neutral_count / total) * 100 : 0,
      bias_score: total ? (long_count - short_count) / total : 0,
    }
  })()

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-2 sm:p-4">
      <div className="flex items-start justify-between mb-3 gap-2">
        <h2 className="text-sm font-semibold text-gray-200">Source Bias</h2>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-500">Overall:</span>
          <span
            className="font-mono font-bold"
            style={{ color: biasColor(overall.bias_score) }}
          >
            {overall.bias_score >= 0 ? '+' : ''}{overall.bias_score.toFixed(3)}
          </span>
          <span className="text-gray-600 hidden sm:inline">
            ({overall.long_pct.toFixed(1)}% L / {overall.short_pct.toFixed(1)}% S / {overall.neutral_pct.toFixed(1)}% N)
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={Math.max(140, entries.length * 36)}>
        <BarChart
          data={entries}
          layout="vertical"
          margin={{ top: 4, right: 12, bottom: 4, left: 4 }}
        >
          <XAxis
            type="number"
            domain={[-1, 1]}
            tickFormatter={(v: number) => v.toFixed(1)}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            width={90}
          />
          <Tooltip
            formatter={(value: number | undefined) => [
              `${(value ?? 0) >= 0 ? '+' : ''}${Number(value ?? 0).toFixed(3)}`,
              'Bias Score',
            ]}
            {...TOOLTIP_STYLE}
          />
          <ReferenceLine x={0} stroke="#374151" strokeWidth={1} />
          <Bar dataKey="bias_score" name="Bias Score" radius={[0, 4, 4, 0]}>
            {entries.map((entry) => (
              <Cell key={entry.name} fill={biasColor(entry.bias_score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}
