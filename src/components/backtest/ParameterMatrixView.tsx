import { useMemo, useState, useRef, useEffect } from 'react'
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

function CellPopover({ entry, effectiveX, effectiveY, x, y, onClose }: {
  entry: ParamMatrixEntry
  effectiveX: string
  effectiveY: string
  x: number
  y: number
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  return (
    <div ref={ref} className="absolute z-50 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl text-xs text-gray-200 min-w-[200px]" role="dialog" aria-label="Cell details">
      <div className="font-semibold text-gray-100 mb-2">Cell Details</div>
      <div className="space-y-1">
        <div><span className="text-gray-400">{effectiveX}:</span> {x}</div>
        <div><span className="text-gray-400">{effectiveY}:</span> {y}</div>
        <hr className="border-gray-700 my-1" />
        <div><span className="text-gray-400">Sharpe:</span> <span className="font-mono">{entry.sharpe.toFixed(2)}</span></div>
        <div><span className="text-gray-400">Win Rate:</span> <span className="font-mono">{entry.win_rate.toFixed(1)}%</span></div>
        <div><span className="text-gray-400">PnL:</span> <span className="font-mono">{entry.pnl.toFixed(2)}</span></div>
        <div><span className="text-gray-400">Return:</span> <span className="font-mono">{(entry.return_pct * 100).toFixed(1)}%</span></div>
        <div><span className="text-gray-400">Trades:</span> <span className="font-mono">{entry.trades}</span></div>
        <div><span className="text-gray-400">Wins:</span> <span className="font-mono">{entry.wins}</span></div>
      </div>
      <button onClick={onClose} className="mt-2 text-gray-500 hover:text-gray-300 text-[10px]">Close</button>
    </div>
  )
}

export default function ParameterMatrixView() {
  const { data, isLoading } = useParamMatrix()
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('sharpe')
  const [selectedSymbol, setSelectedSymbol] = useState<string>('')
  const [xAxis, setXAxis] = useState<string>('')
  const [yAxis, setYAxis] = useState<string>('')
  const [popoverCell, setPopoverCell] = useState<string | null>(null)

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

  const bestEntry = useMemo(() => {
    if (!symbolData) return null
    return [...symbolData.results].sort((a, b) => b.sharpe - a.sharpe)[0] ?? null
  }, [symbolData])

  const topConfigs = useMemo(() => {
    if (!symbolData) return []
    return [...symbolData.results].sort((a, b) => b.sharpe - a.sharpe).slice(0, 5)
  }, [symbolData])

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-gray-800 rounded" />
  }

  if (!data || symbols.length === 0) return null

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-300 mb-3">Parameter Matrix Heatmap</h2>

      {/* Best Parameters summary card */}
      {bestEntry && (
        <div className="mb-4 bg-gray-800 border border-yellow-500/30 rounded-lg p-3" data-testid="best-params-card">
          <div className="text-xs font-semibold text-yellow-400 mb-1">Best Parameters</div>
          <div className="flex flex-wrap gap-4 text-xs text-gray-200">
            <span className="font-mono">
              {Object.entries(bestEntry.params).map(([k, v]) => `${k}=${v}`).join(', ')}
            </span>
            <span>Sharpe: <span className="font-mono text-green-400">{bestEntry.sharpe.toFixed(2)}</span></span>
            <span>Win Rate: <span className="font-mono">{bestEntry.win_rate.toFixed(1)}%</span></span>
            <span>PnL: <span className="font-mono">{bestEntry.pnl.toFixed(2)}</span></span>
            <span>Trades: <span className="font-mono">{bestEntry.trades}</span></span>
          </div>
        </div>
      )}

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
        <>
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
                          className={`px-3 py-2 text-center font-mono cursor-pointer hover:ring-1 hover:ring-blue-400 relative ${isBest ? 'ring-2 ring-yellow-400 font-bold' : ''}`}
                          style={{ backgroundColor: cellColor(val, minVal, maxVal) }}
                          onClick={() => setPopoverCell(popoverCell === key ? null : key)}
                        >
                          {metricValue(val, selectedMetric)}
                          {popoverCell === key && (
                            <CellPopover
                              entry={entry}
                              effectiveX={effectiveX}
                              effectiveY={effectiveY}
                              x={x}
                              y={y}
                              onClose={() => setPopoverCell(null)}
                            />
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Color scale legend */}
          <div className="flex items-center gap-2 mt-2" data-testid="color-legend">
            <span className="text-[10px] text-gray-500">Low</span>
            <div className="flex h-3 rounded overflow-hidden" style={{ width: 120 }}>
              {Array.from({ length: 10 }, (_, i) => {
                const t = i / 9
                const fakeVal = minVal + t * (maxVal - minVal)
                return <div key={i} className="flex-1" style={{ backgroundColor: cellColor(fakeVal, minVal, maxVal) }} />
              })}
            </div>
            <span className="text-[10px] text-gray-500">High</span>
            <span className="text-[10px] text-gray-500 ml-1">({METRIC_LABELS[selectedMetric]})</span>
          </div>
        </>
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
          <h3 className="text-xs font-semibold text-gray-400 mb-2">Top 5 Configurations</h3>
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
