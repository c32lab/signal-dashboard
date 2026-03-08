import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Cell,
} from 'recharts'
import { useWalkForward } from '../../hooks/useParamMatrix'

interface ChartRow {
  label: string
  is_sharpe: number
  oos_sharpe: number
}

interface DegradationRow {
  label: string
  degradation: number
}

interface SummaryStats {
  avgIsSharpe: number
  avgOosSharpe: number
  avgDegradation: number
  stabilityScore: number
}

function computeSummary(windows: ChartRow[], degradations: DegradationRow[]): SummaryStats {
  if (windows.length === 0) return { avgIsSharpe: 0, avgOosSharpe: 0, avgDegradation: 0, stabilityScore: 0 }

  const avgIsSharpe = windows.reduce((s, w) => s + w.is_sharpe, 0) / windows.length
  const avgOosSharpe = windows.reduce((s, w) => s + w.oos_sharpe, 0) / windows.length
  const avgDegradation = degradations.reduce((s, d) => s + d.degradation, 0) / degradations.length

  // Stability score = std dev of OOS Sharpe across windows
  const mean = avgOosSharpe
  const variance = windows.reduce((s, w) => s + (w.oos_sharpe - mean) ** 2, 0) / windows.length
  const stabilityScore = Math.sqrt(variance)

  return { avgIsSharpe, avgOosSharpe, avgDegradation, stabilityScore }
}

