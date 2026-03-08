import { useMemo, useState } from 'react'
import type { ParamMatrixEntry } from '../../types/paramMatrix'
import { useParamMatrix } from '../../hooks/useParamMatrix'

type MetricKey = 'sharpe' | 'win_rate' | 'pnl' | 'return_pct'

const METRIC_LABELS: Record<MetricKey, string> = {
  sharpe: 'Sharpe',
  win_rate: 'Win Rate %',
  pnl: 'PnL',
  return_pct: 'Return %',
}

function metricValue(v: number, key: MetricKey): string {
  if (key === 'sharpe') return v.toFixed(2)
  if (key === 'return_pct') return `${(v * 100).toFixed(1)}%`
  if (key === 'win_rate') return `${v.toFixed(1)}%`
  return v.toFixed(2)
}

function cellColor(value: number, min: number, max: number): string {
  if (max === min) return 'rgba(96,165,250,0.3)'
  const t = (value - min) / (max - min)
  const r = Math.round(220 - t * 180)
  const g = Math.round(60 + t * 160)
  const b = Math.round(60)
  return `rgba(${r},${g},${b},0.6)`
}

export default function ParameterMatrixView() {
  const { data, isLoading } = useParamMatrix()
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('sharpe')
  const [selectedSymbol, setSelectedSymbol] = useState<string>('')
  const [xAxis, setXAxis] = useState<string>('')
  const [yAxis, setYAxis] = useState<string>('')

  const symbols = data ? Object.keys(data.symbols) : []
  const activeSymbol = selectedSymbol || symbols[0] || ''
  const symbolData = data?.symbols[activeSymbol]

  const paramNames = useMemo(() => {
    if (!symbolData || symbolData.results.length === 0) return []
    return Object.keys(symbolData.results[0].params)
  }, [symbolData])

  const effectiveX = xAxis || paramNames[0] || ''
  const effectiveY = yAxis || paramNames[1] || ''

  const { grid, xValues, yValues, minVal, maxVal, bestCell } = useMemo(() => {
    if (!symbolData || paramNames.length < 2) {
      return { grid: new Map<string, ParamMatrixEntry>(), xValues: [] as number[], yValues: [] as number[], minVal: 0, maxVal: 0, bestCell: '' }
    }

    const xSet = new Set<number>()
    const ySet = new Set<number>()
    const grid = new Map<string, ParamMatrixEntry>()
    let bestVal = -Infinity
    let bestKey = ''

    for (const entry of symbolData.results) {
      const x = entry.params[effectiveX]
      const y = entry.params[effectiveY]
      if (x == null || y == null) continue
      xSet.add(x)
      ySet.add(y)
      const key = `${x}|${y}`
      if (!grid.has(key)) {
        grid.set(key, entry)
      }
      const val = entry[selectedMetric]
      if (val > bestVal) {
        bestVal = val
        bestKey = key
      }
    }

    const xValues = [...xSet].sort((a, b) => a - b)
    const yValues = [...ySet].sort((a, b) => a - b)

    const allVals = [...grid.values()].map(e => e[selectedMetric])
    const minVal = Math.min(...allVals)
    const maxVal = Math.max(...allVals)

    return { grid, xValues, yValues, minVal, maxVal, bestCell: bestKey }
  }, [symbolData, effectiveX, effectiveY, selectedMetric, paramNames])

  const topConfigs = useMemo(() => {
    if (!symbolData) return []
    return [...symbolData.results].sort((a, b) => b.sharpe - a.sharpe).slice(0, 10)
  }, [symbolData])

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-gray-800 rounded" />
  }

  if (!data || symbols.length === 0) return null

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-300 mb-3">Parameter Matrix Heatmap</h2>

      <div className="flex flex-wrap gap-3 mb-4">
        <label className="text-xs text-gray-400">
          Symbol
          <select
            className="ml-1 bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded px-2 py-1"
            value={activeSymbol}
            onChange={e => setSelectedSymbol(e.target.value)}
          >
            {symbols.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        {paramNames.length >= 2 && (
          <>
            <label className="text-xs text-gray-400">
              X-Axis
              <select
                className="ml-1 bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded px-2 py-1"
                value={effectiveX}
                onChange={e => setXAxis(e.target.value)}
              >
                {paramNames.map(d => (
                  <option key={d} value={d} disabled={d === effectiveY}>{d}</option>
                ))}
              </select>
            </label>

            <label className="text-xs text-gray-400">
              Y-Axis
              <select
                className="ml-1 bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded px-2 py-1"
                value={effectiveY}
                onChange={e => setYAxis(e.target.value)}
              >
                {paramNames.map(d => (
                  <option key={d} value={d} disabled={d === effectiveX}>{d}</option>
                ))}
              </select>
            </label>
          </>
        )}

        <label className="text-xs text-gray-400">
          Metric
          <select
            className="ml-1 bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded px-2 py-1"
            value={selectedMetric}
            onChange={e => setSelectedMetric(e.target.value as MetricKey)}
          >
            {Object.entries(METRIC_LABELS).map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      {paramNames.length >= 2 && (
        <div className="overflow-x-auto">
          <table className="border-collapse text-xs">
            <thead>
              <tr>
                <th className="px-2 py-1 text-gray-400 text-left">{effectiveY} \ {effectiveX}</th>
                {xValues.map(x => (
                  <th key={x} className="px-3 py-1 text-gray-300 text-center">{x}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {yValues.map(y => (
                <tr key={y}>
                  <td className="px-2 py-1 text-gray-300 font-medium">{y}</td>
                  {xValues.map(x => {
                    const key = `${x}|${y}`
                    const entry = grid.get(key)
                    if (!entry) {
                      return <td key={x} className="px-3 py-2 text-center text-gray-600">-</td>
                    }
                    const val = entry[selectedMetric]
                    const isBest = key === bestCell
                    return (
                      <td
                        key={x}
                        className={`px-3 py-2 text-center font-mono ${isBest ? 'ring-2 ring-yellow-400 font-bold' : ''}`}
                        style={{ backgroundColor: cellColor(val, minVal, maxVal) }}
                        title={`${effectiveX}=${x}, ${effectiveY}=${y}\nSharpe: ${entry.sharpe.toFixed(2)}\nWin Rate: ${entry.win_rate.toFixed(1)}%\nPnL: ${entry.pnl.toFixed(2)}\nTrades: ${entry.trades}`}
                      >
                        {metricValue(val, selectedMetric)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {bestCell && (
        <p className="text-xs text-gray-400 mt-2">
          Best combo highlighted ({METRIC_LABELS[selectedMetric]}: {
            metricValue(grid.get(bestCell)![selectedMetric], selectedMetric)
          })
        </p>
      )}

      {topConfigs.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold text-gray-400 mb-2">Top Configs by Sharpe</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="text-gray-400">
                  <th className="px-2 py-1 text-left">#</th>
                  <th className="px-2 py-1 text-left">Params</th>
                  <th className="px-2 py-1 text-right">Sharpe</th>
                  <th className="px-2 py-1 text-right">Win Rate</th>
                  <th className="px-2 py-1 text-right">PnL</th>
                  <th className="px-2 py-1 text-right">Trades</th>
                </tr>
              </thead>
              <tbody>
                {topConfigs.map((c, i) => (
                  <tr key={i} className="border-t border-gray-800 text-gray-300">
                    <td className="px-2 py-1 font-medium">{i + 1}</td>
                    <td className="px-2 py-1 font-mono">
                      {Object.entries(c.params).map(([k, v]) => `${k}=${v}`).join(', ')}
                    </td>
                    <td className="px-2 py-1 text-right font-mono">{c.sharpe.toFixed(2)}</td>
                    <td className="px-2 py-1 text-right font-mono">{c.win_rate.toFixed(1)}%</td>
                    <td className="px-2 py-1 text-right font-mono">{c.pnl.toFixed(2)}</td>
                    <td className="px-2 py-1 text-right font-mono">{c.trades}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
