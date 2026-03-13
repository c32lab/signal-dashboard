import type { ForwardEvent } from './types'

function daysFromNow(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export const mockForwardEvents: ForwardEvent[] = [
  {
    event_id: 'fomc-2026-03',
    event_type: 'fomc_decision',
    category: 'macro',
    title: 'FOMC Interest Rate Decision',
    event_date: daysFromNow(2),
    days_until: 2,
    impact: 'high',
    direction: 'bullish',
    direction_probability: 0.62,
    avg_move_pct: 3.2,
    volatility_expected: 4.5,
    confidence: 0.71,
    sample_count: 24,
    reasoning:
      'Historical FOMC decisions in similar rate environments have led to bullish crypto reactions 62% of the time, with an average 3.2% upward move within 24h.',
  },
  {
    event_id: 'cpi-2026-03',
    event_type: 'cpi_release',
    category: 'macro',
    title: 'CPI Release',
    event_date: daysFromNow(4),
    days_until: 4,
    impact: 'high',
    direction: 'bearish',
    direction_probability: 0.58,
    avg_move_pct: 2.1,
    volatility_expected: 3.8,
    confidence: 0.64,
    sample_count: 18,
    reasoning:
      'CPI prints above expectation have historically triggered risk-off moves. 58% of analogous releases resulted in bearish BTC price action.',
  },
  {
    event_id: 'sol-unlock-2026-03',
    event_type: 'token_unlock',
    category: 'crypto',
    title: 'SOL Token Unlock',
    event_date: daysFromNow(1),
    days_until: 1,
    impact: 'medium',
    direction: 'bearish',
    direction_probability: 0.71,
    avg_move_pct: 5.4,
    volatility_expected: 6.2,
    confidence: 0.55,
    sample_count: 8,
    reasoning:
      'Large token unlocks for SOL have historically preceded sell pressure. 71% of similar unlocks led to a bearish move within 48h.',
  },
  {
    event_id: 'eth-upgrade-2026-03',
    event_type: 'hard_fork',
    category: 'crypto',
    title: 'ETH Network Upgrade',
    event_date: daysFromNow(5),
    days_until: 5,
    impact: 'medium',
    direction: 'bullish',
    direction_probability: 0.65,
    avg_move_pct: 4.1,
    volatility_expected: 5.0,
    confidence: 0.60,
    sample_count: 12,
    reasoning:
      'Network upgrades have generally been bullish catalysts for ETH. 65% of prior upgrades saw positive price action in the following week.',
  },
  {
    event_id: 'nfp-2026-03',
    event_type: 'nfp_report',
    category: 'macro',
    title: 'NFP Report',
    event_date: daysFromNow(6),
    days_until: 6,
    impact: 'high',
    direction: 'neutral',
    direction_probability: 0.45,
    avg_move_pct: 1.8,
    volatility_expected: 3.2,
    confidence: 0.50,
    sample_count: 22,
    reasoning:
      'Non-Farm Payroll reports show mixed directional signal for crypto. The split is near even with 45% bullish outcome probability.',
  },
  {
    event_id: 'btc-etf-expiry-2026-03',
    event_type: 'options_expiry',
    category: 'crypto',
    title: 'BTC ETF Options Expiry',
    event_date: daysFromNow(3),
    days_until: 3,
    impact: 'low',
    direction: 'neutral',
    direction_probability: 0.50,
    avg_move_pct: 0.9,
    volatility_expected: 1.5,
    confidence: 0.30,
    sample_count: 3,
    reasoning:
      'Insufficient historical data for BTC ETF options expiry events. Only 3 prior occurrences available.',
  },
]
