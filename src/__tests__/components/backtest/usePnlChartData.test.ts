import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePnlChartData } from '../../../components/backtest/usePnlChartData'

const pnlCurve = {
  A: [
    { timestamp: '2026-01-01', cumulative_pnl_pct: 1.0, regime: 'all' },
    { timestamp: '2026-01-02', cumulative_pnl_pct: 2.5, regime: 'all' },
  ],
  B: [
    { timestamp: '2026-01-01', cumulative_pnl_pct: 0.5, regime: 'all' },
    { timestamp: '2026-01-02', cumulative_pnl_pct: 1.0, regime: 'all' },
  ],
}

describe('usePnlChartData', () => {
  it('returns all configs as visible initially', () => {
    const { result } = renderHook(() => usePnlChartData(pnlCurve))
    expect(result.current.configNames).toEqual(['A', 'B'])
    expect(result.current.visible).toEqual({ A: true, B: true })
    expect(result.current.visibleConfigs).toEqual(['A', 'B'])
  })

  it('merges chart data from all configs', () => {
    const { result } = renderHook(() => usePnlChartData(pnlCurve))
    expect(result.current.chartData).toHaveLength(2)
    expect(result.current.chartData[0]).toEqual({
      timestamp: '2026-01-01',
      A: 1.0,
      B: 0.5,
    })
  })

  it('toggles config visibility', () => {
    const { result } = renderHook(() => usePnlChartData(pnlCurve))
    act(() => { result.current.toggle('A') })
    expect(result.current.visible.A).toBe(false)
    expect(result.current.visibleConfigs).toEqual(['B'])
  })

  it('excludes hidden config data from chartData', () => {
    const { result } = renderHook(() => usePnlChartData(pnlCurve))
    act(() => { result.current.toggle('B') })
    expect(result.current.chartData[0]).toEqual({
      timestamp: '2026-01-01',
      A: 1.0,
    })
  })
})
