import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import KPIPanel from '../components/KPIPanel'
import SignalCards from '../components/SignalCards'
import CombinerWeights from '../components/CombinerWeights'
import DecisionTable from '../components/DecisionTable'
import LastUpdated from '../components/LastUpdated'
import { useOverview, useBias, useCollectorHealth } from '../hooks/useApi'
import type { BiasResponse, CollectorHealthResponse } from '../types'

const TOOLTIP_STYLE = {
  contentStyle: { background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 },
  labelStyle: { color: '#9ca3af' },
  itemStyle: { color: '#e5e7eb' },
}

// ── Collector Status ──────────────────────────────────────────────────────────

function CollectorStatus({ data }: { data: CollectorHealthResponse }) {
  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <h2 className="text-sm font-semibold text-gray-200 mb-3">Collector Status</h2>
      <div className="flex flex-wrap gap-2">
        {data.collectors.map((c) => {
          const pillColor = c.is_disabled
            ? 'bg-red-900/60 border-red-700 text-red-300'
            : c.is_degraded
            ? 'bg-yellow-900/60 border-yellow-700 text-yellow-300'
            : 'bg-green-900/40 border-green-800 text-green-400'
          return (
            <span
              key={c.name}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${pillColor}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  c.is_disabled ? 'bg-red-400' : c.is_degraded ? 'bg-yellow-400' : 'bg-green-400'
                }`}
              />
              {c.name}
              {c.error_count > 0 && (
                <span className="opacity-75">({c.error_count} err)</span>
              )}
            </span>
          )
        })}
      </div>
    </section>
  )
}

// ── Source Bias ───────────────────────────────────────────────────────────────

function biasColor(score: number): string {
  if (score > 0.05) return '#34d399'  // green-400 = long bias
  if (score < -0.05) return '#f87171' // red-400 = short bias
  return '#6b7280'                    // gray-500 = neutral
}

function SourceBias({ data }: { data: BiasResponse }) {
  const entries = Object.entries(data.collectors ?? {}).map(([name, c]) => ({
    name,
    bias_score: c.bias_score,
  })).sort((a, b) => b.bias_score - a.bias_score)

  const overall = data.overall

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
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
          margin={{ top: 4, right: 80, bottom: 4, left: 100 }}
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { data } = useOverview()
  const biasRes = useBias()
  const collectorRes = useCollectorHealth()
  const [lastUpdated, setLastUpdated] = useState<Date>()

  useEffect(() => {
    if (data) setLastUpdated(new Date())
  }, [data])

  const biasData = biasRes.data
  const collectorData = collectorRes.data

  return (
    <div className="flex flex-col gap-4 sm:gap-8 py-2 sm:py-6">
      <div className="px-2 sm:px-6">
        <LastUpdated timestamp={lastUpdated} />
      </div>
      <KPIPanel />
      {collectorData && (
        <div className="px-2 sm:px-6">
          <CollectorStatus data={collectorData} />
        </div>
      )}
      <div className="px-2 sm:px-6">
        <CombinerWeights />
      </div>
      {biasData && (
        <div className="px-2 sm:px-6">
          <SourceBias data={biasData} />
        </div>
      )}
      <SignalCards />
      <DecisionTable />
    </div>
  )
}
