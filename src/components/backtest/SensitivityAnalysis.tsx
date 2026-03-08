import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { BacktestConfig, BacktestSummary } from '../../types/backtest'
import { CONFIG_COLORS } from './configColors'

interface SensitivityAnalysisProps {
  configs: Record<string, BacktestConfig>
  summary: BacktestSummary[]
}

interface WeightPoint {
  config: string
  weight: number
  sharpe: number
  color: string
}

export default function SensitivityAnalysis({ configs, summary }: SensitivityAnalysisProps) {
  const sources = useMemo(() => {
    const allSources = new Set<string>()
    Object.values(configs).forEach((c) => {
      Object.keys(c.weights).forEach((k) => allSources.add(k))
    })
    return Array.from(allSources).sort()
  }, [configs])

  const dataBySource = useMemo(() => {
    const sharpeMap = new Map<string, number>()
    summary.forEach((s) => sharpeMap.set(s.config, s.sharpe))

    return sources.map((source) => {
      const points: WeightPoint[] = Object.entries(configs)
        .filter(([name]) => sharpeMap.has(name))
        .map(([name, cfg]) => ({
          config: name,
          weight: Math.round((cfg.weights[source] ?? 0) * 100),
          sharpe: sharpeMap.get(name) ?? 0,
          color: CONFIG_COLORS[name] ?? '#9ca3af',
        }))
        .sort((a, b) => a.weight - b.weight)
      return { source, points }
    })
  }, [configs, summary, sources])

  if (sources.length === 0 || summary.length === 0) return null

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-300 mb-3">Sensitivity Analysis</h2>
      <p className="text-xs text-gray-500 mb-4">
        Weight value (%) vs Sharpe ratio for each config — identifies which weight sources impact performance.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dataBySource.map(({ source, points }) => (
          <div key={source} className="bg-gray-800/50 rounded-lg p-3">
            <h3 className="text-xs font-medium text-gray-400 mb-2 capitalize">{source}</h3>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={points} layout="vertical" margin={{ top: 4, right: 16, left: 60, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  tickFormatter={(v) => v.toFixed(1)}
                  label={{ value: 'Sharpe', position: 'insideBottomRight', fill: '#6b7280', fontSize: 10, offset: -4 }}
                />
                <YAxis
                  dataKey="config"
                  type="category"
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  width={56}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}
                  formatter={(value) => [Number(value).toFixed(2), 'Sharpe']}
                  labelFormatter={(label) => {
                    const pt = points.find((p) => p.config === label)
                    return `${label} (weight: ${pt?.weight ?? 0}%)`
                  }}
                />
                <Bar dataKey="sharpe" radius={[0, 4, 4, 0]}>
                  {points.map((pt) => (
                    <Cell key={pt.config} fill={pt.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  )
}
