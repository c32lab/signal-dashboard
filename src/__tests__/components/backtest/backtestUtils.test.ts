import { describe, it, expect } from 'vitest'
import { pct, daysBetween, bestConfigName } from '../../../components/backtest/backtestUtils'
import type { BacktestSummary } from '../../../types/backtest'

describe('backtestUtils', () => {
  describe('pct', () => {
    it('formats a number as percentage string with default 1 decimal', () => {
      expect(pct(55.678)).toBe('55.7%')
    })

    it('formats with custom decimal places', () => {
      expect(pct(55.678, 2)).toBe('55.68%')
    })

    it('handles zero', () => {
      expect(pct(0)).toBe('0.0%')
    })

    it('handles negative values', () => {
      expect(pct(-12.34)).toBe('-12.3%')
    })

    it('handles undefined/null by defaulting to 0', () => {
      expect(pct(undefined)).toBe('0.0%')
      expect(pct(null)).toBe('0.0%')
    })
  })

  describe('daysBetween', () => {
    it('calculates days between two dates', () => {
      expect(daysBetween('2026-01-01', '2026-01-08')).toBe(7)
    })

    it('returns 0 for same date', () => {
      expect(daysBetween('2026-03-01', '2026-03-01')).toBe(0)
    })

    it('handles ISO date strings', () => {
      expect(daysBetween('2026-01-01T00:00:00Z', '2026-01-02T00:00:00Z')).toBe(1)
    })
  })

  describe('bestConfigName', () => {
    it('returns config with highest total_pnl_pct', () => {
      const summary = [
        { config: 'A', total_pnl_pct: 10 },
        { config: 'B', total_pnl_pct: 25 },
        { config: 'C', total_pnl_pct: 15 },
      ] as BacktestSummary[]
      expect(bestConfigName(summary)).toBe('B')
    })

    it('returns null for empty array', () => {
      expect(bestConfigName([])).toBeNull()
    })

    it('handles single config', () => {
      const summary = [{ config: 'A', total_pnl_pct: 5 }] as BacktestSummary[]
      expect(bestConfigName(summary)).toBe('A')
    })

    it('handles negative pnl values', () => {
      const summary = [
        { config: 'A', total_pnl_pct: -5 },
        { config: 'B', total_pnl_pct: -2 },
      ] as BacktestSummary[]
      expect(bestConfigName(summary)).toBe('B')
    })
  })
})
