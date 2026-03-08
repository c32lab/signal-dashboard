import { useMemo } from 'react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { BacktestSummary } from '../../types/backtest'
import { CONFIG_COLORS } from './configColors'

interface RadarCompareChartProps {
  summary: BacktestSummary[]
}

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 50
  return ((value - min) / (max - min)) * 100
}

export default function RadarCompareChart({ summary }: RadarCompareChartProps) {
  const configNames = summary.map((s) => s.config)

  const chartData = useMemo(() => {
    if (summary.length === 0) return []

    const winRates = summary.map((s) => s.win_rate_pct)
    const sharpes = summary.map((s) => s.sharpe)
    const pnls = summary.map((s) => s.total_pnl_pct)
    const drawdowns = summary.map((s) => s.max_drawdown_pct)

    const metrics = [
      { label: 'Win Rate', values: winRates, invert: false },
      { label: 'Sharpe', values: sharpes, invert: false },
      { label: 'PnL', values: pnls, invert: false },
      { label: 'Max DD', values: drawdowns, invert: true },
    ]

    return metrics.map((m) => {
      const min = Math.min(...m.values)
      const max = Math.max(...m.values)
      const row: Record<string, string | number> = { metric: m.label }
      summary.forEach((s, i) => {
        const raw = m.values[i]
        const norm = m.invert
          ? 100 - normalize(raw, min, max)
          : normalize(raw, min, max)
        row[s.config] = Math.round(norm)
      })
      return row
    })
  }, [summary])

  if (summary.length === 0) return null

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-300 mb-3">Radar Comparison</h2>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}
            labelStyle={{ color: '#d1d5db' }}
          />
          {configNames.map((name) => (
            <Radar
              key={name}
              name={name}
              dataKey={name}
              stroke={CONFIG_COLORS[name] ?? '#9ca3af'}
              fill={CONFIG_COLORS[name] ?? '#9ca3af'}
              fillOpacity={0.15}
            />
          ))}
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
