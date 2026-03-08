import { useMemo } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { useWalkForward } from '../../hooks/useParamMatrix'
import { pct } from './backtestUtils'

interface ChartRow {
  label: string
  in_sample: number
  out_of_sample: number
  cumulative_oos: number
}

export default function WalkForwardChart() {
  const { data, isLoading } = useWalkForward()

  const chartData = useMemo<ChartRow[]>(() => {
    if (!data) return []
    let cumulative = 0
    return data.windows.map((w, i) => {
      cumulative += w.out_of_sample.total_pnl_pct
      return {
        label: `W${i + 1}`,
        in_sample: w.in_sample.total_pnl_pct,
        out_of_sample: w.out_of_sample.total_pnl_pct,
        cumulative_oos: cumulative,
      }
    })
  }, [data])

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-gray-800 rounded" />
  }

  if (!data || data.windows.length === 0) return null

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-300 mb-3">Walk-Forward Analysis</h2>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <YAxis
            yAxisId="pnl"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickFormatter={v => `${v}%`}
          />
          <YAxis
            yAxisId="cum"
            orientation="right"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickFormatter={v => `${v}%`}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
            labelStyle={{ color: '#d1d5db' }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => [
              `${Number(value ?? 0).toFixed(1)}%`,
              name === 'cumulative_oos' ? 'Cumulative OOS' : name === 'in_sample' ? 'In-Sample' : 'Out-of-Sample',
            ]}
          />
          <Legend
            formatter={(value: string) => {
              if (value === 'in_sample') return 'In-Sample PnL'
              if (value === 'out_of_sample') return 'Out-of-Sample PnL'
              if (value === 'cumulative_oos') return 'Cumulative OOS'
              return value
            }}
          />
          <Bar yAxisId="pnl" dataKey="in_sample" fill="#60a5fa" opacity={0.7} barSize={20} />
          <Bar yAxisId="pnl" dataKey="out_of_sample" fill="#34d399" barSize={20} />
          <Line
            yAxisId="cum"
            type="monotone"
            dataKey="cumulative_oos"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: '#f59e0b', r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-gray-400">
              <th className="px-2 py-1 text-left">Window</th>
              <th className="px-2 py-1 text-left">Train Period</th>
              <th className="px-2 py-1 text-left">Test Period</th>
              <th className="px-2 py-1 text-right">IS Sharpe</th>
              <th className="px-2 py-1 text-right">IS WR%</th>
              <th className="px-2 py-1 text-right">IS PnL%</th>
              <th className="px-2 py-1 text-right">OOS Sharpe</th>
              <th className="px-2 py-1 text-right">OOS WR%</th>
              <th className="px-2 py-1 text-right">OOS PnL%</th>
            </tr>
          </thead>
          <tbody>
            {data.windows.map((w, i) => (
              <tr key={i} className="border-t border-gray-800 text-gray-300">
                <td className="px-2 py-1 font-medium">W{i + 1}</td>
                <td className="px-2 py-1">{w.train_start} — {w.train_end}</td>
                <td className="px-2 py-1">{w.test_start} — {w.test_end}</td>
                <td className="px-2 py-1 text-right font-mono">{w.in_sample.sharpe.toFixed(2)}</td>
                <td className="px-2 py-1 text-right font-mono">{pct(w.in_sample.win_rate_pct)}</td>
                <td className="px-2 py-1 text-right font-mono">{pct(w.in_sample.total_pnl_pct)}</td>
                <td className="px-2 py-1 text-right font-mono">{w.out_of_sample.sharpe.toFixed(2)}</td>
                <td className="px-2 py-1 text-right font-mono">{pct(w.out_of_sample.win_rate_pct)}</td>
                <td className="px-2 py-1 text-right font-mono">{pct(w.out_of_sample.total_pnl_pct)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-600 text-gray-200 font-semibold">
              <td className="px-2 py-1" colSpan={3}>Overall OOS</td>
              <td className="px-2 py-1 text-right font-mono" colSpan={3} />
              <td className="px-2 py-1 text-right font-mono">{data.overall.sharpe.toFixed(2)}</td>
              <td className="px-2 py-1 text-right font-mono">{pct(data.overall.win_rate_pct)}</td>
              <td className="px-2 py-1 text-right font-mono">{pct(data.overall.total_pnl_pct)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
