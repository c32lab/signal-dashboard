import { useState, useMemo } from 'react'
import type { PnlCurvePoint } from '../../types/backtest'

export function usePnlChartData(pnlCurve: Record<string, PnlCurvePoint[]>) {
  const configNames = Object.keys(pnlCurve)
  const [visible, setVisible] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(configNames.map((c) => [c, true]))
  )

  const toggle = (name: string) =>
    setVisible((prev) => ({ ...prev, [name]: !prev[name] }))

  const chartData = useMemo(() => {
    const allTimestamps = Array.from(
      new Set(configNames.flatMap((c) => pnlCurve[c].map((p) => p.timestamp)))
    ).sort()

    const lookups: Record<string, Record<string, number>> = {}
    for (const c of configNames) {
      lookups[c] = {}
      for (const pt of pnlCurve[c]) {
        lookups[c][pt.timestamp] = pt.cumulative_pnl_pct
      }
    }

    return allTimestamps.map((ts) => {
      const row: Record<string, string | number> = { timestamp: ts }
      for (const c of configNames) {
        if (visible[c] && lookups[c][ts] !== undefined) {
          row[c] = lookups[c][ts]
        }
      }
      return row
    })
  }, [configNames, pnlCurve, visible])

  const visibleConfigs = configNames.filter((c) => visible[c])

  return { configNames, visible, toggle, chartData, visibleConfigs }
}