export default function WalkForwardChart() {
  const { data, isLoading, error } = useWalkForward()
  const [selectedSymbol, setSelectedSymbol] = useState<string>('')

  const symbols = data?.symbols ?? []
  const symbolNames = symbols.map(s => s.symbol)
  const activeSymbol = selectedSymbol || symbolNames[0] || ''
  const symbolData = symbols.find(s => s.symbol === activeSymbol)

  const chartData = useMemo<ChartRow[]>(() => {
    if (!symbolData) return []
    return symbolData.windows.map(w => ({
      label: `W${w.window}`,
      is_sharpe: w.configs[0]?.in_sample.sharpe ?? 0,
      oos_sharpe: w.configs[0]?.out_of_sample.sharpe ?? 0,
    }))
  }, [symbolData])

  const degradationData = useMemo<DegradationRow[]>(() => {
    if (!symbolData) return []
    return symbolData.windows.map(w => {
      const c = w.configs[0]
      const isSharpe = c?.in_sample.sharpe ?? 0
      const oosSharpe = c?.out_of_sample.sharpe ?? 0
      return {
        label: `W${w.window}`,
        degradation: isSharpe !== 0 ? (oosSharpe - isSharpe) / Math.abs(isSharpe) : 0,
      }
    })
  }, [symbolData])

  const summary = useMemo(() => computeSummary(chartData, degradationData), [chartData, degradationData])

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-gray-800 rounded" />
  }

  if (error) {
    return (
      <div className="bg-red-950/50 border border-red-800 text-red-300 rounded-lg p-4 text-sm">
        Failed to load walk-forward data: {String(error?.message ?? error)}
      </div>
    )
  }

  if (!data || symbols.length === 0) return null

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-300 mb-3">Walk-Forward Analysis</h2>

      <div className="flex flex-wrap gap-3 mb-4">
        <label className="text-xs text-gray-400">
          Symbol
          <select
            className="ml-1 bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded px-2 py-1"
            value={activeSymbol}
            onChange={e => setSelectedSymbol(e.target.value)}
          >
            {symbolNames.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      {symbolData && (
        <>
          <p className="text-xs text-gray-500 mb-2">
            {symbolData.num_windows} windows
          </p>

          {/* Summary stats card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4" data-testid="wf-summary-stats">
            <div className="bg-gray-800 rounded-lg p-2">
              <div className="text-[10px] text-gray-500">Avg IS Sharpe</div>
              <div className="text-sm font-mono text-blue-400">{summary.avgIsSharpe.toFixed(2)}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-2">
              <div className="text-[10px] text-gray-500">Avg OOS Sharpe</div>
              <div className="text-sm font-mono text-green-400">{summary.avgOosSharpe.toFixed(2)}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-2">
              <div className="text-[10px] text-gray-500">Avg Degradation</div>
              <div className={`text-sm font-mono ${summary.avgDegradation < 0 ? 'text-red-400' : 'text-green-400'}`}>
                {(summary.avgDegradation * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-2">
              <div className="text-[10px] text-gray-500">Stability Score</div>
              <div className={`text-sm font-mono ${summary.stabilityScore > 1 ? 'text-red-400' : summary.stabilityScore > 0.5 ? 'text-yellow-400' : 'text-green-400'}`}>
                {summary.stabilityScore.toFixed(2)}
              </div>
            </div>
          </div>

          {/* IS vs OOS Sharpe side-by-side bar chart */}
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#d1d5db' }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, name: any) => [
                  Number(value ?? 0).toFixed(2),
                  name === 'is_sharpe' ? 'In-Sample Sharpe' : 'OOS Sharpe',
                ]}
              />
              <Legend
                formatter={(value: string) =>
                  value === 'is_sharpe' ? 'In-Sample Sharpe' : 'OOS Sharpe'
                }
              />
              <Bar dataKey="is_sharpe" fill="#60a5fa" barSize={20} />
              <Bar dataKey="oos_sharpe" fill="#34d399" barSize={20} />
            </BarChart>
          </ResponsiveContainer>

          {/* Degradation indicator bar chart */}
          <h3 className="text-xs font-semibold text-gray-400 mt-4 mb-2">Degradation per Window</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={degradationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={v => v.toFixed(2)} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#d1d5db' }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [Number(value ?? 0).toFixed(4), 'Degradation']}
              />
              <Bar dataKey="degradation" barSize={24}>
                {degradationData.map((d, i) => (
                  <Cell key={i} fill={d.degradation < 0 ? '#ef4444' : '#34d399'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Rolling window config table with degradation indicator */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="text-gray-400">
                  <th className="px-2 py-1 text-left">Window</th>
                  <th className="px-2 py-1 text-left">Train Period</th>
                  <th className="px-2 py-1 text-left">Test Period</th>
                  <th className="px-2 py-1 text-right">IS Sharpe</th>
                  <th className="px-2 py-1 text-right">IS WR%</th>
                  <th className="px-2 py-1 text-right">IS PnL</th>
                  <th className="px-2 py-1 text-right">OOS Sharpe</th>
                  <th className="px-2 py-1 text-right">OOS WR%</th>
                  <th className="px-2 py-1 text-right">OOS PnL</th>
                  <th className="px-2 py-1 text-right">Degradation</th>
                  <th className="px-2 py-1 text-right">Drop %</th>
                </tr>
              </thead>
              <tbody>
                {symbolData.windows.map(w => {
                  const c = w.configs[0]
                  if (!c) return null
                  const degradation = c.in_sample.sharpe !== 0
                    ? (c.out_of_sample.sharpe - c.in_sample.sharpe) / Math.abs(c.in_sample.sharpe)
                    : 0
                  const dropPct = c.in_sample.sharpe !== 0
                    ? ((c.in_sample.sharpe - c.out_of_sample.sharpe) / Math.abs(c.in_sample.sharpe)) * 100
                    : 0
                  return (
                    <tr key={w.window} className="border-t border-gray-800 text-gray-300">
                      <td className="px-2 py-1 font-medium">W{w.window}</td>
                      <td className="px-2 py-1">{w.train_period}</td>
                      <td className="px-2 py-1">{w.test_period}</td>
                      <td className="px-2 py-1 text-right font-mono">{c.in_sample.sharpe.toFixed(2)}</td>
                      <td className="px-2 py-1 text-right font-mono">{c.in_sample.win_rate.toFixed(1)}%</td>
                      <td className="px-2 py-1 text-right font-mono">{c.in_sample.pnl.toFixed(2)}</td>
                      <td className="px-2 py-1 text-right font-mono">{c.out_of_sample.sharpe.toFixed(2)}</td>
                      <td className="px-2 py-1 text-right font-mono">{c.out_of_sample.win_rate.toFixed(1)}%</td>
                      <td className="px-2 py-1 text-right font-mono">{c.out_of_sample.pnl.toFixed(2)}</td>
                      <td className={`px-2 py-1 text-right font-mono ${degradation < 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {degradation.toFixed(4)}
                      </td>
                      <td className={`px-2 py-1 text-right font-mono ${dropPct > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {dropPct > 0 ? '-' : '+'}{Math.abs(dropPct).toFixed(1)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
