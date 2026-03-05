import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts'
import { useCombinerWeights } from '../hooks/useApi'

interface WeightEntry {
  source: string
  weight: number
  disabled: boolean
}

function weightColor(weight: number): string {
  if (weight === 0) return '#4b5563' // gray-600
  if (weight >= 0.3) return '#22d3ee' // cyan-400
  if (weight >= 0.2) return '#60a5fa' // blue-400
  if (weight >= 0.1) return '#a78bfa' // violet-400
  return '#6b7280' // gray-500
}

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#111827',
    border: '1px solid #374151',
    borderRadius: 6,
    fontSize: 12,
  },
  labelStyle: { color: '#9ca3af' },
  itemStyle: { color: '#e5e7eb' },
}

export default function CombinerWeights() {
  const { data, error, isLoading } = useCombinerWeights()

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center text-gray-500 text-sm">
        Loading combiner weights…
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center text-red-400 text-sm">
        Combiner Weights: {error.message}
      </div>
    )
  }

  if (!data?.weights || Object.keys(data.weights).length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center text-gray-500 text-sm">
        No combiner weights data
      </div>
    )
  }

  const entries: WeightEntry[] = Object.entries(data.weights)
    .map(([source, weight]) => ({
      source,
      weight,
      disabled: weight === 0,
    }))
    .sort((a, b) => b.weight - a.weight)

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <h2 className="text-sm font-semibold text-gray-200 mb-4">
        Combiner Source Weights
      </h2>
      <ResponsiveContainer width="100%" height={Math.max(180, entries.length * 40)}>
        <BarChart
          data={entries}
          layout="vertical"
          margin={{ top: 4, right: 64, bottom: 4, left: 80 }}
        >
          <XAxis
            type="number"
            domain={[0, 1]}
            tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} // weight: decimal_0_1 → ×100
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="source"
            tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            width={76}
          />
          <Tooltip
            formatter={(value: number | undefined) => [
              `${((value ?? 0) * 100).toFixed(1)}%`, // weight: decimal_0_1 → ×100
              'Weight',
            ]}
            {...TOOLTIP_STYLE}
          />
          <Bar dataKey="weight" name="Weight" radius={[0, 4, 4, 0]}>
            {entries.map((entry) => (
              <Cell key={entry.source} fill={weightColor(entry.weight)} />
            ))}
            <LabelList
              dataKey="weight"
              position="right"
              formatter={(value: string | number | boolean | null | undefined) => {
                const num = typeof value === 'number' ? value : 0
                if (num === 0) return 'disabled'
                return `${(num * 100).toFixed(1)}%` // weight: decimal_0_1 → ×100
              }}
              style={{ fill: '#d1d5db', fontSize: 11, fontWeight: 500 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}
