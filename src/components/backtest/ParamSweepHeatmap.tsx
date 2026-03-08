import type { BacktestSummary } from '../../types/backtest'
import { CONFIG_COLORS } from './configColors'

interface ParamSweepHeatmapProps {
  summary: BacktestSummary[]
}

interface MetricDef {
  key: string
  label: string
  getValue: (s: BacktestSummary) => number
  format: (v: number) => string
  higherIsBetter: boolean
}

const METRICS: MetricDef[] = [
  {
    key: 'win_rate',
    label: 'Win Rate',
    getValue: (s) => s.win_rate_pct,
    format: (v) => `${v.toFixed(1)}%`,
    higherIsBetter: true,
  },
  {
    key: 'sharpe',
    label: 'Sharpe',
    getValue: (s) => s.sharpe,
    format: (v) => v.toFixed(2),
    higherIsBetter: true,
  },
  {
    key: 'pnl',
    label: 'PnL',
    getValue: (s) => s.total_pnl_pct,
    format: (v) => `${v.toFixed(1)}%`,
    higherIsBetter: true,
  },
  {
    key: 'max_dd',
    label: 'MaxDD',
    getValue: (s) => s.max_drawdown_pct,
    format: (v) => `${v.toFixed(1)}%`,
    higherIsBetter: false,
  },
]

function cellColor(value: number, min: number, max: number, higherIsBetter: boolean): string {
  if (max === min) return 'rgba(107, 114, 128, 0.3)'
  const ratio = (value - min) / (max - min)
  const normalized = higherIsBetter ? ratio : 1 - ratio
  if (normalized >= 0.5) {
    const intensity = (normalized - 0.5) * 2
    return `rgba(74, 222, 128, ${0.15 + intensity * 0.4})`
  }
  const intensity = (0.5 - normalized) * 2
  return `rgba(248, 113, 113, ${0.15 + intensity * 0.4})`
}

export default function ParamSweepHeatmap({ summary }: ParamSweepHeatmapProps) {
  if (summary.length === 0) return null

  const ranges = METRICS.map((m) => {
    const values = summary.map(m.getValue)
    return { min: Math.min(...values), max: Math.max(...values) }
  })

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-300 mb-3">Parameter Sweep Heatmap</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="text-left text-gray-400 px-3 py-2 border-b border-gray-700">Config</th>
              {METRICS.map((m) => (
                <th key={m.key} className="text-center text-gray-400 px-3 py-2 border-b border-gray-700">
                  {m.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {summary.map((s) => {
              const color = CONFIG_COLORS[s.config] ?? '#9ca3af'
              return (
                <tr key={s.config}>
                  <td className="px-3 py-2 border-b border-gray-800 whitespace-nowrap">
                    <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: color }} />
                    <span className="text-gray-200">{s.config}</span>
                  </td>
                  {METRICS.map((m, i) => {
                    const value = m.getValue(s)
                    const bg = cellColor(value, ranges[i].min, ranges[i].max, m.higherIsBetter)
                    return (
                      <td
                        key={m.key}
                        className="text-center px-3 py-2 border-b border-gray-800 font-mono text-gray-100"
                        style={{ backgroundColor: bg }}
                      >
                        {m.format(value)}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
