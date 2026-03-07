import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { formatDateTime, formatChartTime } from '../../utils/format'
import type { PnlCurvePoint, BacktestConfig } from '../../types/backtest'
import { CONFIG_COLORS } from './SummaryCard'

interface PnlCompareChartProps {
  pnlCurve: Record<string, PnlCurvePoint[]>
  configs: Record<string, BacktestConfig>
}

export default function PnlCompareChart({ pnlCurve, configs }: PnlCompareChartProps) {
  const configNames = Object.keys(pnlCurve)
  const [visible, setVisible] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(configNames.map((c) => [c, true]))
  )

  const toggle = (name: string) =>
    setVisible((prev) => ({ ...prev, [name]: !prev[name] }))

  // Merge all timestamps across configs
  const allTimestamps = Array.from(
    new Set(configNames.flatMap((c) => pnlCurve[c].map((p) => p.timestamp)))
  ).sort()

  // Build lookup per config
  const lookups: Record<string, Record<string, number>> = {}
  for (const c of configNames) {
    lookups[c] = {}
    for (const pt of pnlCurve[c]) {
      lookups[c][pt.timestamp] = pt.cumulative_pnl_pct
    }
  }

  const chartData = allTimestamps.map((ts) => {
    const row: Record<string, string | number> = { timestamp: ts }
    for (const c of configNames) {
      if (visible[c] && lookups[c][ts] !== undefined) {
        row[c] = lookups[c][ts]
      }
    }
    return row
  })

  const visibleConfigs = configNames.filter((c) => visible[c])

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-sm font-semibold text-gray-300">Cumulative PnL%</h2>
        <div className="flex gap-2 flex-wrap">
          {configNames.map((c) => {
            const color = CONFIG_COLORS[c] ?? '#9ca3af'
            const desc = configs[c]?.description
            return (
              <button
                key={c}
                onClick={() => toggle(c)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
                  visible[c]
                    ? 'bg-gray-800 text-gray-200'
                    : 'bg-gray-950 text-gray-600'
                }`}
                title={desc}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: visible[c] ? color : '#4b5563' }}
                />
                {c}
              </button>
            )
          })}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(ts: string) => formatChartTime(ts)}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            minTickGap={60}
          />
          <YAxis
            tickFormatter={(v: number) => `${v.toFixed(1)}%`}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            width={52}
          />
          <ReferenceLine y={0} stroke="#4b5563" strokeDasharray="4 4" />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
            labelStyle={{ color: '#9ca3af', fontSize: 11 }}
            itemStyle={{ fontSize: 12 }}
            labelFormatter={(ts: unknown) => formatDateTime(String(ts ?? ''))}
            formatter={(value: unknown, name: unknown) => [
              `${Number(value ?? 0).toFixed(2)}%`,
              String(name ?? ''),
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: '#9ca3af' }}
            formatter={(value: unknown) => {
              const name = String(value ?? '')
              const desc = configs[name]?.description
              return desc ? `${name} — ${desc}` : name
            }}
          />
          {visibleConfigs.map((c) => (
            <Line
              key={c}
              type="monotone"
              dataKey={c}
              stroke={CONFIG_COLORS[c] ?? '#9ca3af'}
              dot={false}
              strokeWidth={2}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
