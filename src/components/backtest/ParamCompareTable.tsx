import type { BacktestConfig, BacktestSummary } from '../../types/backtest'

interface Props {
  configs: Record<string, BacktestConfig>
  summary: BacktestSummary[]
}

function pct(v: number | undefined | null, decimals = 1): string {
  return `${(v ?? 0).toFixed(decimals)}%`
}

type MetricDef = {
  label: string
  getValue: (s: BacktestSummary) => number
  format: (v: number) => string
  bestFn: 'max' | 'min'
}

const METRICS: MetricDef[] = [
  { label: 'Win Rate', getValue: (s) => s.win_rate_pct, format: (v) => pct(v), bestFn: 'max' },
  { label: 'Total PnL%', getValue: (s) => s.total_pnl_pct, format: (v) => pct(v, 2), bestFn: 'max' },
  { label: 'Sharpe', getValue: (s) => s.sharpe, format: (v) => v.toFixed(2), bestFn: 'max' },
  { label: 'Max DD%', getValue: (s) => s.max_drawdown_pct, format: (v) => pct(v), bestFn: 'min' },
  { label: 'Trades', getValue: (s) => s.total_trades, format: (v) => String(v), bestFn: 'max' },
  { label: 'Win Count', getValue: (s) => s.win_count ?? 0, format: (v) => String(v), bestFn: 'max' },
  { label: 'Loss Count', getValue: (s) => s.loss_count ?? 0, format: (v) => String(v), bestFn: 'min' },
]

export default function ParamCompareTable({ configs, summary }: Props) {
  if (summary.length === 0) return null

  const configNames = summary.map((s) => s.config)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-gray-200 border border-gray-800">
        <thead>
          <tr className="bg-gray-900">
            <th className="px-3 py-2 text-left border-b border-gray-800 text-gray-400">Metric</th>
            {configNames.map((name) => (
              <th key={name} className="px-3 py-2 text-right border-b border-gray-800 text-gray-400">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {METRICS.map((metric) => {
            const values = summary.map((s) => metric.getValue(s))
            const bestVal = metric.bestFn === 'max' ? Math.max(...values) : Math.min(...values)

            return (
              <tr key={metric.label} className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="px-3 py-2 text-gray-400">{metric.label}</td>
                {summary.map((s) => {
                  const val = metric.getValue(s)
                  const isBest = val === bestVal && summary.length > 1
                  return (
                    <td
                      key={s.config}
                      className={`px-3 py-2 text-right ${isBest ? 'text-green-400 font-bold' : ''}`}
                    >
                      {metric.format(val)}
                    </td>
                  )
                })}
              </tr>
            )
          })}
          {/* Weights row */}
          <tr className="border-t-2 border-gray-700">
            <td className="px-3 py-2 text-gray-400 align-top">Weights</td>
            {configNames.map((name) => {
              const weights = configs[name]?.weights
              return (
                <td key={name} className="px-3 py-2 text-right text-xs text-gray-400">
                  {weights
                    ? Object.entries(weights).map(([k, v]) => (
                        <div key={k}>
                          {k}: {v}
                        </div>
                      ))
                    : '—'}
                </td>
              )
            })}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
