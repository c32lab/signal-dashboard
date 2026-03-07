import type { BacktestSummary } from '../../types/backtest'

export function pct(v: number | undefined | null, decimals = 1): string {
  return `${(v ?? 0).toFixed(decimals)}%`
}

export function daysBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

export function bestConfigName(summary: BacktestSummary[]): string | null {
  if (summary.length === 0) return null
  let best = summary[0]
  for (const s of summary) {
    if (s.total_pnl_pct > best.total_pnl_pct) best = s
  }
  return best.config
}
