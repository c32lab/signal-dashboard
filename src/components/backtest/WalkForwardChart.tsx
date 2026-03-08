import { useMemo, useState } from 'react'
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

export default function WalkForwardChart() {
  const { data, isLoading } = useWalkForward()
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
      oos_sharpe: w.configs[0]?.oos.sharpe ?? 0,
    }))
  }, [symbolData])

  const degradationData = useMemo<DegradationRow[]>(() => {
    if (!symbolData) return []
    return symbolData.windows.map(w => ({
      label: `W${w.window}`,
      degradation: w.configs[0]?.degradation ?? 0,
    }))
  }, [symbolData])

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-gray-800 rounded" />
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
            {symbolData.data_period} &middot; {symbolData.total_bars} bars &middot; {symbolData.num_windows} windows
          </p>

          {/* IS vs OOS Sharpe dual line chart */}
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData}>
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
              <Line type="monotone" dataKey="is_sharpe" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', r: 4 }} />
              <Line type="monotone" dataKey="oos_sharpe" stroke="#34d399" strokeWidth={2} dot={{ fill: '#34d399', r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>

          {/* Degradation bar chart */}
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

          {/* Rolling window config table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs border-collapse">
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
                </tr>
              </thead>
              <tbody>
                {symbolData.windows.map(w => {
                  const c = w.configs[0]
                  if (!c) return null
                  return (
                    <tr key={w.window} className="border-t border-gray-800 text-gray-300">
                      <td className="px-2 py-1 font-medium">W{w.window}</td>
                      <td className="px-2 py-1">{w.train_period}</td>
                      <td className="px-2 py-1">{w.test_period}</td>
                      <td className="px-2 py-1 text-right font-mono">{c.in_sample.sharpe.toFixed(2)}</td>
                      <td className="px-2 py-1 text-right font-mono">{c.in_sample.win_rate.toFixed(1)}%</td>
                      <td className="px-2 py-1 text-right font-mono">{c.in_sample.pnl.toFixed(2)}</td>
                      <td className="px-2 py-1 text-right font-mono">{c.oos.sharpe.toFixed(2)}</td>
                      <td className="px-2 py-1 text-right font-mono">{c.oos.win_rate.toFixed(1)}%</td>
                      <td className="px-2 py-1 text-right font-mono">{c.oos.pnl.toFixed(2)}</td>
                      <td className={`px-2 py-1 text-right font-mono ${c.degradation < 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {c.degradation.toFixed(4)}
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
