import type { BacktestResult } from '../types/backtest'
import { isFormatB, convertFormatB } from './backtestFormatB'

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Detect & normalize two known backtest JSON formats into BacktestResult[].
 *
 * Format A (ab_test_latest.json) — already matches BacktestResult.
 * Format B (systematic_backtest.json) — has `meta` + configs with `overall_1h`.
 */

function isFormatA(obj: any): boolean {
  return obj && Array.isArray(obj.summary) && obj.by_symbol && obj.pnl_curve
}

export function normalizeBacktestResults(rawResults: unknown[]): BacktestResult[] {
  const out: BacktestResult[] = []
  for (const item of rawResults) {
    if (isFormatA(item)) {
      out.push(item as BacktestResult)
    } else if (isFormatB(item)) {
      out.push(convertFormatB(item))
    }
    // unknown format → skip
  }
  return out
}
