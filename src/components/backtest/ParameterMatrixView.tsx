import { useMemo, useState } from 'react'
import type { ParamMatrixEntry } from '../../types/paramMatrix'
import { useParamMatrix } from '../../hooks/useParamMatrix'
import { pct } from './backtestUtils'

type MetricKey = 'sharpe' | 'win_rate_pct' | 'total_pnl_pct' | 'max_drawdown_pct'

const METRIC_LABELS: Record<MetricKey, string> = {
  sharpe: 'Sharpe',
  win_rate_pct: 'Win Rate %',
  total_pnl_pct: 'Total PnL %',
  max_drawdown_pct: 'Max Drawdown %',
}

function metricValue(v: number, key: MetricKey): string {
  if (key === 'sharpe') return v.toFixed(2)
  return pct(v)
}

function cellColor(value: number, min: number, max: number, key: MetricKey): string {
  if (max === min) return 'rgba(96,165,250,0.3)'
  const ratio = (value - min) / (max - min)
  // For drawdown, lower is better — invert
  const t = key === 'max_drawdown_pct' ? 1 - ratio : ratio
  // Green for good, red for bad
  const r = Math.round(220 - t * 180)
  const g = Math.round(60 + t * 160)
  const b = Math.round(60)
  return `rgba(${r},${g},${b},0.6)`
}

export default function ParameterMatrixView() {
  const { data, isLoading } = useParamMatrix()
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('sharpe')
  const [xAxis, setXAxis] = useState<string>('')
  const [yAxis, setYAxis] = useState<string>('')

  const dimensions = data?.dimensions ?? []

  // Initialize axes on first data load
  const effectiveX = xAxis || dimensions[0] || ''
  const effectiveY = yAxis || dimensions[1] || ''

  const { grid, xValues, yValues, minVal, maxVal, bestCell } = useMemo(() => {
    if (!data || dimensions.length < 2) {
      return { grid: new Map<string, ParamMatrixEntry>(), xValues: [] as number[], yValues: [] as number[], minVal: 0, maxVal: 0, bestCell: '' }
    }

    const xSet = new Set<number>()
    const ySet = new Set<number>()
    const grid = new Map<string, typeof data.results[number]>()
    let bestVal = -Infinity
    let bestKey = ''

    for (const entry of data.results) {
      const x = entry.params[effectiveX]
      const y = entry.params[effectiveY]
      if (x == null || y == null) continue
      xSet.add(x)
      ySet.add(y)
      const key = `${x}|${y}`
      // Average metrics when multiple entries share same (x,y)
      if (!grid.has(key)) {
        grid.set(key, entry)
      }
      const val = entry.metrics[selectedMetric]
      const isBetter = selectedMetric === 'max_drawdown_pct' ? val < bestVal || bestVal === -Infinity : val > bestVal
      if (isBetter) {
        bestVal = val
        bestKey = key
      }
    }

    const xValues = [...xSet].sort((a, b) => a - b)
    const yValues = [...ySet].sort((a, b) => a - b)

    const allVals = [...grid.values()].map(e => e.metrics[selectedMetric])
    const minVal = Math.min(...allVals)
    const maxVal = Math.max(...allVals)

    return { grid, xValues, yValues, minVal, maxVal, bestCell: bestKey }
  }, [data, effectiveX, effectiveY, selectedMetric, dimensions])

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-gray-800 rounded" />
  }

  if (!data || dimensions.length < 2) return null

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-300 mb-3">Parameter Matrix Heatmap</h2>

      <div className="flex flex-wrap gap-3 mb-4">
        <label className="text-xs text-gray-400">
          X-Axis
          <select
            className="ml-1 bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded px-2 py-1"
            value={effectiveX}
            onChange={e => setXAxis(e.target.value)}
          >
            {dimensions.map(d => (
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
            {dimensions.map(d => (
              <option key={d} value={d} disabled={d === effectiveX}>{d}</option>
            ))}
          </select>
        </label>

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
                  const val = entry.metrics[selectedMetric]
                  const isBest = key === bestCell
                  return (
                    <td
                      key={x}
                      className={`px-3 py-2 text-center font-mono ${isBest ? 'ring-2 ring-yellow-400 font-bold' : ''}`}
                      style={{ backgroundColor: cellColor(val, minVal, maxVal, selectedMetric) }}
                      title={`${effectiveX}=${x}, ${effectiveY}=${y}\nSharpe: ${entry.metrics.sharpe.toFixed(2)}\nWin Rate: ${pct(entry.metrics.win_rate_pct)}\nPnL: ${pct(entry.metrics.total_pnl_pct)}\nDrawdown: ${pct(entry.metrics.max_drawdown_pct)}\nTrades: ${entry.metrics.total_trades}`}
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

      {bestCell && (
        <p className="text-xs text-gray-400 mt-2">
          Best combo highlighted ({METRIC_LABELS[selectedMetric]}: {
            metricValue(grid.get(bestCell)!.metrics[selectedMetric], selectedMetric)
          })
        </p>
      )}
    </div>
  )
}
