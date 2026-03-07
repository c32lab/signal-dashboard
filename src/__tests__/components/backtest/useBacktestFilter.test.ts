import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBacktestFilter } from '../../../components/backtest/useBacktestFilter'
import type { BacktestResult } from '../../../types/backtest'

const makeResult = (): BacktestResult => ({
  generated_at: '2026-03-01T00:00:00Z',
  data_range: { start: '2026-01-01', end: '2026-03-01' },
  configs: {
    A: { weights: {}, description: 'Config A' },
  },
  summary: [
    { config: 'A', win_rate_pct: 55, total_pnl_pct: 10, sharpe: 1.0, max_drawdown_pct: 5, total_trades: 100, regime: 'trending' },
  ],
  by_symbol: {
    'BTC/USDT': [{ config: 'A', trades: 50, win_rate_pct: 60, total_pnl_pct: 15, sharpe: 1.5, regime: 'trending' }],
  },
  pnl_curve: {
    A: [{ timestamp: '2026-01-02', cumulative_pnl_pct: 1.0, regime: 'trending' }],
  },
})

describe('useBacktestFilter', () => {
  it('returns all data when regime is "all"', () => {
    const { result } = renderHook(() => useBacktestFilter(makeResult()))
    expect(result.current.selectedRegime).toBe('all')
    expect(result.current.filtered.summary).toHaveLength(1)
  })

  it('filters by regime when selected', () => {
    const { result } = renderHook(() => useBacktestFilter(makeResult()))
    act(() => { result.current.selectRegime('ranging') })
    expect(result.current.selectedRegime).toBe('ranging')
    expect(result.current.filtered.by_symbol).toEqual({})
  })

  it('resets page when regime changes', () => {
    const { result } = renderHook(() => useBacktestFilter(makeResult()))
    act(() => { result.current.setPage(3) })
    expect(result.current.page).toBe(3)
    act(() => { result.current.selectRegime('trending') })
    expect(result.current.page).toBe(1)
  })
})
