import { describe, it, expect } from 'vitest'
import { normalizeBacktestResults } from '../utils/backtestNormalizer'
import type { BacktestResult } from '../types/backtest'

// ── Fixtures ──

const formatAItem: BacktestResult = {
  generated_at: '2025-01-01T00:00:00Z',
  data_range: { start: '2024-12-01', end: '2025-01-01' },
  configs: {
    baseline: { weights: { momentum: 0.5 }, description: 'Baseline config' },
  },
  summary: [
    {
      config: 'baseline',
      total_trades: 100,
      win_rate_pct: 55,
      total_pnl_pct: 12.5,
      sharpe: 1.2,
      max_drawdown_pct: 8.3,
      signal_count: 100,
      win_count: 55,
      loss_count: 45,
    },
  ],
  by_symbol: {
    BTCUSDT: [
      {
        config: 'baseline',
        trades: 50,
        win_rate_pct: 60,
        total_pnl_pct: 8.0,
        sharpe: 1.5,
        max_drawdown_pct: 5.0,
      },
    ],
  },
  pnl_curve: {
    baseline: [
      { timestamp: '2024-12-15T00:00:00Z', cumulative_pnl_pct: 3.2 },
    ],
  },
}

const formatBItem = {
  meta: {
    generated_at: '2025-02-01T12:00:00Z',
    start_date: '2025-01-01',
    end_date: '2025-02-01',
  },
  configs: {
    aggressive: {
      description: 'Aggressive strategy',
      overall_1h: {
        count: 200,
        win_rate: 48,
        total_pnl: -3.5,
        sharpe: 0.8,
        max_drawdown: 15.2,
      },
      by_symbol_1h: [
        {
          label: 'ETHUSDT',
          count: 80,
          win_rate: 50,
          total_pnl: 2.1,
          sharpe: 1.0,
          max_drawdown: 7.5,
          long_count: 40,
          long_pnl: 3.0,
          short_count: 40,
          short_pnl: -0.9,
        },
      ],
    },
  },
}

// ── Tests ──

describe('normalizeBacktestResults', () => {
  describe('Format A (ab_test_latest.json style)', () => {
    it('passes through Format A objects unchanged', () => {
      const results = normalizeBacktestResults([formatAItem])
      expect(results).toHaveLength(1)
      expect(results[0]).toBe(formatAItem) // same reference
    })

    it('returns correct structure with all fields intact', () => {
      const result = normalizeBacktestResults([formatAItem])[0]
      expect(result.generated_at).toBe('2025-01-01T00:00:00Z')
      expect(result.data_range).toEqual({ start: '2024-12-01', end: '2025-01-01' })
      expect(result.configs.baseline.weights).toEqual({ momentum: 0.5 })
      expect(result.summary[0].total_trades).toBe(100)
      expect(result.by_symbol.BTCUSDT).toHaveLength(1)
      expect(result.pnl_curve.baseline).toHaveLength(1)
    })
  })

  describe('Format B (systematic_backtest.json style)', () => {
    it('converts Format B into BacktestResult', () => {
      const results = normalizeBacktestResults([formatBItem])
      expect(results).toHaveLength(1)
    })

    it('maps meta.generated_at → generated_at', () => {
      const result = normalizeBacktestResults([formatBItem])[0]
      expect(result.generated_at).toBe('2025-02-01T12:00:00Z')
    })

    it('maps meta.start_date/end_date → data_range', () => {
      const result = normalizeBacktestResults([formatBItem])[0]
      expect(result.data_range).toEqual({
        start: '2025-01-01',
        end: '2025-02-01',
      })
    })

    it('builds summary from overall_1h', () => {
      const summary = normalizeBacktestResults([formatBItem])[0].summary
      expect(summary).toHaveLength(1)
      expect(summary[0]).toMatchObject({
        config: 'aggressive',
        total_trades: 200,
        win_rate_pct: 48,
        total_pnl_pct: -3.5,
        sharpe: 0.8,
        max_drawdown_pct: 15.2,
        signal_count: 200,
      })
    })

    it('calculates win_count and loss_count from count × win_rate', () => {
      const summary = normalizeBacktestResults([formatBItem])[0].summary[0]
      // 200 * 48 / 100 = 96
      expect(summary.win_count).toBe(96)
      expect(summary.loss_count).toBe(104)
    })

    it('maps by_symbol_1h into by_symbol record', () => {
      const bySymbol = normalizeBacktestResults([formatBItem])[0].by_symbol
      expect(bySymbol.ETHUSDT).toHaveLength(1)
      expect(bySymbol.ETHUSDT[0]).toMatchObject({
        config: 'aggressive',
        trades: 80,
        win_rate_pct: 50,
        total_pnl_pct: 2.1,
        sharpe: 1.0,
        max_drawdown_pct: 7.5,
        long_count: 40,
        long_pnl_pct: 3.0,
        short_count: 40,
        short_pnl_pct: -0.9,
      })
    })

    it('sets pnl_curve to empty object', () => {
      const result = normalizeBacktestResults([formatBItem])[0]
      expect(result.pnl_curve).toEqual({})
    })
  })

  describe('Edge cases', () => {
    it('skips unknown format objects', () => {
      const results = normalizeBacktestResults([{ foo: 'bar' }])
      expect(results).toEqual([])
    })

    it('handles empty array', () => {
      expect(normalizeBacktestResults([])).toEqual([])
    })

    it('handles mixed array — returns only valid ones', () => {
      const results = normalizeBacktestResults([
        formatAItem,
        formatBItem,
        { unknown: true },
        42,
        null,
      ] as unknown[])
      expect(results).toHaveLength(2)
      expect(results[0]).toBe(formatAItem)
      expect(results[1].generated_at).toBe('2025-02-01T12:00:00Z')
    })

    it('handles missing/null fields in Format B gracefully', () => {
      const sparse = {
        meta: {},
        configs: {
          empty: {
            overall_1h: {},
          },
        },
      }
      const result = normalizeBacktestResults([sparse])[0]
      expect(result.generated_at).toBe('')
      expect(result.data_range).toEqual({ start: '', end: '' })
      expect(result.summary[0].total_trades).toBe(0)
      expect(result.summary[0].win_rate_pct).toBe(0)
      expect(result.summary[0].win_count).toBe(0)
      expect(result.summary[0].loss_count).toBe(0)
    })
  })
})
