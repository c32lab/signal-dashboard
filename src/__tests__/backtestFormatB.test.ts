import { describe, it, expect } from 'vitest'
import { isFormatB, convertFormatB } from '../utils/backtestFormatB'

describe('isFormatB', () => {
  it('returns true for format B data', () => {
    const data = {
      meta: { generated_at: '2026-01-01' },
      configs: { A: { overall_1h: { count: 10 } } },
    }
    expect(isFormatB(data)).toBe(true)
  })

  it('returns false for format A data', () => {
    const data = { summary: [], by_symbol: {}, pnl_curve: {} }
    expect(isFormatB(data)).toBeFalsy()
  })

  it('returns false for null', () => {
    expect(isFormatB(null)).toBeFalsy()
  })
})

describe('convertFormatB', () => {
  it('converts format B to BacktestResult', () => {
    const raw = {
      meta: { generated_at: '2026-01-01', start_date: '2025-12-01', end_date: '2026-01-01' },
      configs: {
        A: {
          description: 'Config A',
          overall_1h: { count: 100, win_rate: 55, total_pnl: 12.5, sharpe: 1.2, max_drawdown: 8 },
          by_symbol_1h: [
            { label: 'BTC', count: 50, win_rate: 60, total_pnl: 15, sharpe: 1.5, max_drawdown: 5 },
          ],
          by_regime_1h: {
            trending: { count: 30, win_rate: 58, total_pnl: 7, sharpe: 1.3, max_drawdown: 4 },
          },
        },
      },
    }
    const result = convertFormatB(raw)
    expect(result.generated_at).toBe('2026-01-01')
    expect(result.summary).toHaveLength(1)
    expect(result.summary[0].config).toBe('A')
    expect(result.summary[0].win_rate_pct).toBe(55)
    expect(result.by_symbol['BTC']).toHaveLength(1)
    expect(result.by_regime?.['trending']).toHaveLength(1)
  })

  it('handles missing data gracefully', () => {
    const raw = { meta: {}, configs: {} }
    const result = convertFormatB(raw)
    expect(result.summary).toEqual([])
    expect(result.by_symbol).toEqual({})
    expect(result.pnl_curve).toEqual({})
  })

  it('handles config without overall_1h', () => {
    const raw = {
      meta: {},
      configs: { B: { description: 'No overall' } },
    }
    const result = convertFormatB(raw)
    expect(result.summary).toEqual([])
    expect(result.configs['B'].description).toBe('No overall')
  })

  it('skips symbols with empty label', () => {
    const raw = {
      meta: {},
      configs: {
        A: {
          overall_1h: { count: 10, win_rate: 50, total_pnl: 5, sharpe: 0.5, max_drawdown: 2 },
          by_symbol_1h: [
            { label: '', count: 5 },
            { label: 'BTC', count: 5, win_rate: 50, total_pnl: 3, sharpe: 0.8, max_drawdown: 1 },
          ],
        },
      },
    }
    const result = convertFormatB(raw)
    expect(Object.keys(result.by_symbol)).toEqual(['BTC'])
  })

  it('handles multiple configs with regime data', () => {
    const raw = {
      meta: { generated_at: '2026-01-01', start_date: '2025-12-01', end_date: '2026-01-01' },
      configs: {
        A: {
          description: 'A',
          overall_1h: { count: 10, win_rate: 50, total_pnl: 5, sharpe: 1.0, max_drawdown: 3 },
          by_regime_1h: { trending: { count: 5, win_rate: 60, total_pnl: 3, sharpe: 1.2, max_drawdown: 1 } },
        },
        B: {
          description: 'B',
          overall_1h: { count: 20, win_rate: 55, total_pnl: 8, sharpe: 1.1, max_drawdown: 4 },
          by_regime_1h: { trending: { count: 10, win_rate: 65, total_pnl: 5, sharpe: 1.3, max_drawdown: 2 } },
        },
      },
    }
    const result = convertFormatB(raw)
    expect(result.summary).toHaveLength(2)
    expect(result.by_regime?.['trending']).toHaveLength(2)
  })

  it('includes long/short counts in by_symbol data', () => {
    const raw = {
      meta: {},
      configs: {
        A: {
          overall_1h: { count: 10, win_rate: 50, total_pnl: 5, sharpe: 1.0, max_drawdown: 3 },
          by_symbol_1h: [
            { label: 'BTC', count: 10, win_rate: 50, total_pnl: 5, sharpe: 1.0, max_drawdown: 3, long_count: 6, long_pnl: 3, short_count: 4, short_pnl: 2 },
          ],
        },
      },
    }
    const result = convertFormatB(raw)
    expect(result.by_symbol['BTC'][0].long_count).toBe(6)
    expect(result.by_symbol['BTC'][0].short_count).toBe(4)
  })

  it('omits by_regime when no regime data', () => {
    const raw = {
      meta: {},
      configs: { A: { overall_1h: { count: 10, win_rate: 50, total_pnl: 5, sharpe: 1.0, max_drawdown: 3 } } },
    }
    const result = convertFormatB(raw)
    expect(result.by_regime).toBeUndefined()
  })
})
